import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { OrderStatusFlow } from '@/components/admin/OrderStatusFlow'
import { PaymentStatusFlow } from '@/components/admin/PaymentStatusFlow'
import { RefundSummary } from '@/components/admin/RefundSummary'
import { OrderTimeline, type AuditLogEntry } from '@/components/admin/OrderTimeline'
import { ChatWithCustomerButton } from '@/components/admin/ChatWithCustomerButton'
import { ArrowLeft, User, MapPin, Package, Printer } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()

  if (!order) notFound()

  const { data: logsRaw } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('entity_type', 'order')
    .or(`entity_id.eq.${id},entity_id.ilike.%${id}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  const logs: AuditLogEntry[] = (logsRaw || []) as AuditLogEntry[]

  const discount = Number((order as any).discount || 0)
  const couponCode = (order as any).coupon_code || null

  return (
    <div className="max-w-6xl">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm mb-4 hover:opacity-80 transition"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-2xl md:text-3xl font-black font-mono mb-1"
            style={{ color: 'var(--color-text)' }}
          >
            {order.order_number}
          </h1>
          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {new Date(order.created_at).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <ChatWithCustomerButton
            customerId={(order as any).user_id ?? null}
            orderId={order.id}
            orderNumber={order.order_number}
          />
          <a
            href={`/api/admin/orders/${order.id}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold border transition hover:opacity-80"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              background: 'var(--color-surface)',
            }}
          >
            <Printer size={12} />
            Print Invoice
          </a>
          <OrderStatusFlow orderId={order.id} currentStatus={order.status} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div
              className="p-5 rounded-[var(--radius-lg)] border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <User size={14} style={{ color: 'var(--color-primary)' }} />
                <h2
                  className="text-xs font-black uppercase tracking-wide"
                  style={{ color: 'var(--color-text)' }}
                >
                  Customer
                </h2>
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-semibold" style={{ color: 'var(--color-text)' }}>
                  {order.customer_name || '—'}
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  📞 {order.customer_phone || '—'}
                </div>
                {order.customer_email && (
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    ✉️ {order.customer_email}
                  </div>
                )}
              </div>
            </div>

            <div
              className="p-5 rounded-[var(--radius-lg)] border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} style={{ color: 'var(--color-primary)' }} />
                <h2
                  className="text-xs font-black uppercase tracking-wide"
                  style={{ color: 'var(--color-text)' }}
                >
                  Shipping
                </h2>
              </div>
              <div className="space-y-1 text-sm">
                <div style={{ color: 'var(--color-text)' }}>
                  {order.shipping_address?.address || '—'}
                </div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  {order.shipping_address?.city || ''}
                </div>
                {order.notes && (
                  <div className="pt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Note: {order.notes}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className="p-5 rounded-[var(--radius-lg)] border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Package size={14} style={{ color: 'var(--color-primary)' }} />
              <h2
                className="text-xs font-black uppercase tracking-wide"
                style={{ color: 'var(--color-text)' }}
              >
                Items ({order.order_items?.length || 0})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th
                      className="text-left pb-3 text-[10px] font-black uppercase tracking-wide"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Product
                    </th>
                    <th
                      className="text-right pb-3 text-[10px] font-black uppercase tracking-wide"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Price
                    </th>
                    <th
                      className="text-center pb-3 text-[10px] font-black uppercase tracking-wide"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Qty
                    </th>
                    <th
                      className="text-right pb-3 text-[10px] font-black uppercase tracking-wide"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.order_items?.map((item: any) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td className="py-3" style={{ color: 'var(--color-text)' }}>
                        {item.product_name}
                      </td>
                      <td className="py-3 text-right" style={{ color: 'var(--color-text-secondary)' }}>
                        {formatPrice(Number(item.price))}
                      </td>
                      <td className="py-3 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                        {item.quantity}
                      </td>
                      <td className="py-3 text-right font-bold" style={{ color: 'var(--color-text)' }}>
                        {formatPrice(Number(item.subtotal))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className="p-5 rounded-[var(--radius-lg)] border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="space-y-2 text-sm max-w-xs ml-auto">
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                <span style={{ color: 'var(--color-text)' }}>
                  {formatPrice(Number(order.subtotal))}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
                <span style={{ color: 'var(--color-text)' }}>
                  {formatPrice(Number(order.shipping_cost))}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    Discount{couponCode && ` (${couponCode})`}
                  </span>
                  <span style={{ color: '#16a34a' }}>− {formatPrice(discount)}</span>
                </div>
              )}
              <div
                className="flex justify-between text-lg font-black pt-2"
                style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              >
                <span>Total</span>
                <span style={{ color: 'var(--color-primary)' }}>
                  {formatPrice(Number(order.total))}
                </span>
              </div>
              <div
                className="pt-3 space-y-2"
                style={{ borderTop: '1px solid var(--color-border)' }}
              >
                <div
                  className="flex items-center justify-between text-xs"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <span>Payment Method</span>
                  <span className="uppercase font-bold" style={{ color: 'var(--color-text)' }}>
                    {order.payment_method}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs gap-3">
                  <span style={{ color: 'var(--color-text-muted)' }}>Payment Status</span>
                  <PaymentStatusFlow
                    orderId={order.id}
                    currentStatus={order.payment_status}
                    orderTotal={Number(order.total)}
                    alreadyRefunded={Number((order as any).refund_amount || 0)}
                  />
                </div>
              </div>
            </div>
          </div>

          {(order as any).refund_amount > 0 && (
            <RefundSummary
              refundAmount={Number((order as any).refund_amount || 0)}
              refundReason={(order as any).refund_reason || null}
              refundedAt={(order as any).refunded_at || null}
              orderTotal={Number(order.total)}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          <OrderTimeline logs={logs} orderCreatedAt={order.created_at} />
        </div>
      </div>
    </div>
  )
}
