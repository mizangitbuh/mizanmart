import { createClient } from '@/lib/supabase/server'
import { BannersTable } from '@/components/admin/BannersTable'
import { KpiCard } from '@/components/admin/KpiCard'
import { Image as ImageIcon, Eye, EyeOff, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminBannersPage() {
  const supabase = await createClient()

  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .order('position', { ascending: true })
    .order('sort_order', { ascending: true })

  const allBanners = banners || []
  const now = new Date()

  const activeCount = allBanners.filter(
    (b) =>
      b.is_active &&
      (!b.end_date || new Date(b.end_date) > now) &&
      (!b.start_date || new Date(b.start_date) <= now)
  ).length
  const disabledCount = allBanners.filter((b) => !b.is_active).length
  const scheduledCount = allBanners.filter(
    (b) => b.start_date && new Date(b.start_date) > now
  ).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black mb-1" style={{ color: 'var(--color-text)' }}>
            Banners
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Manage homepage banners and promotional content
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Banners"
          value={allBanners.length}
          icon={ImageIcon}
          color="#3B82F6"
          subtitle="All banners"
        />
        <KpiCard
          label="Active"
          value={activeCount}
          icon={Eye}
          color="#10B981"
          subtitle="Currently showing"
        />
        <KpiCard
          label="Disabled"
          value={disabledCount}
          icon={EyeOff}
          color="#6B7280"
          subtitle="Hidden from site"
        />
        <KpiCard
          label="Scheduled"
          value={scheduledCount}
          icon={Clock}
          color="#F59E0B"
          subtitle="Future banners"
        />
      </div>

      {/* Table */}
      <BannersTable banners={allBanners} />
    </div>
  )
}
