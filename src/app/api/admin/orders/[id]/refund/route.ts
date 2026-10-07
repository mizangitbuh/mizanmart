import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

const refundSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().min(1).max(100),
  note: z.string().max(500).nullable().optional(),
})

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }),
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Not authorized' }, { status: 403 }),
    }
  }

  return {
    ok: true as const,
    supabase,
    user: { id: user.id, email: profile.email ?? user.email ?? null },
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => ({}))
  const parsed = refundSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.issues },
      { status: 400 }
    )
  }
  const { amount, reason, note } = parsed.data

  // Load order
  const { data: order, error: loadErr } = await auth.supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (loadErr || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Payment must be paid
  if (order.payment_status !== 'paid' && order.payment_status !== 'refunded') {
    return NextResponse.json(
      { error: `Cannot refund — payment status is "${order.payment_status}"` },
      { status: 422 }
    )
  }

  const orderTotal = Number(order.total)
  const alreadyRefunded = Number(order.refund_amount || 0)
  const remaining = Math.max(0, orderTotal - alreadyRefunded)

  if (amount > remaining) {
    return NextResponse.json(
      {
        error: `Refund amount exceeds refundable balance`,
        requested: amount,
        remaining,
      },
      { status: 422 }
    )
  }

  const newRefundTotal = alreadyRefunded + amount
  const isFullRefund = newRefundTotal >= orderTotal
  const now = new Date().toISOString()

  // Build update
  const updatePayload: Record<string, unknown> = {
    refund_amount: newRefundTotal,
    refund_reason: reason,
    refunded_at: now,
    updated_at: now,
  }

  // If full refund → set payment_status to refunded
  if (isFullRefund) {
    updatePayload.payment_status = 'refunded'
  }

  const { data: after, error: updateErr } = await auth.supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  // Audit
  await logAudit({
    action: 'order.refund',
    entityType: 'order',
    entityId: id,
    entityName: order.order_number,
    changes: {
      refund_amount: { old: alreadyRefunded, new: newRefundTotal },
      last_refund: { old: null, new: amount },
      refund_reason: { old: order.refund_reason, new: reason },
      payment_status: isFullRefund
        ? { old: order.payment_status, new: 'refunded' }
        : { old: order.payment_status, new: order.payment_status },
    },
    metadata: {
      note: note || null,
      is_full_refund: isFullRefund,
      refunded_by: auth.user.id,
      refunded_by_email: auth.user.email,
      performed_at: now,
    },
  })

  return NextResponse.json({
    success: true,
    order: after,
    refunded: amount,
    total_refunded: newRefundTotal,
    is_full_refund: isFullRefund,
  })
}
