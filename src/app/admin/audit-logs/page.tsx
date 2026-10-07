import { createClient } from '@/lib/supabase/server'
import { AuditLogTable } from '@/components/admin/AuditLogTable'
import { KpiCard } from '@/components/admin/KpiCard'
import { FileText, Activity, User, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function AuditLogsPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  const page = Math.max(1, parseInt(params.page || '1'))
  const offset = (page - 1) * PAGE_SIZE

  const { data: logs, count } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const totalLogs = count || 0

  // Stats
  const { data: allLogs } = await supabase
    .from('audit_logs')
    .select('action, admin_email, created_at')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayCount = (allLogs || []).filter(
    (l) => new Date(l.created_at) >= today
  ).length

  const uniqueAdmins = new Set((allLogs || []).map((l) => l.admin_email)).size

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekCount = (allLogs || []).filter(
    (l) => new Date(l.created_at) >= weekAgo
  ).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black mb-1" style={{ color: 'var(--color-text)' }}>
          Audit Logs
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Track all admin actions across the platform
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Logs"
          value={totalLogs}
          icon={FileText}
          color="#3B82F6"
          subtitle="All-time actions"
        />
        <KpiCard
          label="Today"
          value={todayCount}
          icon={Clock}
          color="#10B981"
          subtitle="Actions today"
        />
        <KpiCard
          label="This Week"
          value={weekCount}
          icon={Activity}
          color="#F59E0B"
          subtitle="Last 7 days"
        />
        <KpiCard
          label="Active Admins"
          value={uniqueAdmins}
          icon={User}
          color="#8B5CF6"
          subtitle="Unique users"
        />
      </div>

      {/* Table */}
      <AuditLogTable logs={logs || []} />

      {/* Pagination */}
      {totalLogs > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {page > 1 && (
            <a
              href={`/admin/audit-logs?page=${page - 1}`}
              className="px-4 py-2 rounded-[var(--radius-md)] border text-sm font-semibold transition hover:border-[var(--color-primary)]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              ← Previous
            </a>
          )}
          <span className="text-sm px-4 font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Page {page} of {Math.ceil(totalLogs / PAGE_SIZE)}
          </span>
          {page < Math.ceil(totalLogs / PAGE_SIZE) && (
            <a
              href={`/admin/audit-logs?page=${page + 1}`}
              className="px-4 py-2 rounded-[var(--radius-md)] border text-sm font-semibold transition hover:border-[var(--color-primary)]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
