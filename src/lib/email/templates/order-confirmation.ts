import {
  baseEmailTemplate,
  emailRow,
  emailProductRow,
  emailInfoBox,
  BRAND_PINK,
  BRAND_TEXT,
  BRAND_MUTED,
  BRAND_BORDER,
} from '../base-template'

interface OrderItem {
  product_name: string
  quantity: number
  price: number
  subtotal: number
}

interface OrderConfirmationInput {
  order: {
    id: string
    order_number: string
    created_at: string
    customer_name: string
    customer_email: string | null
    shipping_address: {
      address?: string
      city?: string
    } | null
    payment_method: string
    payment_status: string
    subtotal: number
    shipping_cost: number
    discount: number
    total: number
    coupon_code?: string | null
  }
  items: OrderItem[]
  siteUrl: string
}

function formatPrice(n: number): string {
  return 'BDT ' + Number(n || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function orderConfirmationEmail(
  input: OrderConfirmationInput
): { subject: string; html: string } {
  const { order, items, siteUrl } = input

  const firstName = (order.customer_name || '').trim().split(' ')[0] || 'there'

  const itemsHtml = items
    .map((it) =>
      emailProductRow(
        it.product_name,
        it.quantity,
        formatPrice(it.price),
        formatPrice(it.subtotal)
      )
    )
    .join('')

  const totalsHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
      ${emailRow('Subtotal', formatPrice(order.subtotal))}
      ${emailRow(
        'Shipping',
        order.shipping_cost === 0 ? 'FREE' : formatPrice(order.shipping_cost)
      )}
      ${
        order.discount > 0
          ? emailRow(
              `Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}`,
              `- ${formatPrice(order.discount)}`
            )
          : ''
      }
      <tr>
        <td style="padding:14px 0 0 0;border-top:2px solid ${BRAND_BORDER};font-size:16px;font-weight:800;color:${BRAND_TEXT};">
          Total Paid
        </td>
        <td style="padding:14px 0 0 0;border-top:2px solid ${BRAND_BORDER};font-size:16px;font-weight:800;color:${BRAND_PINK};text-align:right;">
          ${formatPrice(order.total)}
        </td>
      </tr>
    </table>
  `

  const shippingHtml = order.shipping_address
    ? `
      <div style="margin-top:24px;padding:16px;background:#F8FAFC;border-radius:8px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${BRAND_MUTED};margin-bottom:8px;">
          Shipping Address
        </div>
        <div style="font-size:14px;color:${BRAND_TEXT};line-height:1.5;">
          <strong>${order.customer_name}</strong><br/>
          ${order.shipping_address.address || ''}<br/>
          ${order.shipping_address.city || ''}
        </div>
      </div>
    `
    : ''

  const orderInfoBox = `
    <div style="margin:20px 0;padding:16px;background:#F8FAFC;border-radius:8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${emailRow('Order Number', `<span style="font-family:monospace;">${order.order_number}</span>`)}
        ${emailRow('Order Date', formatDate(order.created_at))}
        ${emailRow('Payment Method', (order.payment_method || 'cod').toUpperCase())}
      </table>
    </div>
  `

  const body = `
    <p style="margin:0 0 20px 0;font-size:15px;color:${BRAND_TEXT};">
      Hi <strong>${firstName}</strong>,<br/><br/>
      Thank you for your order! We've received it and will process it shortly. You'll receive another email when your order ships.
    </p>

    ${orderInfoBox}

    ${emailInfoBox(
      '📦 <strong>What happens next?</strong> Our team will review your order and confirm it within a few hours. You can track your order anytime from your account.',
      'pink'
    )}

    <div style="margin:24px 0 8px 0;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${BRAND_MUTED};margin-bottom:12px;">
        Order Items
      </div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${itemsHtml}
      </table>
    </div>

    ${totalsHtml}

    ${shippingHtml}
  `

  const html = baseEmailTemplate({
    title: 'Order Confirmed',
    intro: '',
    body,
    cta: {
      label: 'View Order Details',
      url: `${siteUrl}/account/orders/${order.id}`,
    },
    footerNote: `
      Questions? Reply to this email or contact us at
      <a href="mailto:martivocom@gmail.com" style="color:${BRAND_PINK};text-decoration:none;font-weight:600;">martivocom@gmail.com</a>.
      <br/><br/>
      Thanks for shopping with us!<br/>
      — The Martivo Team
    `,
    siteUrl,
  })

  const subject = `Order Confirmed — #${order.order_number}`

  return { subject, html }
}
