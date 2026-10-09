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
  return { ok: true as const, supabase, user }
}

/**
 * GET /api/admin/newsletter/campaigns — list (latest first, cap 100)
 */
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { data, error } = await auth.supabase
    .from('newsletter_campaigns')
    .select('id, subject, status, recipient_count, sent_count, failed_count, created_at, sent_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: 'Failed to load campaigns' }, { status: 500 })
  }
  return NextResponse.json({ campaigns: data || [] })
}

/**
 * POST /api/admin/newsletter/campaigns — create draft
 * Body: { subject, body_text, recipient_scope?: 'all' | 'new30' }
 */
export async function POST(req: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  let body: { subject?: unknown; body_text?: unknown; recipient_scope?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const subject = typeof body.subject === 'string' ? body.subject.trim().slice(0, 120) : ''
  const bodyText = typeof body.body_text === 'string' ? body.body_text.trim().slice(0, 20000) : ''
  const scope = body.recipient_scope === 'new30' ? 'new30' : 'all'

  if (!subject) {
    return NextResponse.json({ error: 'Subject আবশ্যক' }, { status: 400 })
  }
  if (!bodyText) {
    return NextResponse.json({ error: 'Body আবশ্যক' }, { status: 400 })
  }

  const bodyHtml = textToHtml(bodyText)

  const { data, error } = await auth.supabase
    .from('newsletter_campaigns')
    .insert({
      subject,
      body_html: bodyHtml,
      body_text: bodyText,
      status: 'draft',
      created_by: auth.user.id,
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[newsletter] campaign create failed:', error?.message)
    return NextResponse.json({ error: 'Campaign তৈরি করা যায়নি' }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: (data as { id: string }).id, recipient_scope: scope })
}

/** Plain text → safe HTML paragraphs (shared with send route). */
export function textToHtml(text: string): string {
  const esc = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return esc
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px 0;font-size:15px;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('\n')
}
