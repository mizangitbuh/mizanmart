// ═══════════════════════════════════════════════
// Base Email Template — reusable wrapper
// All transactional emails use this layout
// ═══════════════════════════════════════════════

export const BRAND_PINK = '#D6336C'
export const BRAND_DARK = '#0F172A'
export const BRAND_TEXT = '#1E293B'
export const BRAND_MUTED = '#64748B'
export const BRAND_BORDER = '#E2E8F0'
export const BRAND_BG = '#F8FAFC'

export interface BaseTemplateOptions {
  /** Main heading inside email (h1) */
  title: string
  /** Optional subtitle / intro paragraph */
  intro?: string
  /** Main HTML body content */
  body: string
  /** Optional CTA button { label, url } */
  cta?: { label: string; url: string }
  /** Optional footer note (small text below content) */
  footerNote?: string
  /** Base URL for site (for logo/footer links) */
  siteUrl?: string
}

export function baseEmailTemplate(opts: BaseTemplateOptions): string {
  const site = opts.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://martivo.com'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND_BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${BRAND_TEXT};line-height:1.5;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND_BG};padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Main card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px 32px;border-bottom:1px solid ${BRAND_BORDER};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="display:inline-block;width:44px;height:44px;background:${BRAND_PINK};border-radius:10px;color:#ffffff;font-weight:900;font-size:22px;text-align:center;line-height:44px;font-family:Arial,sans-serif;">M</div>
                  </td>
                  <td style="vertical-align:middle;padding-left:12px;">
                    <div style="font-size:22px;font-weight:900;letter-spacing:-0.02em;color:${BRAND_DARK};font-family:Arial,sans-serif;">
                      <span style="color:${BRAND_PINK};">M</span>artivo
                    </div>
                    <div style="font-size:11px;color:${BRAND_MUTED};margin-top:2px;">
                      Quality products. Better prices.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">

              <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:800;color:${BRAND_DARK};letter-spacing:-0.01em;">
                ${escapeHtml(opts.title)}
              </h1>

              ${opts.intro ? `
              <p style="margin:0 0 24px 0;font-size:15px;color:${BRAND_TEXT};">
                ${opts.intro}
              </p>
              ` : ''}

              ${opts.body}

              ${opts.cta ? `
              <div style="margin:32px 0 8px 0;">
                <a href="${escapeAttr(opts.cta.url)}"
                   style="display:inline-block;background:${BRAND_PINK};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:8px;font-family:Arial,sans-serif;">
                  ${escapeHtml(opts.cta.label)}
                </a>
              </div>
              ` : ''}

              ${opts.footerNote ? `
              <p style="margin:32px 0 0 0;font-size:13px;color:${BRAND_MUTED};padding-top:24px;border-top:1px solid ${BRAND_BORDER};">
                ${opts.footerNote}
              </p>
              ` : ''}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background-color:${BRAND_BG};border-top:1px solid ${BRAND_BORDER};text-align:center;">
              <div style="font-size:12px;color:${BRAND_MUTED};margin-bottom:8px;">
                Need help? Email us at
                <a href="mailto:martivocom@gmail.com" style="color:${BRAND_PINK};text-decoration:none;font-weight:600;">martivocom@gmail.com</a>
              </div>
              <div style="font-size:11px;color:${BRAND_MUTED};">
                © ${new Date().getFullYear()} Martivo. All rights reserved.
              </div>
              <div style="font-size:11px;color:${BRAND_MUTED};margin-top:4px;">
                <a href="${escapeAttr(site)}" style="color:${BRAND_MUTED};text-decoration:underline;">martivo.com</a>
              </div>
            </td>
          </tr>

        </table>

        <!-- Small print -->
        <div style="max-width:600px;margin-top:16px;font-size:11px;color:${BRAND_MUTED};text-align:center;">
          This email was sent to you because you have an account at Martivo.
        </div>

      </td>
    </tr>
  </table>

</body>
</html>`
}

// ─── Helpers ───
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(s: string): string {
  return escapeHtml(s)
}

// ─── Reusable row (label + value) ───
export function emailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:6px 0;font-size:13px;color:${BRAND_MUTED};">${escapeHtml(label)}</td>
      <td style="padding:6px 0;font-size:13px;color:${BRAND_TEXT};text-align:right;font-weight:600;">${value}</td>
    </tr>
  `
}

// ─── Reusable product row ───
export function emailProductRow(
  name: string,
  qty: number,
  unitPrice: string,
  total: string
): string {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${BRAND_BORDER};font-size:14px;color:${BRAND_TEXT};">
        ${escapeHtml(name)}
        <div style="font-size:12px;color:${BRAND_MUTED};margin-top:2px;">
          ${qty} × ${unitPrice}
        </div>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid ${BRAND_BORDER};font-size:14px;color:${BRAND_TEXT};text-align:right;font-weight:700;">
        ${total}
      </td>
    </tr>
  `
}

// ─── Info box (colored callout) ───
export function emailInfoBox(
  text: string,
  color: 'pink' | 'green' | 'amber' = 'pink'
): string {
  const colors = {
    pink: { bg: '#FCE7F3', border: '#F9A8D4', text: '#9D174D' },
    green: { bg: '#DCFCE7', border: '#86EFAC', text: '#166534' },
    amber: { bg: '#FEF3C7', border: '#FCD34D', text: '#92400E' },
  }
  const c = colors[color]
  return `
    <div style="padding:14px 16px;background:${c.bg};border:1px solid ${c.border};border-radius:8px;margin:20px 0;">
      <div style="font-size:13px;color:${c.text};font-weight:600;">
        ${text}
      </div>
    </div>
  `
}
