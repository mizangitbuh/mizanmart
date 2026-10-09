import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'

// Abuse safety: 20 unsub attempts per 10 min per IP
const unsubLimiter = createRateLimiter({
  maxRequests: 20,
  windowMs: 10 * 60 * 1000,
})

interface Ctx {
  params: Promise<{ token: string }>
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * POST /api/newsletter/unsubscribe/[token]
 * Token-based, idempotent. No auth needed (link in email).
 */
export async function POST(req: Request, { params }: Ctx) {
  const ip = getClientIp(req)
  const rl = unsubLimiter.check(`unsub:${ip}`)
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: 'Too many attempts — try later' }, { status: 429 })
  }

  const { token } = await params
  if (!token || !UUID_RE.test(token)) {
    return NextResponse.json({ success: false, error: 'Invalid link' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: sub } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, status')
    .eq('unsubscribe_token', token)
    .maybeSingle()

  if (!sub) {
    return NextResponse.json({ success: false, error: 'Link আর valid নয়' }, { status: 404 })
  }

  const row = sub as { id: string; email: string; status: string }
  if (row.status === 'unsubscribed') {
    return NextResponse.json({ success: true, alreadyUnsubscribed: true, email: maskEmail(row.email) })
  }

  await supabase
    .from('newsletter_subscribers')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .eq('id', row.id)

  return NextResponse.json({ success: true, email: maskEmail(row.email) })
}

/** j***@gmail.com — don't fully expose the address in JSON. */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const head = (local || '').slice(0, 1) || '*'
  return `${head}***@${domain}`
}
