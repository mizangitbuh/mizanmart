import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createRateLimiter, getClientIp } from '@/lib/rate-limit'

// Spec: 5 signups per 10 min per IP
const subscribeLimiter = createRateLimiter({
  maxRequests: 5,
  windowMs: 10 * 60 * 1000,
})

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * POST /api/newsletter/subscribe
 * Body: { email, name? }
 * Public — idempotent, never leaks whether email existed.
 * No email is sent here (Phase 13E handles welcome if needed).
 */
export async function POST(req: Request) {
  // ─── Rate limit by IP ───
  const ip = getClientIp(req)
  const rl = subscribeLimiter.check(`newsletter:${ip}`)
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'অনেকবার চেষ্টা করেছেন — ১০ মিনিট পর আবার চেষ্টা করুন' },
      { status: 429 }
    )
  }

  let body: { email?: unknown; name?: unknown }
  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : null

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { success: false, error: 'সঠিক ইমেইল দিন (valid email required)' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // Logged-in user? Link subscriber row (optional)
  let userId: string | null = null
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userId = user?.id ?? null
  } catch {
    userId = null
  }

  // ─── Check existing ───
  const { data: existing } = await supabase
    .from('newsletter_subscribers')
    .select('id, status')
    .eq('email', email)
    .maybeSingle()

  if (existing) {
    const row = existing as { id: string; status: string }
    if (row.status === 'active') {
      return NextResponse.json({ success: true, alreadySubscribed: true })
    }
    // Reactivate unsubscribed / bounced
    await supabase
      .from('newsletter_subscribers')
      .update({
        status: 'active',
        unsubscribed_at: null,
        name: name || undefined,
        user_id: userId || undefined,
        source: 'footer',
      })
      .eq('id', row.id)
    return NextResponse.json({ success: true, reactivated: true })
  }

  // ─── New subscriber ───
  const { error } = await supabase.from('newsletter_subscribers').insert({
    email,
    name: name || null,
    status: 'active',
    user_id: userId,
    source: 'footer',
  })

  if (error) {
    // Race: someone subscribed concurrently → treat as success
    if (/duplicate|unique/i.test(error.message)) {
      return NextResponse.json({ success: true, alreadySubscribed: true })
    }
    console.error('[newsletter] subscribe failed:', error.message)
    return NextResponse.json(
      { success: false, error: 'সাবস্ক্রাইব করা যায়নি — আবার চেষ্টা করুন' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
