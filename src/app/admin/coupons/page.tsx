import { createClient } from '@/lib/supabase/server'
import { CouponsTable } from '@/components/admin/CouponsTable'
import { KpiCard } from '@/components/admin/KpiCard'
import { Ticket, CheckCircle, Clock, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminCouponsPage() {
  const supabase = await createClient()

  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  const allCoupons = coupons || []
  const now = new Date()

  // KPI stats
  const totalCoupons = allCoupons.length
  const activeCoupons = allCoupons.filter(
    (c) =>
      c.is_active &&
      (!c.end_date || new Date(c.end_date) > now) &&
      (!c.start_date || new Date(c.start_date) <= now) &&
      (!c.usage_limit || c.usage_count < c.usage_limit)
  ).length
  const expiredCoupons = allCoupons.filter(
    (c) => c.end_date && new Date(c.end_date) < now
  ).length
  const totalRedemptions = allCoupons.reduce((sum, c) => sum + (c.usage_count || 0), 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black mb-1" style={{ color: 'var(--color-text)' }}>
            Coupons
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Create and manage discount codes for your customers
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Coupons"
          value={totalCoupons}
          icon={Ticket}
          color="#3B82F6"
          subtitle="All time created"
        />
        <KpiCard
          label="Active"
          value={activeCoupons}
          icon={CheckCircle}
          color="#10B981"
          subtitle="Currently usable"
        />
        <KpiCard
          label="Expired"
          value={expiredCoupons}
          icon={Clock}
          color="#F59E0B"
          subtitle="Past end date"
        />
        <KpiCard
          label="Total Redemptions"
          value={totalRedemptions}
          icon={TrendingUp}
          color="#8B5CF6"
          subtitle="Times used"
        />
      </div>

      {/* Table */}
      <CouponsTable coupons={allCoupons} />
    </div>
  )
}
