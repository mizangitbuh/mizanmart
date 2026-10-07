import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'
import {
  isValidStatus,
  isValidPaymentStatus,
  canTransition,
  type OrderStatus,
} from '@/lib/orders/status-machine'

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
    .select('role')
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
    user: { id: user.id, email: user.email ?? null },
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { data: order, error } = await auth.supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json({ order })
}

const patchSchema = z.object({
  status: z.string().optional(),
  payment_status: z.string().optional(),
  notes: z.string().max(2000).nullable().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => ({}))
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.issues },
      { status: 400 }
    )
  }
  const patch = parsed.data

  if (patch.status !== undefined && !isValidStatus(patch.status)) {
    return NextResponse.json({ error: `Invalid status: ${patch.status}` }, { status: 400 })
  }
  if (patch.payment_status !== undefined && !isValidPaymentStatus(patch.payment_status)) {
    return NextResponse.json(
      { error: `Invalid payment_status: ${patch.payment_status}` },
      { status: 400 }
    )
  }

  const { data: before, error: loadErr } = await auth.supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (loadErr || !before) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (patch.status !== undefined && patch.status !== before.status) {
    const from = before.status as OrderStatus
    const to = patch.status as OrderStatus
    if (!canTransition(from, to)) {
      return NextResponse.json(
        {
          error: `Cannot change status from "${from}" to "${to}"`,
          currentStatus: from,
          attempted: to,
        },
        { status: 422 }
      )
    }
  }

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (patch.status !== undefined) updatePayload.status = patch.status
  if (patch.payment_status !== undefined) updatePayload.payment_status = patch.payment_status
  if (patch.notes !== undefined) updatePayload.notes = patch.notes

  const { data: after, error: updateErr } = await auth.supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  const changes: Record<string, { old: unknown; new: unknown }> = {}
  if (patch.status !== undefined && patch.status !== before.status) {
    changes.status = { old: before.status, new: patch.status }
  }
  if (patch.payment_status !== undefined && patch.payment_status !== before.payment_status) {
    changes.payment_status = { old: before.payment_status, new: patch.payment_status }
  }
  if (patch.notes !== undefined && patch.notes !== before.notes) {
    changes.notes = { old: before.notes, new: patch.notes }
  }

  if (Object.keys(changes).length > 0) {
    await logAudit({
      action: 'order.update',
      entityType: 'order',
      entityId: id,
      entityName: after.order_number,
      changes,
      metadata: {
        updated_by: auth.user.id,
        updated_by_email: auth.user.email,
        performed_at: new Date().toISOString(),
      },
    })
  }

  return NextResponse.json({ success: true, order: after })
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Hard delete disabled. Set status="cancelled" instead.' },
    { status: 405 }
  )
}
