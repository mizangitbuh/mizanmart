import {
  baseEmailTemplate,
  emailInfoBox,
  BRAND_TEXT,
  BRAND_MUTED,
} from '../base-template'

interface ReviewApprovedInput {
  review: {
    rating: number
    title: string | null
    body: string | null
  }
  product: {
    name: string
    slug: string
  }
  customerName?: string | null
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

function renderStars(rating: number): string {
  const filled = Math.max(0, Math.min(5, Math.round(rating)))
  let stars = ''
  for (let i = 1; i <= 5; i++) {
    stars += i <= filled ? '★' : '☆'
  }
  return stars
}

export function reviewApprovedEmail(
  input: ReviewApprovedInput
): { subject: string; html: string } {
  const { review, product, siteUrl } = input

  const firstName =
    (input.customerName || '').trim().split(' ')[0] || 'there'

  const reviewCard = `
    <div style="margin:20px 0;padding:20px;background:#F8FAFC;border-radius:8px;border:1px solid #E2E8F0;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${BRAND_MUTED};margin-bottom:8px;">
        Your Review — ${escapeHtml(product.name)}
      </div>
      <div style="font-size:18px;color:#F59E0B;letter-spacing:2px;margin-bottom:8px;">
        ${renderStars(review.rating)}
      </div>
      ${
        review.title
          ? `<div style="font-size:15px;font-weight:700;color:${BRAND_TEXT};margin-bottom:6px;">${escapeHtml(review.title)}</div>`
          : ''
      }
      ${
        review.body
          ? `<div style="font-size:14px;color:${BRAND_TEXT};line-height:1.6;">${escapeHtml(review.body)}</div>`
          : ''
      }
    </div>
  `

  const body = `
    <p style="margin:0 0 20px 0;font-size:15px;color:${BRAND_TEXT};">
      Hi <strong>${escapeHtml(firstName)}</strong>,<br/><br/>
      Thank you for sharing your thoughts on <strong>${escapeHtml(product.name)}</strong>! Your review has been approved and is now live on our store for other shoppers to see.
    </p>

    ${reviewCard}

    ${emailInfoBox(
      '💬 <strong>Your opinion matters.</strong> Honest reviews help other customers shop with confidence — thank you for being part of our community!',
      'green'
    )}
  `

  const html = baseEmailTemplate({
    title: 'Your review is live!',
    intro: '',
    body,
    cta: {
      label: 'See Your Review',
      url: `${siteUrl}/product/${product.slug}#reviews`,
    },
    footerNote: `
      Thanks for shopping with us!<br/>
      — The Martivo Team
    `,
    siteUrl,
  })

  const subject = `⭐ Your review is now live — ${product.name}`

  return { subject, html }
}
