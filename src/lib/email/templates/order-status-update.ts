import {
  baseEmailTemplate,
  emailRow,
  emailInfoBox,
  BRAND_PINK,
  BRAND_TEXT,
  BRAND_MUTED,
  BRAND_BORDER,
} from '../base-template'

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

interface OrderStatusUpdateInput {
  order: {
    id: string
    order_number: string
    created_at: string
    customer_name: string
    total: number
    payment_method: string
    shipping_address: {
      address?: string
      city?: string
    } | null
  }
  newStatus: OrderStatus
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

// ─── Status-specific content ───
function getStatusContent(status: OrderStatus) {
  const map: Record<
    OrderStatus,
    {
      subject: string
      heading: string
      message: string
      emoji: string
      badgeColor: 'pink' | 'green' | 'amber'
      infoText: string
    }
  > = {
    pending: {
      subject: 'Order pending',
      heading: 'Order Pending',
      message:
        'We have received your order and will confirm it shortly. You will get another email once it\'s confirmed.',
      emoji: '⏳',
      badgeColor: 'amber',
      infoText: 'Your order is awaiting confirmation. This usually takes a few hours.',
    },
    confirmed: {
      subject: 'Order confirmed',
      heading: 'Order Confirmed',
      message:
        'Great news! Your order has been confirmed and is now being prepared for shipment.',
      emoji: '✅',
      badgeColor: 'green',
      infoText: '📦 <strong>What happens next?</strong> We\'ll pack your order and ship it soon. You\'ll receive a shipping notification when it\'s on the way.',
    },
    shipped: {
      subject: 'Order shipped',
      heading: 'Your Order Has Shipped',
      message:
        'Your order is on the way! It has been handed over to our delivery partner and will arrive soon.',
      emoji: '🚚',
      badgeColor: 'green',
      infoText: '🚚 <strong>Delivery in progress.</strong> Expect delivery within 1-3 business days depending on your location.',
    },
    delivered: {
      subject: 'Order delivered',
      heading: 'Order Delivered',
      message:
        'Your order has been successfully delivered. We hope you love it!',
      emoji: '📦',
      badgeColor: 'green',
      infoText: '⭐ <strong>Enjoying your purchase?</strong> We\'d love to hear your thoughts — leave a review on the product page!',
    },
    cancelled: {
      subject: 'Order cancelled',
      heading: 'Order Cancelled',
      message:
        'Your order has been cancelled. If you didn\'t request this or have questions, please contact us.',
      emoji: '❌',
      badgeColor: 'pink',
      infoText: '💬 <strong>Questions?</strong> Reply to this email or contact us at martivocom@gmail.com and we\'ll help you right away.',
    },
  }
  return map[status]
}

export function orderStatusUpdateEmail(
  input: OrderStatusUpdateInput
): { subject: string; html: string } {
  const { order, newStatus, siteUrl } = input
  const content = getStatusContent(newStatus)

  const firstName =
    (order.customer_name || '').trim().split(' ')[0] || 'there'

  const orderInfoBox = `
    <div style="margin:20px 0;padding:16px;background:#F8FAFC;border-radius:8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${emailRow(
          'Order Number',
          `<span style="font-family:monospace;">${order.order_number}</span>`
        )}
        ${emailRow('Order Date', formatDate(order.created_at))}
        ${emailRow('Status', `<span style="color:${BRAND_PINK};font-weight:700;">${content.emoji} ${content.heading}</span>`)}
        ${emailRow('Total', formatPrice(order.total))}
      </table>
    </div>
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

  const body = `
    <p style="margin:0 0 20px 0;font-size:15px;color:${BRAND_TEXT};">
      Hi <strong>${firstName}</strong>,<br/><br/>
      ${content.message}
    </p>

    ${orderInfoBox}

    ${emailInfoBox(content.infoText, content.badgeColor)}

    ${shippingHtml}
  `

  const html = baseEmailTemplate({
    title: content.heading,
    intro: '',
    body,
    cta: {
      label: 'View Order',
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

  const subject = `${content.emoji} ${content.subject} — #${order.order_number}`

  return { subject, html }
}
