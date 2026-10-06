import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CustomersTable } from '@/components/admin/CustomersTable'
import { KpiCard } from '@/components/admin/KpiCard'
import { formatPrice } from '@/lib/utils'
import { Users, Crown, UserPlus, DollarSign, Search, X } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    q?: string
    segment?: string
  }>
}

export default async function CustomersPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch all customers (profiles with role=customer OR having orders)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role, created_at')
    .neq('role', 'admin')

  // Fetch order aggregates
  const { data: orders } = await supabase
    .from('orders')
    .select('user_id, customer_email, customer_phone, total, created_at, status')

  const allOrders = orders || []

  // Build customer stats
  const customerStats = (profiles || []).map((p) => {
    const userOrders = allOrders.filter(
      (o) =>
        (o.user_id && o.user_id === p.id) ||
        (o.customer_email && o.customer_email === p.email) ||
        (o.customer_phone && p.phone && o.customer_phone === p.phone)
    )
    const validOrders = userOrders.filter((o) => o.status !== 'cancelled')
    const totalSpent = validOrders.reduce((sum, o) => sum + Number(o.total), 0)
    const lastOrder = userOrders.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]

    return {
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      phone: p.phone,
      role: p.role,
      created_at: p.created_at,
      total_orders: userOrders.length,
      total_spent: totalSpent,
      last_order_date: lastOrder?.created_at || null,
    }
  })

  // Sort by total spent descending
  customerStats.sort((a, b) => b.total_spent - a.total_spent)

  // Apply search filter
  let filtered = customerStats
  if (params.q) {
    const term = params.q.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.full_name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term)
    )
  }

  // Apply segment filter
  if (params.segment) {
    filtered = filtered.filter((c) => {
      const daysSinceLast = c.last_order_date
        ? (Date.now() - new Date(c.last_order_date).getTime()) / (1000 * 60 * 60 * 24)
        : Infinity

      if (params.segment === 'vip') return c.total_spent >= 10000
      if (params.segment === 'returning') return c.total_orders >= 3
      if (params.segment === 'new') return c.total_orders === 0
      if (params.segment === 'inactive') return daysSinceLast > 90 && c.total_orders > 0
      return true
    })
  }

  // KPIs (from all customers, not filtered)
  const totalCustomers = customerStats.length
  const vipCount = customerStats.filter((c) => c.total_spent >= 10000).length
  const newCount = customerStats.filter((c) => c.total_orders === 0).length
  const totalRevenue = customerStats.reduce((sum, c) => sum + c.total_spent, 0)
  const avgSpent = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const sp = new URLSearchParams()
    const merged = { ...params, ...updates }
    Object.entries(merged).forEach(([k, v]) => {
      if (v) sp.set(k, v)
    })
    return `/admin/customers${sp.toString() ? '?' + sp.toString() : ''}`
  }

  const segments = [
    { value: '', label: 'All Customers' },
    { value: 'vip', label: '⭐ VIP (৳10k+)' },
    { value: 'returning', label: 'Returning (3+ orders)' },
    { value: 'new', label: 'New (no orders)' },
    { value: 'inactive', label: 'Inactive (90d+)' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black mb-1" style={{ color: 'var(--color-text)' }}>
            Customers
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Manage and view all customer information
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Customers"
          value={totalCustomers}
          icon={Users}
          color="#3B82F6"
          subtitle="Registered users"
        />
        <KpiCard
          label="VIP Customers"
          value={vipCount}
          icon={Crown}
          color="#F59E0B"
          subtitle="Spent ৳10,000+"
        />
        <KpiCard
          label="New Customers"
          value={newCount}
          icon={UserPlus}
          color="#8B5CF6"
          subtitle="No orders yet"
        />
        <KpiCard
          label="Avg. Spend"
          value={formatPrice(avgSpent)}
          icon={DollarSign}
          color="#10B981"
          subtitle="Per customer"
        />
      </div>

      {/* Search + Segment filters */}
      <div
        className="p-4 rounded-[var(--radius-lg)] border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <form action="/admin/customers" method="GET" className="relative flex-1 min-w-[240px]">
            {params.segment && <input type="hidden" name="segment" value={params.segment} />}
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              name="q"
              defaultValue={params.q || ''}
              placeholder="Search by name, email or phone..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-background)',
                color: 'var(--color-text)',
              }}
            />
          </form>

          {/* Segment chips */}
          <div className="flex flex-wrap gap-2">
            {segments.map((seg) => {
              const isActive = (params.segment || '') === seg.value
              return (
                <Link
                  key={seg.value}
                  href={buildUrl({ segment: seg.value || undefined })}
                  className="px-3 py-2 text-xs font-bold rounded-[var(--radius-md)] transition-colors whitespace-nowrap"
                  style={{
                    background: isActive ? 'var(--color-primary)' : 'var(--color-background)',
                    color: isActive ? 'white' : 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {seg.label}
                </Link>
              )
            })}
          </div>

          {(params.q || params.segment) && (
            <Link
              href="/admin/customers"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-[var(--radius-md)] transition-colors"
              style={{
                background: 'var(--color-error-bg)',
                color: 'var(--color-error)',
              }}
            >
              <X size={12} />
              Clear
            </Link>
          )}
        </div>
      </div>

      {/* Results Counter */}
      <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Showing {filtered.length} of {totalCustomers} customer{totalCustomers !== 1 ? 's' : ''}
      </div>

      {/* Table */}
      <CustomersTable customers={filtered} />
    </div>
  )
}
