import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { KpiCard } from '@/components/admin/KpiCard'
import { DateRangeFilter } from '@/components/admin/DateRangeFilter'
import { RevenueChart } from '@/components/admin/charts/RevenueChart'
import { OrderStatusChart } from '@/components/admin/charts/OrderStatusChart'
import { TopProducts } from '@/components/admin/charts/TopProducts'
import { SalesByCategory } from '@/components/admin/charts/SalesByCategory'
import { Badge } from '@/components/ui/Badge'
import {
  DollarSign, ShoppingBag, Users, TrendingUp, Clock, AlertTriangle,
  XCircle, CheckCircle, Plus, Tag, ArrowRight, Package,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ range?: string }>
}

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning', confirmed: 'info', shipped: 'info',
  delivered: 'success', cancelled: 'danger',
}

function getDateRange(range: string) {
  const now = new Date()
  const end = new Date(now); end.setHours(23, 59, 59, 999)
  let start = new Date(now), prevStart = new Date(now), prevEnd = new Date(now)
  let label = 'Last 30 days'

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - 1)
      prevEnd = new Date(start); prevEnd.setMilliseconds(-1)
      label = 'Today'; break
    case '7d':
      start.setDate(start.getDate() - 7)
      prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - 7)
      prevEnd = new Date(start); prevEnd.setMilliseconds(-1)
      label = 'Last 7 days'; break
    case '90d':
      start.setDate(start.getDate() - 90)
      prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - 90)
      prevEnd = new Date(start); prevEnd.setMilliseconds(-1)
      label = 'Last 90 days'; break
    case 'year':
      start = new Date(now.getFullYear(), 0, 1)
      prevStart = new Date(now.getFullYear() - 1, 0, 1)
      prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
      label = 'This Year'; break
    default:
      start.setDate(start.getDate() - 30)
      prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - 30)
      prevEnd = new Date(start); prevEnd.setMilliseconds(-1)
  }
  return { start, end, prevStart, prevEnd, label }
}

function calcTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

