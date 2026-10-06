import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Package, Heart, MapPin, ShoppingBag, ArrowRight, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  confirmed: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
}

export default async function AccountOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone')
    .eq('id', user.id)
    .single()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const totalOrders = orders?.length || 0
  const totalSpent = orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0
  const recentOrders = orders?.slice(0, 3) || []

  const stats = [
    { label: 'Total Orders', value: totalOrders, icon: Package, color: 'var(--color-primary)' },
    { label: 'Total Spent', value: formatPrice(totalSpent), icon: ShoppingBag, color: '#10B981' },
    { label: 'Wishlist', value: 0, icon: Heart, color: '#EC4899' },
    { label: 'Addresses', value: 0, icon: MapPin, color: '#F59E0B' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div
        className="rounded-[var(--radius-lg)] p-6 text-white"
        style={{ background: 'linear-gradient(135deg, #B91C2C 0%, #D92D3F 100%)' }}
      >
        <h2 className="text-xl md:text-2xl font-black mb-1">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}! 👋
        </h2>
        <p className="text-sm opacity-90">
          Manage your orders, addresses, and personal information from here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="p-4 rounded-[var(--radius-lg)] border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <Icon size={20} style={{ color: stat.color }} className="mb-2" />
              <div className="text-xl font-black mb-0.5" style={{ color: 'var(--color-text)' }}>
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div
        className="rounded-[var(--radius-lg)] border overflow-hidden"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div
          className="flex items-center justify-between p-5 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h3 className="font-black" style={{ color: 'var(--color-text)' }}>Recent Orders</h3>
          <Link
            href="/account/orders"
            className="text-sm font-semibold hover:underline flex items-center gap-1"
            style={{ color: 'var(--color-primary)' }}
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div>
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders`}
                className="block p-5 border-b last:border-0 hover:bg-[var(--color-surface-hover)] transition-colors"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="font-mono font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                    {order.order_number}
                  </div>
                  <Badge variant={statusVariants[order.status] || 'default'} size="sm">
                    {order.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                    <Clock size={11} />
                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
                    {formatPrice(Number(order.total))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <Package size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
            <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              No orders yet
            </div>
            <div className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Start shopping to see your orders here
            </div>
            <Link
              href="/products"
              className="inline-block px-5 py-2.5 rounded-full text-sm font-bold text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
