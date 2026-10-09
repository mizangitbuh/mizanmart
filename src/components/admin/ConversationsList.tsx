'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { MessageSquare, ChevronRight } from 'lucide-react'

export interface ThreadSummary {
  customer_id: string
  full_name: string | null
  email: string | null
  phone: string | null
  last_body: string
  last_at: string
  last_role: 'customer' | 'admin'
  unread: number
  resolved?: boolean
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'এখনই'
  if (mins < 60) return `${mins} মিনিট আগে`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ঘণ্টা আগে`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} দিন আগে`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function ConversationsList({ threads }: { threads: ThreadSummary[] }) {
  if (threads.length === 0) {
    return (
      <div
        className="p-10 rounded-[var(--radius-lg)] border text-center"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <MessageSquare size={36} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
        <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
          কোনো কথোপকথন নেই
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          কাস্টমার মেসেজ পাঠালে এখানে দেখা যাবে
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-[var(--radius-lg)] border overflow-hidden"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {threads.map((t) => (
        <Link
          key={t.customer_id}
          href={`/admin/conversations/${t.customer_id}`}
          className="flex items-center gap-3 px-4 py-3.5 border-b last:border-b-0 transition-colors hover:bg-[var(--color-surface-hover)]"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-black text-sm text-white"
            style={{ background: t.unread > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
          >
            {(t.full_name?.[0] || t.email?.[0] || '?').toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                {t.full_name || t.email || 'Customer'}
              </span>
              {t.unread > 0 && (
                <Badge variant="danger" size="sm" className="rounded-full">
                  {t.unread}
                </Badge>
              )}
              {t.resolved && (
                <Badge variant="success" size="sm" className="rounded-full">
                  ✓ Resolved
                </Badge>
              )}
            </div>
            <div className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {t.last_role === 'admin' ? 'আপনি: ' : ''}
              {t.last_body.slice(0, 80)}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {t.email} • {timeAgo(t.last_at)}
            </div>
          </div>

          <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
        </Link>
      ))}
    </div>
  )
}
