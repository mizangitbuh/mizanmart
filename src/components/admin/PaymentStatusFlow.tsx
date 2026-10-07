'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { RefundModal } from '@/components/admin/RefundModal'
import {
  getAllowedPaymentTransitions,
  PAYMENT_LABELS,
  PAYMENT_EMOJI,
  type PaymentStatus,
} from '@/lib/orders/status-machine'

const variantMap: Record<PaymentStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  paid: 'success',
  failed: 'danger',
  refunded: 'info',
}

interface Props {
  orderId: string
  currentStatus: string
  orderTotal: number
  alreadyRefunded?: number
}

export function PaymentStatusFlow({
  orderId,
  currentStatus,
  orderTotal,
  alreadyRefunded = 0,
}: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refundModalOpen, setRefundModalOpen] = useState(false)

  const status = currentStatus as PaymentStatus
  const allowed = getAllowedPaymentTransitions(status)
  const isTerminal = allowed.length === 0

  const changeStatus = async (to: PaymentStatus) => {
    if (to === 'refunded') {
      setRefundModalOpen(true)
      return
    }

    if (!confirm(`Change payment status to "${PAYMENT_LABELS[to]}"?`)) return
    setBusy(to)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: to }),
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
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={variantMap[status] || 'default'}>
            {PAYMENT_EMOJI[status]} {PAYMENT_LABELS[status]}
          </Badge>

          {!isTerminal &&
            allowed.map((to) => (
              <button
                key={to}
                onClick={() => changeStatus(to)}
                disabled={busy !== null}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-md)] text-[11px] font-bold border transition disabled:opacity-50"
                style={{
                  borderColor: to === 'failed' ? '#dc2626' : 'var(--color-primary)',
                  color: to === 'failed' ? '#dc2626' : 'var(--color-primary)',
                  background: 'transparent',
                }}
              >
                {busy === to ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <ChevronRight size={11} />
                )}
                {PAYMENT_LABELS[to]}
              </button>
            ))}

          {isTerminal && (
            <span className="text-[10px] italic" style={{ color: 'var(--color-text-muted)' }}>
              Terminal
            </span>
          )}
        </div>

        {error && (
          <div
            className="text-[11px] px-2 py-1 rounded border"
            style={{ color: '#dc2626', borderColor: '#dc2626', background: '#fef2f2' }}
          >
            {error}
          </div>
        )}
      </div>

      <RefundModal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        orderId={orderId}
        orderTotal={orderTotal}
        alreadyRefunded={alreadyRefunded}
      />
    </>
  )
}
