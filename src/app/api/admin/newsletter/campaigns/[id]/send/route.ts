import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/client'
import { baseEmailTemplate, BRAND_PINK } from '@/lib/email/base-template'

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

interface SubscriberRow {
  id: string
  email: string
  name: string | null
  unsubscribe_token: string
  subscribed_at: string
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * POST /api/admin/newsletter/campaigns/[id]/send
 * Body: { recipient_scope?: 'all' | 'new30', confirm?: boolean }
 * Requires confirm:true. Batches of 50, 1s pause between batches.
 * Per-recipient failures never stop the batch.
 */
export async function POST(req: Request, { params }: Ctx) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { id } = await params

  let body: { recipient_scope?: unknown; confirm?: unknown }
  try {
    body = (await req.json().catch(() => ({}))) as typeof body
  } catch {
    body = {}
  }
  const scope = body.recipient_scope === 'new30' ? 'new30' : 'all'

  if (body.confirm !== true) {
    return NextResponse.json({ error: 'Confirmation required (confirm:true পাঠান)' }, { status: 400 })
  }

  const { data: campaign, error: campError } = await auth.supabase
    .from('newsletter_campaigns')
    .select('id, subject, body_html, status')
    .eq('id', id)
    .single()

  if (campError || !campaign) {
    return NextResponse.json({ error: 'Campaign পাওয়া যায়নি' }, { status: 404 })
  }
  const camp = campaign as { id: string; subject: string; body_html: string; status: string }
  if (camp.status === 'sending') {
    return NextResponse.json({ error: 'Campaign ইতিমধ্যে sending অবস্থায় আছে' }, { status: 409 })
  }

  let query = auth.supabase
    .from('newsletter_subscribers')
    .select('id, email, name, unsubscribe_token, subscribed_at')
    .eq('status', 'active')
    .order('subscribed_at', { ascending: true })
    .limit(5000)

  if (scope === 'new30') {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    query = query.gte('subscribed_at', cutoff)
  }

  const { data: subs, error: subError } = await query
  if (subError) {
    return NextResponse.json({ error: 'Subscribers লোড করা যায়নি' }, { status: 500 })
  }
  const recipients = ((subs || []) as unknown) as SubscriberRow[]

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'কোনো active subscriber নেই' }, { status: 400 })
  }

  await auth.supabase
    .from('newsletter_campaigns')
    .update({ status: 'sending', recipient_count: recipients.length, sent_count: 0, failed_count: 0 })
    .eq('id', id)

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('origin') || 'https://martivo.com'

  let sent = 0
  let failed = 0
  const errors: Array<{ email: string; error: string }> = []

  const BATCH = 50
  for (let i = 0; i < recipients.length; i += BATCH) {
    const batch = recipients.slice(i, i + BATCH)
    await Promise.all(
      batch.map(async (sub) => {
        const unsubUrl = `${siteUrl}/newsletter/unsubscribe/${sub.unsubscribe_token}`
        const firstName = (sub.name || '').trim().split(' ')[0]
        const greeting = firstName
          ? `<p style="margin:0 0 16px 0;font-size:15px;">Hi <strong>${escapeHtml(firstName)}</strong>,</p>`
          : ''
        const fullBody = `${greeting}${camp.body_html}
          <div style="margin:28px 0 0 0;padding-top:20px;border-top:1px solid #E2E8F0;">
            <p style="margin:0;font-size:12px;color:#64748B;text-align:center;">
              এই ইমেইল পেতে চান না?
              <a href="${unsubUrl}" style="color:${BRAND_PINK};text-decoration:underline;font-weight:600;">Unsubscribe করুন</a>
            </p>
          </div>`
        const html = baseEmailTemplate({
          title: 'Martivo Newsletter',
          intro: '',
          body: fullBody,
          footerNote: `— The Martivo Team<br/>Need help? <a href="mailto:martivocom@gmail.com" style="color:${BRAND_PINK};text-decoration:none;font-weight:600;">martivocom@gmail.com</a>`,
          siteUrl,
        })
        try {
          const result = await sendEmail({ to: sub.email, subject: camp.subject, html })
          if (result.success) {
            sent += 1
            auth.supabase
              .from('newsletter_subscribers')
              .update({ last_email_sent_at: new Date().toISOString() })
              .eq('id', sub.id)
              .then()
          } else {
            failed += 1
            errors.push({ email: sub.email, error: result.error || 'send failed (test mode?)' })
          }
        } catch (err) {
          failed += 1
          errors.push({ email: sub.email, error: err instanceof Error ? err.message : 'unknown' })
        }
      })
    )
    if (i + BATCH < recipients.length) {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }

  const finalStatus = sent > 0 ? 'sent' : 'failed'
  await auth.supabase
    .from('newsletter_campaigns')
    .update({ status: finalStatus, sent_count: sent, failed_count: failed, sent_at: new Date().toISOString() })
    .eq('id', id)

  if (errors.length > 0) {
    console.error(`[newsletter] campaign ${id}: ${failed} failed. First 10:`, errors.slice(0, 10))
  }

  return NextResponse.json({
    success: true,
    status: finalStatus,
    recipient_count: recipients.length,
    sent_count: sent,
    failed_count: failed,
    testModeHint:
      failed > 0
        ? 'কিছু মেইল যায়নি — Resend test mode-এ শুধু owner email-এ যায়। Domain verify করলে bulk send কাজ করবে।'
        : undefined,
  })
}
