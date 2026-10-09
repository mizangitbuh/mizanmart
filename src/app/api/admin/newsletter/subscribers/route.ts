import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false as const, response: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if ((profile as { role?: string } | null)?.role !== 'admin') {
    return { ok: false as const, response: NextResponse.json({ error: 'Not authorized' }, { status: 403 }) }
  }
  return { ok: true as const, supabase }
}

/**
 * DELETE /api/admin/newsletter/subscribers?id=xxx
 * Hard delete a subscriber (admin only).
 */
export async function DELETE(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const id = new URL(req.url).searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const { error } = await auth.supabase.from('newsletter_subscribers').delete().eq('id', id)
  if (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
