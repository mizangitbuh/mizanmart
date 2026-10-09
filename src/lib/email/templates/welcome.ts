import {
  baseEmailTemplate,
  BRAND_PINK,
  BRAND_TEXT,
  BRAND_MUTED,
  BRAND_BORDER,
} from '../base-template'

interface WelcomeInput {
  user: {
    name: string
    email: string
  }
  siteUrl: string
}

function firstName(name: string): string {
  return (name || '').trim().split(' ')[0] || 'there'
}

export function welcomeEmail(
  input: WelcomeInput
): { subject: string; html: string } {
  const { user, siteUrl } = input
  const name = firstName(user.name)

  const benefitsCard = `
    <div style="margin:24px 0;padding:4px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${BRAND_BORDER};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:40px;vertical-align:top;">
                  <div style="width:32px;height:32px;border-radius:8px;background:#FCE7F3;text-align:center;line-height:32px;font-size:16px;">🛍️</div>
                </td>
                <td style="vertical-align:top;padding-left:12px;">
                  <div style="font-size:14px;font-weight:700;color:${BRAND_TEXT};margin-bottom:2px;">Shop Quality Products</div>
                  <div style="font-size:13px;color:${BRAND_MUTED};">Curated selection across cosmetics, clothing, electronics, and more.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid ${BRAND_BORDER};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:40px;vertical-align:top;">
                  <div style="width:32px;height:32px;border-radius:8px;background:#FCE7F3;text-align:center;line-height:32px;font-size:16px;">❤️</div>
                </td>
                <td style="vertical-align:top;padding-left:12px;">
                  <div style="font-size:14px;font-weight:700;color:${BRAND_TEXT};margin-bottom:2px;">Save Your Favorites</div>
                  <div style="font-size:13px;color:${BRAND_MUTED};">Add items to your wishlist and never lose track of what you love.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:40px;vertical-align:top;">
                  <div style="width:32px;height:32px;border-radius:8px;background:#FCE7F3;text-align:center;line-height:32px;font-size:16px;">🚚</div>
                </td>
                <td style="vertical-align:top;padding-left:12px;">
                  <div style="font-size:14px;font-weight:700;color:${BRAND_TEXT};margin-bottom:2px;">Fast &amp; Free Delivery</div>
                  <div style="font-size:13px;color:${BRAND_MUTED};">Free delivery on orders over ৳1000 — anywhere in Bangladesh.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `

  const body = `
    <p style="margin:0 0 20px 0;font-size:15px;color:${BRAND_TEXT};">
      Hi <strong>${name}</strong>,<br/><br/>
      Welcome to <strong>Martivo</strong>! 🎉 We're thrilled to have you on board.
    </p>

    <p style="margin:0 0 8px 0;font-size:14px;color:${BRAND_TEXT};">
      Your account is ready. Here's what you can do:
    </p>

    ${benefitsCard}

    <p style="margin:20px 0 0 0;font-size:14px;color:${BRAND_TEXT};">
      Start exploring our collection — we think you'll love what you find. If you have any questions, just reply to this email.
    </p>
  `

  const html = baseEmailTemplate({
    title: 'Welcome to Martivo!',
    intro: '',
    body,
    cta: {
      label: 'Start Shopping',
      url: `${siteUrl}/products`,
    },
    footerNote: `
      Glad to have you with us!<br/>
      — The Martivo Team
      <br/><br/>
      Need help? Contact us at
      <a href="mailto:martivocom@gmail.com" style="color:${BRAND_PINK};text-decoration:none;font-weight:600;">martivocom@gmail.com</a>.
    `,
    siteUrl,
  })

  const subject = `🎉 Welcome to Martivo, ${name}!`

  return { subject, html }
}
