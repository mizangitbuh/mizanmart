// ═══════════════════════════════════════════════
// New Support Message — admin notification email
// Sent when a customer sends a chat message (Phase 12E)
// Best-effort: never blocks the chat itself
// ═══════════════════════════════════════════════

import {
  baseEmailTemplate,
  emailRow,
  emailInfoBox,
  BRAND_PINK,
  BRAND_TEXT,
  BRAND_MUTED,
} from '../base-template'

interface NewSupportMessageInput {
  customer: {
    name: string
    email: string
    phone?: string | null
  }
  messagePreview: string
  orderNumber?: string | null
  customerId: string
  unreadCount: number
  siteUrl: string
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function newSupportMessageEmail(
  input: NewSupportMessageInput
): { subject: string; html: string } {
  const { customer, messagePreview, orderNumber, customerId, unreadCount, siteUrl } = input

  const preview =
    messagePreview.length > 300 ? messagePreview.slice(0, 300) + '…' : messagePreview

  const detailsTable = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
      ${emailRow('Customer', escapeHtml(customer.name))}
      ${emailRow('Email', escapeHtml(customer.email))}
      ${customer.phone ? emailRow('Phone', escapeHtml(customer.phone)) : ''}
      ${orderNumber ? emailRow('Order', escapeHtml(orderNumber)) : ''}
      ${unreadCount > 1 ? emailRow('Unread in thread', String(unreadCount)) : ''}
    </table>
  `

  const body = `
    <p style="margin:0 0 8px 0;font-size:15px;color:${BRAND_TEXT};">
      <strong>${escapeHtml(customer.name)}</strong> sent you a new support message:
    </p>

    <div style="margin:16px 0;padding:14px 16px;background:#F8FAFC;border:1px solid #E2E8F0;border-left:4px solid ${BRAND_PINK};border-radius:8px;">
      <div style="font-size:14px;color:${BRAND_TEXT};white-space:pre-wrap;">${escapeHtml(preview)}</div>
    </div>

    ${detailsTable}

    ${emailInfoBox(
      `💬 Reply quickly to keep customers happy — open the conversation in your admin inbox.`,
      'pink'
    )}

    <p style="margin:16px 0 0 0;font-size:12px;color:${BRAND_MUTED};">
      You're receiving this because a customer messaged support. Max 1 email per customer per 5 minutes.
    </p>
  `

  const html = baseEmailTemplate({
    title: 'New support message',
    intro: '',
    body,
    cta: {
      label: 'Open Conversation',
      url: `${siteUrl}/admin/conversations/${customerId}`,
    },
    footerNote: `
      — The Martivo Support System<br/>
      Need help? Contact us at
      <a href="mailto:martivocom@gmail.com" style="color:${BRAND_PINK};text-decoration:none;font-weight:600;">martivocom@gmail.com</a>.
    `,
    siteUrl,
  })

  const subject = `💬 New support message from ${customer.name}`

  return { subject, html }
}
