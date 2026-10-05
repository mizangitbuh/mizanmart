import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Package, ArrowRight, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  shipped: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  delivered: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] py-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--color-primary-light)] mx-auto mb-4 flex items-center justify-center">
            <Package size={40} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 className="text-2xl font-black text-[var(--color-text)] mb-2">Login Required</h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">Please login to see your orders</p>
          <Link href="/login" className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white rounded-full font-bold text-sm">
            Login
          </Link>
        </div>
      </div>
    )
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] py-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-[var(--color-primary-light)] mx-auto mb-4 flex items-center justify-center">
            <Package size={40} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 className="text-2xl font-black text-[var(--color-text)] mb-2">No Orders Yet</h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">Your order history will appear here</p>
          <Link href="/products" className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white rounded-full font-bold text-sm">
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="container-main py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text)] mb-6">
          My Orders <span className="text-[var(--color-text-muted)] text-base font-medium">({orders.length})</span>
        </h1>

        <div className="space-y-4">
          {orders.map((order) => {
            const colors = statusColors[order.status] || statusColors.pending
            return (
              <div key={order.id} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--color-border)]">
                  <div>
                    <div className="font-mono font-bold text-sm text-[var(--color-text)]">
                      {order.order_number}
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-1">
                      <Clock size={11} />
                      {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors.bg} ${colors.text}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="py-4 space-y-2">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">
                        {item.product_name} <span className="text-[var(--color-text-light)]">× {item.quantity}</span>
                      </span>
                      <span className="font-medium text-[var(--color-text)]">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                  <div className="text-xs text-[var(--color-text-muted)]">
                    {order.shipping_address?.city}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                      {formatPrice(order.total)}
                    </span>
                    <ArrowRight size={14} className="text-[var(--color-text-muted)]" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
