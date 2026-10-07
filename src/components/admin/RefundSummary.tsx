import { RotateCcw } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Props {
  refundAmount: number
  refundReason: string | null
  refundedAt: string | null
  orderTotal: number
}

const REASON_LABELS: Record<string, string> = {
  customer_return: 'Customer return',
  damaged: 'Damaged product',
  wrong_item: 'Wrong item sent',
  not_delivered: 'Not delivered',
  other: 'Other',
}

export function RefundSummary({
  refundAmount,
  refundReason,
  refundedAt,
  orderTotal,
}: Props) {
  if (!refundAmount || refundAmount <= 0) return null

  const isPartial = refundAmount < orderTotal
  const remaining = Math.max(0, orderTotal - refundAmount)

  return (
    <div
      className="p-5 rounded-[var(--radius-lg)] border"
      style={{
        background: 'var(--color-surface)',
        borderColor: '#f59e0b',
        borderWidth: '1.5px',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <RotateCcw size={14} style={{ color: '#f59e0b' }} />
        <h2
          className="text-xs font-black uppercase tracking-wide"
          style={{ color: 'var(--color-text)' }}
        >
          {isPartial ? 'Partial Refund' : 'Full Refund'}
        </h2>
        {refundedAt && (
          <span className="text-[10px] ml-auto" style={{ color: 'var(--color-text-muted)' }}>
            {new Date(refundedAt).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <div style={{ color: 'var(--color-text-muted)' }}>Refunded</div>
          <div className="font-black mt-0.5 text-base" style={{ color: '#f59e0b' }}>
            {formatPrice(refundAmount)}
          </div>
        </div>
        {isPartial && (
          <div>
            <div style={{ color: 'var(--color-text-muted)' }}>Remaining</div>
            <div className="font-black mt-0.5 text-base" style={{ color: 'var(--color-text)' }}>
              {formatPrice(remaining)}
            </div>
          </div>
        )}
        <div>
          <div style={{ color: 'var(--color-text-muted)' }}>Reason</div>
          <div className="font-semibold mt-0.5" style={{ color: 'var(--color-text)' }}>
            {refundReason ? REASON_LABELS[refundReason] || refundReason : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}
