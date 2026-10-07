'use client'

import { useState, Fragment } from 'react'
import { ChevronDown, ChevronRight, User, Package, ShoppingBag, Ticket, Image as ImageIcon, Tag, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface AuditLog {
  id: string
  admin_id: string | null
  admin_email: string | null
  action: string
  entity_type: string
  entity_id: string | null
  entity_name: string | null
  changes: any | null
  metadata: any | null
  created_at: string
}

interface Props {
  logs: AuditLog[]
}

const actionColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  create: 'success',
  update: 'info',
  delete: 'danger',
  status_change: 'warning',
  bulk_update: 'info',
  adjust: 'warning',
  cancel: 'danger',
}

const entityIcons: Record<string, any> = {
  product: Package,
  order: ShoppingBag,
  customer: User,
  coupon: Ticket,
  banner: ImageIcon,
  category: Tag,
  settings: Settings,
}

function getActionColor(action: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  for (const [key, color] of Object.entries(actionColors)) {
    if (action.includes(key)) return color
  }
  return 'default'
}

function formatActionLabel(action: string): string {
  return action
    .split('.')
    .map((part) => part.replace(/_/g, ' '))
    .join(' → ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function AuditLogTable({ logs }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (logs.length === 0) {
    return (
      <div
        className="p-12 rounded-[var(--radius-lg)] border text-center"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <User size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
        <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          No audit logs yet
        </div>
        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Admin actions will appear here once performed
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-[var(--radius-lg)] border overflow-hidden"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--color-background)' }}>
              <th className="w-8 px-3 py-3"></th>
              <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                Admin
              </th>
              <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                Action
              </th>
              <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide hidden md:table-cell" style={{ color: 'var(--color-text-muted)' }}>
                Target
              </th>
              <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                When
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const isExpanded = expandedId === log.id
              const Icon = entityIcons[log.entity_type] || User
              const actionColor = getActionColor(log.action)

              return (
                <Fragment key={log.id}>
                  <tr
                    key={log.id}
                    className="border-t hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
                    style={{ borderColor: 'var(--color-border)' }}
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  >
                    <td className="px-3 py-3">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                        {log.admin_email || 'Unknown admin'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={actionColor} size="sm">
                          {formatActionLabel(log.action)}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Icon size={14} style={{ color: 'var(--color-text-muted)' }} />
                        <div>
                          <div className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                            {log.entity_name || log.entity_type}
                          </div>
                          {log.entity_id && (
                            <div className="text-[10px] font-mono truncate max-w-[200px]" style={{ color: 'var(--color-text-muted)' }}>
                              {log.entity_id.substring(0, 20)}
                              {log.entity_id.length > 20 && '...'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-xs" style={{ color: 'var(--color-text)' }}>
                        {new Date(log.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {new Date(log.created_at).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${log.id}-expanded`} style={{ background: 'var(--color-background)' }}>
                      <td colSpan={5} className="px-6 py-4">
                        <div className="space-y-3">
                          {log.changes && Object.keys(log.changes).length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                Changes
                              </div>
                              <div className="rounded-[var(--radius-md)] border overflow-hidden" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
                                <table className="w-full text-xs">
                                  <thead style={{ background: 'var(--color-background)' }}>
                                    <tr>
                                      <th className="text-left px-3 py-2 font-bold" style={{ color: 'var(--color-text-muted)' }}>Field</th>
                                      <th className="text-left px-3 py-2 font-bold" style={{ color: 'var(--color-text-muted)' }}>Old</th>
                                      <th className="text-left px-3 py-2 font-bold" style={{ color: 'var(--color-text-muted)' }}>New</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {Object.entries(log.changes).map(([field, change]: [string, any]) => (
                                      <tr key={field} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
                                        <td className="px-3 py-2 font-mono font-bold" style={{ color: 'var(--color-text)' }}>
                                          {field}
                                        </td>
                                        <td className="px-3 py-2 font-mono" style={{ color: 'var(--color-error)' }}>
                                          {JSON.stringify(change.old)}
                                        </td>
                                        <td className="px-3 py-2 font-mono" style={{ color: 'var(--color-success)' }}>
                                          {JSON.stringify(change.new)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                Metadata
                              </div>
                              <pre
                                className="text-[10px] p-3 rounded-[var(--radius-md)] overflow-x-auto"
                                style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}
                              >
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