export default async function AdminDashboard({ searchParams }: Props) {
  const params = await searchParams
  const range = params.range || '30d'
  const { start, end, prevStart, prevEnd, label } = getDateRange(range)

  const supabase = await createClient()

  const [currentOrdersRes, prevOrdersRes, productsRes, customersRes, prevCustomersRes] = await Promise.all([
    supabase.from('orders')
      .select('id, total, status, order_number, customer_name, created_at, payment_status')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString()),
    supabase.from('orders')
      .select('id, total, status, created_at')
      .gte('created_at', prevStart.toISOString())
      .lte('created_at', prevEnd.toISOString()),
    supabase.from('products')
      .select('id, name, category_id, stock_quantity, status'),
    supabase.from('profiles')
      .select('id, created_at')
      .eq('role', 'customer')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString()),
    supabase.from('profiles')
      .select('id, created_at')
      .eq('role', 'customer')
      .gte('created_at', prevStart.toISOString())
      .lte('created_at', prevEnd.toISOString()),
  ])

  const currentOrders = currentOrdersRes.data || []
  const prevOrders = prevOrdersRes.data || []
  const products = productsRes.data || []
  const currentCustomers = customersRes.data || []
  const prevCustomers = prevCustomersRes.data || []

  // Fetch order items for current orders (for charts)
  const orderIds = currentOrders.map((o) => o.id)
  const orderItemsRes = orderIds.length > 0
    ? await supabase.from('order_items')
        .select('product_id, product_name, quantity, subtotal, order_id')
        .in('order_id', orderIds)
    : { data: [] as any[] }
  const orderItems = orderItemsRes.data || []

  // Fetch categories
  const categoriesRes = await supabase.from('categories').select('id, name')
  const categories = categoriesRes.data || []
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))
  const productCategoryMap = new Map(products.map((p) => [p.id, p.category_id]))

  // ===== Primary KPIs =====
  const currentRevenue = currentOrders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0)
  const prevRevenue = prevOrders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0)
  const currentOrderCount = currentOrders.length
  const prevOrderCount = prevOrders.length
  const currentAOV = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0
  const prevAOV = prevOrderCount > 0 ? prevRevenue / prevOrderCount : 0

  // ===== Secondary KPIs =====
  const pendingOrders = currentOrders.filter((o) => o.status === 'pending').length
  const deliveredOrders = currentOrders.filter((o) => o.status === 'delivered').length
  const lowStockProducts = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 5)
  const outOfStockProducts = products.filter((p) => p.stock_quantity <= 0)

  // ===== Revenue Chart data (daily) =====
  const dayMap = new Map<string, { date: string; revenue: number; orders: number }>()
  const dayCount = Math.min(Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 90)

  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    dayMap.set(key, {
      date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      revenue: 0,
      orders: 0,
    })
  }

  currentOrders.forEach((o) => {
    if (o.status === 'cancelled') return
    const key = new Date(o.created_at).toISOString().split('T')[0]
    const existing = dayMap.get(key)
    if (existing) {
      existing.revenue += Number(o.total)
      existing.orders += 1
    }
  })

  const revenueChartData = Array.from(dayMap.values())

  // ===== Order Status Chart =====
  const statusCounts: Record<string, number> = {
    pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0,
  }
  currentOrders.forEach((o) => {
    if (statusCounts[o.status] !== undefined) statusCounts[o.status]++
  })
  const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

  // ===== Top Products =====
  const productSales = new Map<string, { product_id: string; name: string; quantity: number; revenue: number }>()
  orderItems.forEach((item: any) => {
    const existing = productSales.get(item.product_id) || {
      product_id: item.product_id,
      name: item.product_name,
      quantity: 0,
      revenue: 0,
    }
    existing.quantity += item.quantity
    existing.revenue += Number(item.subtotal)
    productSales.set(item.product_id, existing)
  })
  const topProducts = Array.from(productSales.values()).sort((a, b) => b.revenue - a.revenue)

  // ===== Sales by Category =====
  const categorySales = new Map<string, { category: string; revenue: number; units: number }>()
  orderItems.forEach((item: any) => {
    const catId = productCategoryMap.get(item.product_id)
    const catName = catId ? categoryMap.get(catId) || 'Other' : 'Other'
    const existing = categorySales.get(catName) || { category: catName, revenue: 0, units: 0 }
    existing.revenue += Number(item.subtotal)
    existing.units += item.quantity
    categorySales.set(catName, existing)
  })
  const salesByCategory = Array.from(categorySales.values()).sort((a, b) => b.revenue - a.revenue)

  // ===== Recent Orders =====
  const recentOrders = [...currentOrders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black mb-1" style={{ color: 'var(--color-text)' }}>
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Overview for {label.toLowerCase()}
          </p>
        </div>
        <DateRangeFilter currentRange={range} />
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Revenue" value={formatPrice(currentRevenue)} icon={DollarSign} color="#10B981" trend={calcTrend(currentRevenue, prevRevenue)} trendLabel="vs previous period" />
        <KpiCard label="Orders" value={currentOrderCount} icon={ShoppingBag} color="#3B82F6" trend={calcTrend(currentOrderCount, prevOrderCount)} trendLabel="vs previous period" />
        <KpiCard label="New Customers" value={currentCustomers.length} icon={Users} color="#8B5CF6" trend={calcTrend(currentCustomers.length, prevCustomers.length)} trendLabel="vs previous period" />
        <KpiCard label="Avg. Order Value" value={formatPrice(currentAOV)} icon={TrendingUp} color="#F59E0B" trend={calcTrend(currentAOV, prevAOV)} trendLabel="vs previous period" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/orders" className="block">
          <KpiCard label="Pending Orders" value={pendingOrders} icon={Clock} color="#F59E0B" subtitle="Awaiting confirmation" />
        </Link>
        <Link href="/admin/orders" className="block">
          <KpiCard label="Delivered" value={deliveredOrders} icon={CheckCircle} color="#10B981" subtitle="Successfully delivered" />
        </Link>
        <Link href="/admin/inventory" className="block">
          <KpiCard label="Low Stock" value={lowStockProducts.length} icon={AlertTriangle} color="#F97316" subtitle="Need restocking" />
        </Link>
        <Link href="/admin/inventory" className="block">
          <KpiCard label="Out of Stock" value={outOfStockProducts.length} icon={XCircle} color="#DC2626" subtitle="Unavailable products" />
        </Link>
      </div>

      {/* Charts Row 1: Revenue + Order Status */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueChartData} />
        </div>
        <div>
          <OrderStatusChart data={statusChartData} />
        </div>
      </div>

      {/* Charts Row 2: Top Products + Sales by Category */}
      <div className="grid lg:grid-cols-2 gap-5">
        <TopProducts data={topProducts} />
        <SalesByCategory data={salesByCategory} />
      </div>

      {/* Alerts */}
      {(pendingOrders > 0 || lowStockProducts.length > 0) && (
        <div className="space-y-3">
          {pendingOrders > 0 && (
            <div className="p-4 rounded-[var(--radius-lg)] border flex items-start gap-3"
              style={{ background: 'var(--color-warning-bg)', borderColor: 'var(--color-warning)' }}>
              <Clock size={20} style={{ color: 'var(--color-warning)' }} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold text-sm" style={{ color: 'var(--color-warning)' }}>
                  {pendingOrders} pending order{pendingOrders > 1 ? 's' : ''} need confirmation
                </div>
                <Link href="/admin/orders" className="text-xs font-semibold hover:underline mt-1 inline-flex items-center gap-1" style={{ color: 'var(--color-warning)' }}>
                  View orders <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}

          {lowStockProducts.length > 0 && (
            <div className="p-4 rounded-[var(--radius-lg)] border flex items-start gap-3"
              style={{ background: 'var(--color-error-bg)', borderColor: 'var(--color-error)' }}>
              <AlertTriangle size={20} style={{ color: 'var(--color-error)' }} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold text-sm" style={{ color: 'var(--color-error)' }}>
                  {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} need restocking
                </div>
                <Link href="/admin/inventory" className="text-xs font-semibold hover:underline mt-1 inline-flex items-center gap-1" style={{ color: 'var(--color-error)' }}>
                  View inventory <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Orders + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-[var(--radius-lg)] border overflow-hidden"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-black text-sm" style={{ color: 'var(--color-text)' }}>Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-bold hover:underline flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
              View All <ArrowRight size={12} />
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--color-background)' }}>
                    <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Order</th>
                    <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Customer</th>
                    <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Amount</th>
                    <th className="text-left px-5 py-3 font-bold text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Status</th>
                    <th className="text-right px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-t hover:bg-[var(--color-surface-hover)] transition-colors" style={{ borderColor: 'var(--color-border)' }}>
                      <td className="px-5 py-3">
                        <div className="font-mono font-bold text-xs" style={{ color: 'var(--color-text)' }}>{order.order_number}</div>
                        <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                          {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                      </td>
                      <td className="px-5 py-3" style={{ color: 'var(--color-text)' }}>{order.customer_name}</td>
                      <td className="px-5 py-3 font-bold" style={{ color: 'var(--color-primary)' }}>{formatPrice(Number(order.total))}</td>
                      <td className="px-5 py-3">
                        <Badge variant={statusVariants[order.status] || 'default'} size="sm">{order.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link href={`/admin/orders/${order.id}`} className="text-xs font-bold hover:underline" style={{ color: 'var(--color-primary)' }}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Package size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
              <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No orders in this period</div>
            </div>
          )}
        </div>

        <div className="rounded-[var(--radius-lg)] border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="font-black text-sm" style={{ color: 'var(--color-text)' }}>Quick Actions</h2>
          </div>
          <div className="p-3 space-y-1">
            <Link href="/admin/products/new" className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] transition-colors">
              <div className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-primary)' }}>
                <Plus size={16} style={{ color: 'white' }} />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>Add Product</div>
                <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Create a new listing</div>
              </div>
            </Link>
            <Link href="/admin/categories" className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] transition-colors">
              <div className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-info)' }}>
                <Tag size={16} style={{ color: 'white' }} />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>Categories</div>
                <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Manage categories</div>
              </div>
            </Link>
            <Link href="/admin/orders" className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] transition-colors">
              <div className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-success)' }}>
                <ShoppingBag size={16} style={{ color: 'white' }} />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>View Orders</div>
                <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Manage all orders</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
