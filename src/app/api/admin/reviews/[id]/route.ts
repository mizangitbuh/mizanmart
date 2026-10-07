import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

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

const patchSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  admin_note: z.string().max(500).nullable().optional(),
})

// PATCH — moderate review
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

  const { data: before } = await auth.supabase
    .from('reviews')
    .select('id, status, admin_note, product_id, rating')
    .eq('id', id)
    .single()

  if (!before) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  const { data: after, error } = await auth.supabase
    .from('reviews')
    .update({
      status: parsed.data.status,
      admin_note: parsed.data.admin_note ?? before.admin_note ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const changes: Record<string, { old: unknown; new: unknown }> = {}
  if (before.status !== after.status) {
    changes.status = { old: before.status, new: after.status }
  }
  if ((before.admin_note || null) !== (after.admin_note || null)) {
    changes.admin_note = { old: before.admin_note, new: after.admin_note }
  }

  if (Object.keys(changes).length > 0) {
    await logAudit({
      action: 'review.moderate',
      entityType: 'product',
      entityId: after.product_id,
      entityName: `Review #${after.id.slice(0, 8)}`,
      changes,
      metadata: {
        review_id: after.id,
        rating: after.rating,
        moderated_by: auth.user.id,
        moderated_by_email: auth.user.email,
        performed_at: new Date().toISOString(),
      },
    })
  }

  return NextResponse.json({ success: true, review: after })
}

// DELETE — hard delete
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { data: before } = await auth.supabase
    .from('reviews')
    .select('id, product_id, rating, status')
    .eq('id', id)
    .single()

  if (!before) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  const { error } = await auth.supabase
    .from('reviews')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logAudit({
    action: 'review.delete',
    entityType: 'product',
    entityId: before.product_id,
    entityName: `Review #${before.id.slice(0, 8)}`,
    changes: {
      deleted: { old: before, new: null },
    },
    metadata: {
      review_id: before.id,
      rating: before.rating,
      deleted_by: auth.user.id,
      deleted_by_email: auth.user.email,
    },
  })

  return NextResponse.json({ success: true })
}
