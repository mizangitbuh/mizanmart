import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Package, ShoppingBag, Users, DollarSign, Plus, Tag, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const [products, orders, customers] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id, total, status, order_number', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
  ])

  const totalRevenue = orders.data?.filter((o) => o.status === 'delivered').reduce((s, o) => s + Number(o.total), 0) || 0
  const pendingOrders = orders.data?.filter((o) => o.status === 'pending').length || 0
  const recentOrders = orders.data?.slice(-5).reverse() || []

  const stats = [
    { label: 'Products', value: products.count || 0, icon: Package, color: 'var(--color-primary)' },
    { label: 'Orders', value: orders.count || 0, icon: ShoppingBag, color: '#7C3AED' },
    { label: 'Customers', value: customers.count || 0, icon: Users, color: '#10B981' },
    { label: 'Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: '#F59E0B' },
  ]

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-black text-[var(--color-text)] mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="p-5 rounded-xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <Icon size={22} style={{ color: s.color }} className="mb-3" />
              <div className="text-2xl font-black text-[var(--color-text)]">{s.value}</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1">{s.label}</div>
            </div>
          )
        })}
      </div>

      {pendingOrders > 0 && (
        <div className="mb-8 p-4 rounded-xl border" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
          <div className="font-bold text-sm text-yellow-900">⚠️ {pendingOrders} pending order{pendingOrders > 1 ? 's' : ''} awaiting confirmation</div>
          <Link href="/admin/orders" className="text-xs text-yellow-700 hover:underline mt-1 inline-flex items-center gap-1">
            View Orders <ArrowRight size={12} />
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="p-6 rounded-xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-[var(--color-text)]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[var(--color-primary)] hover:underline font-bold">View All →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex justify-between items-center py-2 hover:bg-[var(--color-surface-hover)] rounded px-2 -mx-2 transition">
                  <span className="font-mono text-xs text-[var(--color-text)]">{o.order_number}</span>
                  <span className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>{formatPrice(Number(o.total))}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <h2 className="font-black text-[var(--color-text)] mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/admin/products/new" className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold transition">
              <Plus size={16} /> Add New Product
            </Link>
            <Link href="/admin/categories" className="flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium hover:bg-[var(--color-surface-hover)] transition" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              <Tag size={16} /> Manage Categories
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium hover:bg-[var(--color-surface-hover)] transition" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              <ShoppingBag size={16} /> View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
