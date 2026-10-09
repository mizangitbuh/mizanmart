import { Resend } from 'resend'

const RESEND_API_KEY = process.env.RESEND_API_KEY

if (!RESEND_API_KEY) {
  console.warn('[email] RESEND_API_KEY is not set — emails will not send')
}

export const resend = RESEND_API_KEY
  ? new Resend(RESEND_API_KEY)
  : null

export const EMAIL_FROM =
  process.env.EMAIL_FROM || 'onboarding@resend.dev'

export const EMAIL_FROM_NAME =
  process.env.EMAIL_FROM_NAME || 'Martivo'

export const EMAIL_REPLY_TO =
  process.env.EMAIL_REPLY_TO || EMAIL_FROM

/**
 * Format the "from" field like: Martivo <noreply@example.com>
 */
export function getFromAddress(): string {
  return `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`
}

interface SendEmailInput {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: { name: string; value: string }[]
}

interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Send an email via Resend.
 * Never throws — best-effort, logs errors.
 */
export async function sendEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  if (!resend) {
    console.error('[email] Resend not configured — skipping send')
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const result = await resend.emails.send({
      from: getFromAddress(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo || EMAIL_REPLY_TO,
      tags: input.tags,
    })

    if (result.error) {
      console.error('[email] Send failed:', result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true, id: result.data?.id }
  } catch (err) {
    console.error('[email] Exception:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

/**
 * Check if email is configured (for conditional flows).
 */
export function isEmailConfigured(): boolean {
  return resend !== null
}
