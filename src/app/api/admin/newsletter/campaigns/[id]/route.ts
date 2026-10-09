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

interface Ctx {
  params: Promise<{ id: string }>
}

/** GET — single campaign */
export async function GET(_req: Request, { params }: Ctx) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { id } = await params

  const { data, error } = await auth.supabase
    .from('newsletter_campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Campaign পাওয়া যায়নি' }, { status: 404 })
  }
  return NextResponse.json({ campaign: data })
}

/** PATCH — update draft (subject/body). Body: { subject?, body_text? } */
export async function PATCH(req: Request, { params }: Ctx) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { id } = await params

  let body: { subject?: unknown; body_text?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const updates: Record<string, string> = {}
  if (typeof body.subject === 'string' && body.subject.trim()) {
    updates.subject = body.subject.trim().slice(0, 120)
  }
  if (typeof body.body_text === 'string' && body.body_text.trim()) {
    const t = body.body_text.trim().slice(0, 20000)
    updates.body_text = t
    const esc = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    updates.body_html = esc
      .split(/\n{2,}/)
      .map((p) => `<p style="margin:0 0 14px 0;font-size:15px;">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('\n')
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { error } = await auth.supabase
    .from('newsletter_campaigns')
    .update(updates)
    .eq('id', id)
    .eq('status', 'draft')

  if (error) {
    return NextResponse.json({ error: 'Update failed (শুধু draft এডিট করা যায়)' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
