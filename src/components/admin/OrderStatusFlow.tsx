'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import {
  getAllowedTransitions,
  STATUS_LABELS,
  STATUS_EMOJI,
  type OrderStatus,
} from '@/lib/orders/status-machine'

const variantMap: Record<OrderStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  confirmed: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
}

interface Props {
  orderId: string
  currentStatus: string
}

export function OrderStatusFlow({ orderId, currentStatus }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const status = currentStatus as OrderStatus
  const allowed = getAllowedTransitions(status)
  const isTerminal = allowed.length === 0

  const changeStatus = async (to: OrderStatus) => {
    if (!confirm(`Change status to "${STATUS_LABELS[to]}"?`)) return
    setBusy(to)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: to }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2 flex-wrap justify-end">
        <Badge variant={variantMap[status] || 'default'}>
          {STATUS_EMOJI[status]} {STATUS_LABELS[status]}
        </Badge>

        {!isTerminal &&
          allowed.map((to) => (
            <button
              key={to}
              onClick={() => changeStatus(to)}
              disabled={busy !== null}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold border transition disabled:opacity-50"
              style={{
                borderColor: to === 'cancelled' ? '#dc2626' : 'var(--color-primary)',
                color: to === 'cancelled' ? '#dc2626' : 'var(--color-primary)',
                background: 'transparent',
              }}
            >
              {busy === to ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <ChevronRight size={12} />
              )}
              {STATUS_LABELS[to]}
            </button>
          ))}

        {isTerminal && (
          <span className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>
            No further transitions
          </span>
        )}
      </div>

      {error && (
        <div
          className="text-xs px-3 py-1.5 rounded-[var(--radius-md)] border max-w-md"
          style={{ color: '#dc2626', borderColor: '#dc2626', background: '#fef2f2' }}
        >
          {error}
        </div>
      )}
    </div>
  )
}
