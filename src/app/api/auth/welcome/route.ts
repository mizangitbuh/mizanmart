import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, isEmailConfigured } from '@/lib/email/client'
import { welcomeEmail } from '@/lib/email/templates/welcome'

// Simple in-memory rate limit: 1 welcome email per email address
const recentSends = new Map<string, number>()
const COOLDOWN_MS = 60_000 // 1 minute

function cleanupOldEntries() {
  const now = Date.now()
  for (const [key, timestamp] of recentSends) {
    if (now - timestamp > COOLDOWN_MS) recentSends.delete(key)
  }
}

export async function POST(request: Request) {
  // Authenticated-only
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: 'Email not configured' },
      { status: 500 }
    )
  }

  // Rate limit: same email cannot receive welcome twice within 1 minute
  cleanupOldEntries()
  const lastSent = recentSends.get(user.email)
  if (lastSent && Date.now() - lastSent < COOLDOWN_MS) {
    return NextResponse.json(
      { success: true, skipped: 'rate-limited' },
      { status: 200 }
    )
  }

  // Pull name from user metadata (set during signUp)
  const meta = (user.user_metadata || {}) as Record<string, unknown>
  const name =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    user.email.split('@')[0]

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    new URL(request.url).origin ||
    'http://localhost:3000'

  const { subject, html } = welcomeEmail({
    user: {
      name: String(name),
      email: user.email,
    },
    siteUrl,
  })

  const result = await sendEmail({
    to: user.email,
    subject,
    html,
    tags: [{ name: 'category', value: 'welcome' }],
  })

  if (!result.success) {
    console.error('[welcome] Email failed:', result.error)
    return NextResponse.json(
      { error: result.error || 'Send failed' },
      { status: 500 }
    )
  }

  recentSends.set(user.email, Date.now())
  console.log('[welcome] Email sent:', result.id)

  return NextResponse.json({ success: true, messageId: result.id })
}
