import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { KpiCard } from '@/components/admin/KpiCard'
import { DateRangeFilter } from '@/components/admin/DateRangeFilter'
import { RevenueChart } from '@/components/admin/charts/RevenueChart'
import { OrdersTrendChart } from '@/components/admin/charts/OrdersTrendChart'
import { OrderStatusChart } from '@/components/admin/charts/OrderStatusChart'
import { SalesByCategory } from '@/components/admin/charts/SalesByCategory'
import { AnalyticsTable } from '@/components/admin/AnalyticsTable'
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  Package,
  Percent,
  AlertTriangle,
  Boxes,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ range?: string }>
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

export default async function AnalyticsPage({ searchParams }: Props) {
  const params = await searchParams
  const range = params.range || '30d'
  const { start, end, prevStart, prevEnd, label } = getDateRange(range)

  const supabase = await createClient()

  // Parallel data fetch
  const [
    currentOrdersRes,
    prevOrdersRes,
    productsRes,
    customersRes,
    prevCustomersRes,
    categoriesRes,
  ] = await Promise.all([
    supabase.from('orders')
      .select('id, total, status, created_at, customer_email, customer_phone, user_id')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString()),
    supabase.from('orders')
      .select('id, total, status, created_at')
      .gte('created_at', prevStart.toISOString())
      .lte('created_at', prevEnd.toISOString()),
    supabase.from('products')
      .select('id, name, category_id, stock_quantity, status, price'),
    supabase.from('profiles')
      .select('id, full_name, email, phone, created_at')
      .neq('role', 'admin'),
    supabase.from('profiles')
      .select('id', { count: 'exact', head: true })
      .neq('role', 'admin')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString()),
    supabase.from('categories').select('id, name'),
  ])

  const currentOrders = currentOrdersRes.data || []
  const prevOrders = prevOrdersRes.data || []
  const products = productsRes.data || []
  const customers = customersRes.data || []
  const prevCustomersCount = prevCustomersRes.count || 0
  const categories = categoriesRes.data || []

  // Fetch order items for current period
  const orderIds = currentOrders.map((o) => o.id)
  const orderItemsRes = orderIds.length > 0
    ? await supabase.from('order_items')
        .select('product_id, product_name, quantity, subtotal, order_id')
        .in('order_id', orderIds)
    : { data: [] as any[] }
  const orderItems = orderItemsRes.data || []

  // ═══════════════════════════════════════════════
  // PRIMARY KPIs
  // ═══════════════════════════════════════════════
  const validOrders = currentOrders.filter((o) => o.status !== 'cancelled')
  const prevValidOrders = prevOrders.filter((o) => o.status !== 'cancelled')

  const currentRevenue = validOrders.reduce((s, o) => s + Number(o.total), 0)
  const prevRevenue = prevValidOrders.reduce((s, o) => s + Number(o.total), 0)

  const currentOrderCount = currentOrders.length
  const prevOrderCount = prevOrders.length

  const currentAOV = validOrders.length > 0 ? currentRevenue / validOrders.length : 0
  const prevAOV = prevValidOrders.length > 0 ? prevRevenue / prevValidOrders.length : 0

  // Unique customers who ordered
  const uniqueCustomers = new Set(
    currentOrders.map((o) => o.user_id || o.customer_email || o.customer_phone).filter(Boolean)
  ).size

  // ═══════════════════════════════════════════════
  // ADVANCED METRICS
  // ═══════════════════════════════════════════════
  const cancelledCount = currentOrders.filter((o) => o.status === 'cancelled').length
  const cancellationRate = currentOrderCount > 0 ? (cancelledCount / currentOrderCount) * 100 : 0

  const totalUnitsSold = orderItems.reduce((s, i) => s + i.quantity, 0)

  const inventoryValue = products.reduce((s, p) => s + (p.stock_quantity || 0) * Number(p.price), 0)
  const lowStockCount = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 5).length
  const outOfStockCount = products.filter((p) => p.stock_quantity <= 0).length

  // ═══════════════════════════════════════════════
  // CHART DATA
  // ═══════════════════════════════════════════════

  // Revenue trend (daily)
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
  validOrders.forEach((o) => {
    const key = new Date(o.created_at).toISOString().split('T')[0]
    const entry = dayMap.get(key)
    if (entry) {
      entry.revenue += Number(o.total)
      entry.orders += 1
    }
  })
  const revenueChartData = Array.from(dayMap.values())

  // Orders trend (daily, with cancelled)
  const orderDayMap = new Map<string, { date: string; orders: number; cancelled: number }>()
  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(end)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    orderDayMap.set(key, {
      date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      orders: 0,
      cancelled: 0,
    })
  }
  currentOrders.forEach((o) => {
    const key = new Date(o.created_at).toISOString().split('T')[0]
    const entry = orderDayMap.get(key)
    if (entry) {
      if (o.status === 'cancelled') entry.cancelled += 1
      else entry.orders += 1
    }
  })
  const ordersChartData = Array.from(orderDayMap.values())

  // Order status distribution
  const statusCounts: Record<string, number> = {
    pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0,
  }
  currentOrders.forEach((o) => {
    if (statusCounts[o.status] !== undefined) statusCounts[o.status]++
  })
  const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

  // Sales by category
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]))
  const productCategoryMap = new Map(products.map((p) => [p.id, p.category_id]))
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

  // ═══════════════════════════════════════════════
  // TOP PRODUCTS
  // ═══════════════════════════════════════════════
  const productSales = new Map<string, { id: string; name: string; revenue: number; units: number }>()
  orderItems.forEach((item: any) => {
    const existing = productSales.get(item.product_id) || {
      id: item.product_id,
      name: item.product_name,
      revenue: 0,
      units: 0,
    }
    existing.revenue += Number(item.subtotal)
    existing.units += item.quantity
    productSales.set(item.product_id, existing)
  })
  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      name: p.name,
      value: p.revenue,
      secondaryValue: p.units,
      secondaryLabel: 'sold',
    }))

  // ═══════════════════════════════════════════════
  // TOP CUSTOMERS
  // ═══════════════════════════════════════════════
  const customerStats = new Map<string, { id: string; name: string; phone: string; revenue: number; orders: number }>()
  currentOrders.forEach((o) => {
    const key = o.user_id || o.customer_phone
    if (!key) return
    const customer = customers.find((c) => c.id === o.user_id) || customers.find((c) => c.phone === o.customer_phone)
    const existing = customerStats.get(key) || {
      id: key,
      name: customer?.full_name || o.customer_phone || 'Unknown',
      phone: o.customer_phone || '',
      revenue: 0,
      orders: 0,
    }
    if (o.status !== 'cancelled') existing.revenue += Number(o.total)
    existing.orders += 1
    customerStats.set(key, existing)
  })
  const topCustomers = Array.from(customerStats.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
    .map((c) => ({
      id: c.id,
      name: c.name,
      subtitle: c.phone,
      value: c.revenue,
      secondaryValue: c.orders,
      secondaryLabel: 'orders',
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black mb-1" style={{ color: 'var(--color-text)' }}>
            Analytics
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Detailed business reports for {label.toLowerCase()}
          </p>
        </div>
        <DateRangeFilter currentRange={range} />
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Revenue"
          value={formatPrice(currentRevenue)}
          icon={DollarSign}
          color="#10B981"
          trend={calcTrend(currentRevenue, prevRevenue)}
          trendLabel="vs previous period"
        />
        <KpiCard
          label="Orders"
          value={currentOrderCount}
          icon={ShoppingBag}
          color="#3B82F6"
          trend={calcTrend(currentOrderCount, prevOrderCount)}
          trendLabel="vs previous period"
        />
        <KpiCard
          label="Avg. Order Value"
          value={"৳" + currentAOV.toFixed(2)}
          icon={TrendingUp}
          color="#F59E0B"
          trend={calcTrend(currentAOV, prevAOV)}
          trendLabel="vs previous period"
        />
        <KpiCard
          label="New Customers"
          value={prevCustomersCount}
          icon={Users}
          color="#8B5CF6"
          subtitle="Registered this period"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Units Sold"
          value={totalUnitsSold}
          icon={Package}
          color="#14B8A6"
          subtitle="Total items shipped"
        />
        <KpiCard
          label="Cancellation Rate"
          value={`${cancellationRate.toFixed(1)}%`}
          icon={Percent}
          color="#DC2626"
          subtitle={`${cancelledCount} cancelled orders`}
        />
        <KpiCard
          label="Low Stock"
          value={lowStockCount}
          icon={AlertTriangle}
          color="#F59E0B"
          subtitle="Need restocking"
        />
        <KpiCard
          label="Inventory Value"
          value={formatPrice(inventoryValue)}
          icon={Boxes}
          color="#6366F1"
          subtitle={`${outOfStockCount} out of stock`}
        />
      </div>

      {/* Charts Row 1: Revenue + Order Status */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueChartData} title="Revenue Trend" />
        </div>
        <div>
          <OrderStatusChart data={statusChartData} />
        </div>
      </div>

      {/* Charts Row 2: Orders Trend + Sales by Category */}
      <div className="grid lg:grid-cols-2 gap-5">
        <OrdersTrendChart data={ordersChartData} />
        <SalesByCategory data={salesByCategory} />
      </div>

      {/* Tables Row: Top Products + Top Customers */}
      <div className="grid lg:grid-cols-2 gap-5">
        <AnalyticsTable
          title="Top Selling Products"
          icon="product"
          rows={topProducts}
          primaryLabel="revenue"
          isCurrency={true}
          emptyMessage="No sales in this period"
        />
        <AnalyticsTable
          title="Top Customers"
          icon="customer"
          rows={topCustomers}
          primaryLabel="spent"
          isCurrency={true}
          emptyMessage="No customers in this period"
        />
      </div>
    </div>
  )
}
