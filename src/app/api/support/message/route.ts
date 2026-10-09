import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/client'
import { newSupportMessageEmail } from '@/lib/email/templates/new-support-message'
import { getStoreSettings } from '@/lib/settings'

// ─── In-memory cooldown: max 1 admin email per customer per 5 minutes ───
// (Same in-memory approach as lib/rate-limit.ts — fine for small business.)
const COOLDOWN_MS = 5 * 60 * 1000
const lastSentAt = new Map<string, number>()

setInterval(() => {
  const now = Date.now()
  for (const [key, ts] of lastSentAt.entries()) {
    if (now - ts > COOLDOWN_MS) lastSentAt.delete(key)
  }
}, COOLDOWN_MS)

interface Body {
  messageId?: string
}

/**
 * POST /api/support/message
 * Body: { messageId }
 *
 * Called (fire-and-forget) by ChatWidget after the customer saves a message.
 * Sends a notification email to the admin — best-effort, never fails the chat.
 */
export async function POST(req: Request) {
  let body: Body
  try {
    body = (await req.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.messageId) {
    return NextResponse.json({ error: 'messageId required' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Fetch the message — RLS ensures customers only see their own
  const { data: msg, error: msgError } = await supabase
    .from('messages')
    .select('id, customer_id, order_id, sender_role, body, created_at')
    .eq('id', body.messageId)
    .single()

  if (msgError || !msg) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 })
  }

  // Only notify for the customer's own customer-sent messages
  if (msg.customer_id !== user.id || msg.sender_role !== 'customer') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  // ─── Rate limit: 1 email per customer per 5 min ───
  const now = Date.now()
  const last = lastSentAt.get(user.id)
  if (last && now - last < COOLDOWN_MS) {
    return NextResponse.json({ success: true, skipped: 'rate-limited' }, { status: 200 })
  }
  lastSentAt.set(user.id, now)

  try {
    // Customer profile for name/phone
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single()

    const customerName =
      (profile as any)?.full_name || user.email?.split('@')[0] || 'Customer'
    const customerEmail = (profile as any)?.email || user.email || ''

    // Order number if this is an order-specific thread
    let orderNumber: string | null = null
    if ((msg as any).order_id) {
      const { data: order } = await supabase
        .from('orders')
        .select('order_number')
        .eq('id', (msg as any).order_id)
        .single()
      orderNumber = (order as any)?.order_number ?? null
    }

    // Unread count in this thread (for context)
    const { count: unreadCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', user.id)
      .eq('sender_role', 'customer')
      .is('read_at', null)

    // Admin recipient — store setting, fallback to default
    let adminEmail = 'martivocom@gmail.com'
    try {
      const settings = await getStoreSettings()
      if (settings.support_email) adminEmail = settings.support_email
    } catch {
      // keep fallback
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      req.headers.get('origin') ||
      'https://martivo.com'

    const { subject, html } = newSupportMessageEmail({
      customer: {
        name: customerName,
        email: customerEmail,
        phone: (profile as any)?.phone ?? null,
      },
      messagePreview: (msg as any).body,
      orderNumber,
      customerId: user.id,
      unreadCount: unreadCount || 1,
      siteUrl,
    })

    const result = await sendEmail({ to: adminEmail, subject, html })
    return NextResponse.json({ success: result.success })
  } catch (err) {
    // Non-blocking: log and still return success so chat never breaks
    console.error('[support-email] failed:', err)
    return NextResponse.json({ success: false }, { status: 200 })
  }
}
