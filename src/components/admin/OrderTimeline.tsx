import { CheckCircle2, Truck, XCircle, Clock, FileText } from 'lucide-react'

export interface AuditLogEntry {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  entity_name: string | null
  changes: Record<string, { old: unknown; new: unknown }> | null
  metadata: Record<string, unknown> | null
  admin_email: string | null
  created_at: string
}

interface Props {
  logs: AuditLogEntry[]
  orderCreatedAt: string
}

function iconForAction(action: string) {
  if (action.includes('status_change')) return Truck
  if (action.includes('cancel')) return XCircle
  if (action.includes('update')) return FileText
  return Clock
}

function describeChange(entry: AuditLogEntry): string {
  const changes = entry.changes || {}

  if (changes.status) {
    return `Status: ${changes.status.old ?? '—'} → ${changes.status.new}`
  }
  if (changes.payment_status) {
    const oldP = changes.payment_status.old
    const newP = changes.payment_status.new
    if (oldP !== newP) {
      return `Payment: ${oldP ?? '—'} → ${newP}`
    }
  }
  if (changes.refund_amount) {
    const lastRefund = (changes as any).last_refund?.new
    if (lastRefund && lastRefund > 0) {
      return `Refund issued: ${lastRefund}`
    }
    return 'Refund issued'
  }
  if (changes.notes) {
    return 'Notes updated'
  }
  if (changes.bulk_status_change) {
    return `Bulk status → ${changes.bulk_status_change.new}`
  }

  const keys = Object.keys(changes)
  if (keys.length === 0) return 'Updated'
  return keys.join(', ') + ' updated'
}

export function OrderTimeline({ logs, orderCreatedAt }: Props) {
  return (
    <div
      className="p-5 rounded-[var(--radius-lg)] border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <h2
        className="text-xs font-black uppercase tracking-wide mb-4"
        style={{ color: 'var(--color-text)' }}
      >
        Timeline
      </h2>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
          >
            <CheckCircle2 size={14} />
          </div>
          <div className="flex-1 min-w-0 pb-2">
            <div className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
              Order placed
            </div>
            <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              {new Date(orderCreatedAt).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        {logs.length === 0 && (
          <div
            className="text-xs italic text-center py-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            No changes yet
          </div>
        )}

        {logs.map((log) => {
          const Icon = iconForAction(log.action)
          return (
            <div key={log.id} className="flex gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border"
                style={{
                  background: 'var(--color-background)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <Icon size={12} />
              </div>
              <div className="flex-1 min-w-0 pb-2">
                <div className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                  {describeChange(log)}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(log.created_at).toLocaleString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {log.admin_email && ` • ${log.admin_email}`}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
