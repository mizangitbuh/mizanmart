import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { OrderTrackingTimeline } from '@/components/shop/OrderTrackingTimeline'
import { AskAboutOrderButton } from '@/components/support/AskAboutOrderButton'
import { ArrowLeft, Package, MapPin, Phone, Mail, CreditCard, Clock, CheckCircle, Download } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  confirmed: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
}

const timelineSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'shipped', label: 'Shipped', icon: Package },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
]

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!order) notFound()

  const currentStepIndex = timelineSteps.findIndex((s) => s.key === order.status)
  const isCancelled = order.status === 'cancelled'

  const address = order.shipping_address as any

  return (
    <div className="space-y-5">
      {/* Back */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm font-medium hover:text-[var(--color-primary)]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft size={16} />
        Back to Orders
      </Link>

      {/* Header */}
      <div
        className="p-5 rounded-[var(--radius-lg)] border flex flex-wrap items-center justify-between gap-3"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div>
          <div className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Order Number
          </div>
          <div className="font-mono font-black text-xl" style={{ color: 'var(--color-text)' }}>
            {order.order_number}
          </div>
          <div className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
            <Clock size={11} />
            {new Date(order.created_at).toLocaleString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={statusVariants[order.status] || 'default'}>
            {order.status.toUpperCase()}
          </Badge>
          <AskAboutOrderButton orderId={order.id} orderNumber={order.order_number} />
          <a
            href={`/api/orders/${order.id}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] text-xs font-bold border transition hover:opacity-80"
            style={{
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)',
              background: 'transparent',
            }}
          >
            <Download size={12} />
            Invoice
          </a>
        </div>
      </div>

      {/* Bengali Visual Live Order Tracking Timeline */}
      <OrderTrackingTimeline
        status={order.status}
        orderNumber={order.order_number}
        createdAt={order.created_at}
      />

      {/* Items */}
      <div
        className="rounded-[var(--radius-lg)] border overflow-hidden"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="font-black text-sm" style={{ color: 'var(--color-text)' }}>
            Items ({order.order_items?.length || 0})
          </h3>
        </div>
        <div>
          {order.order_items?.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 border-b last:border-0"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium line-clamp-1" style={{ color: 'var(--color-text)' }}>
                  {item.product_name}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {formatPrice(Number(item.price))} × {item.quantity}
                </div>
              </div>
              <div className="text-sm font-bold ml-4" style={{ color: 'var(--color-text)' }}>
                {formatPrice(Number(item.subtotal))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Address + Payment */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Shipping */}
        <div
          className="p-5 rounded-[var(--radius-lg)] border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h3 className="font-black text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
            Delivery Address
          </h3>
          <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
              {order.customer_name}
            </div>
            <div className="flex items-center gap-2">
              <Phone size={12} /> {order.customer_phone}
            </div>
            {order.customer_email && (
              <div className="flex items-center gap-2">
                <Mail size={12} /> {order.customer_email}
              </div>
            )}
            <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              {address?.address}<br />
              {address?.city}
            </div>
            {order.notes && (
              <div className="pt-2 text-xs italic" style={{ color: 'var(--color-text-muted)' }}>
                Note: {order.notes}
              </div>
            )}
          </div>
        </div>

        {/* Payment */}
        <div
          className="p-5 rounded-[var(--radius-lg)] border"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <h3 className="font-black text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <CreditCard size={16} style={{ color: 'var(--color-primary)' }} />
            Payment
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>Method</span>
              <span className="font-medium uppercase" style={{ color: 'var(--color-text)' }}>
                {order.payment_method}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>Status</span>
              <Badge
                variant={order.payment_status === 'paid' ? 'success' : 'warning'}
                size="sm"
              >
                {order.payment_status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div
        className="p-5 rounded-[var(--radius-lg)] border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <h3 className="font-black text-sm mb-4" style={{ color: 'var(--color-text)' }}>Order Summary</h3>
        <div className="space-y-2 text-sm max-w-sm ml-auto">
          <div className="flex justify-between">
            <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
            <span style={{ color: 'var(--color-text)' }}>{formatPrice(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--color-text-muted)' }}>Delivery</span>
            <span style={{ color: Number(order.shipping_cost) === 0 ? 'var(--color-success)' : 'var(--color-text)' }}>
              {Number(order.shipping_cost) === 0 ? 'FREE' : formatPrice(Number(order.shipping_cost))}
            </span>
          </div>
          <div
            className="flex justify-between text-lg font-black border-t pt-3 mt-2"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span style={{ color: 'var(--color-text)' }}>Total</span>
            <span style={{ color: 'var(--color-primary)' }}>{formatPrice(Number(order.total))}</span>
          </div>
        </div>
      </div>

      <Link
        href="/products"
        className="inline-block px-6 py-3 rounded-full font-bold text-sm text-white transition"
        style={{ background: 'var(--color-primary)' }}
      >
        Continue Shopping
      </Link>
    </div>
  )
}
