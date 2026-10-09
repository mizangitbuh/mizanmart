import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail, isEmailConfigured } from '@/lib/email/client'
import { baseEmailTemplate, emailInfoBox } from '@/lib/email/base-template'

export async function POST() {
  // Only allow logged-in users (safety)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (!user.email) {
    return NextResponse.json({ error: 'User has no email' }, { status: 400 })
  }

  // ⚠️ Resend test mode: onboarding@resend.dev can only send
  // to the Resend account owner's email. When domain is verified,
  // change this to user.email.
  const sendTo =
    process.env.EMAIL_TEST_TO || 'mizankhhn@gmail.com'

  if (!isEmailConfigured()) {
    return NextResponse.json(
      {
        error: 'Email not configured',
        hint: 'RESEND_API_KEY missing from .env.local',
      },
      { status: 500 }
    )
  }

  const html = baseEmailTemplate({
    title: 'Email setup test',
    intro: `Hi ${sendTo.split('@')[0]},<br/><br/>This is a test email from your Martivo setup. If you're reading this, your Resend integration is working correctly! 🎉`,
    body: `
      <div style="margin:24px 0;padding:20px;background:#F8FAFC;border-radius:8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#64748B;">Status</td>
            <td style="padding:4px 0;font-size:13px;color:#166534;text-align:right;font-weight:700;">✅ Working</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#64748B;">From</td>
            <td style="padding:4px 0;font-size:13px;color:#1E293B;text-align:right;font-weight:600;">onboarding@resend.dev</td>
          </tr>
          <tr>
            <td style="padding:4px 0;font-size:13px;color:#64748B;">Sent at</td>
            <td style="padding:4px 0;font-size:13px;color:#1E293B;text-align:right;font-weight:600;">${new Date().toISOString()}</td>
          </tr>
        </table>
      </div>
      ${emailInfoBox('💡 <strong>Next step:</strong> Domain verify করলে customer email-এও পাঠানো যাবে।', 'pink')}
    `,
    footerNote:
      'This is a system test email. No action required. If you didn\'t expect this, please ignore it.',
  })

  const result = await sendEmail({
    to: sendTo,
    subject: '✅ Martivo email setup test',
    html,
    tags: [{ name: 'category', value: 'test' }],
  })

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || 'Send failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    messageId: result.id,
    sentTo: sendTo,
  })
}
