import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Package, Clock, ArrowRight, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'

export const dynamic = 'force-dynamic'

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  confirmed: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
}

const statusIcons: Record<string, string> = {
  pending: '⏳',
  confirmed: '✅',
  shipped: '🚚',
  delivered: '📦',
  cancelled: '❌',
}

export default async function MyOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!orders || orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="Your order history will appear here once you place an order"
        actionLabel="Start Shopping"
        actionHref="/products"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black" style={{ color: 'var(--color-text)' }}>
          My Orders
        </h2>
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {orders.length} order{orders.length > 1 ? 's' : ''}
        </div>
      </div>

      {orders.map((order) => {
        const itemCount = order.order_items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0
        const previewItems = order.order_items?.slice(0, 2) || []
        const moreCount = Math.max(0, (order.order_items?.length || 0) - 2)

        return (
          <div
            key={order.id}
            className="rounded-[var(--radius-lg)] border overflow-hidden"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {/* Header */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 p-5 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold" style={{ color: 'var(--color-text)' }}>
                    {order.order_number}
                  </span>
                  <Badge variant={statusVariants[order.status] || 'default'} size="sm">
                    {statusIcons[order.status]} {order.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                  <span>•</span>
                  <span>{itemCount} item{itemCount > 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total</div>
                <div className="text-lg font-black" style={{ color: 'var(--color-primary)' }}>
                  {formatPrice(Number(order.total))}
                </div>
              </div>
            </div>

            {/* Items preview */}
            <div className="p-5">
              <div className="space-y-2 mb-4">
                {previewItems.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--color-text)' }}>
                      {item.product_name} <span style={{ color: 'var(--color-text-muted)' }}>× {item.quantity}</span>
                    </span>
                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {formatPrice(Number(item.subtotal))}
                    </span>
                  </div>
                ))}
                {moreCount > 0 && (
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    + {moreCount} more item{moreCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              <Link
                href={`/account/orders/${order.id}`}
                className="inline-flex items-center gap-1 text-sm font-bold hover:gap-2 transition-all"
                style={{ color: 'var(--color-primary)' }}
              >
                View Details <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
