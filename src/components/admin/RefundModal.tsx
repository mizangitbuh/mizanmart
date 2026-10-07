'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatPrice } from '@/lib/utils'

interface Props {
  isOpen: boolean
  onClose: () => void
  orderId: string
  orderTotal: number
  alreadyRefunded?: number
}

const REASONS = [
  { value: 'customer_return', label: 'Customer return' },
  { value: 'damaged', label: 'Damaged product' },
  { value: 'wrong_item', label: 'Wrong item sent' },
  { value: 'not_delivered', label: 'Not delivered' },
  { value: 'other', label: 'Other' },
] as const

export function RefundModal({
  isOpen,
  onClose,
  orderId,
  orderTotal,
  alreadyRefunded = 0,
}: Props) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState<string>('customer_return')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remaining = Math.max(0, orderTotal - alreadyRefunded)
  const parsedAmount = Number(amount) || 0
  const isValid = parsedAmount > 0 && parsedAmount <= remaining

  const handleSubmit = async () => {
    if (!isValid) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parsedAmount,
          reason,
          note: note.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Refund failed')

      setAmount('')
      setNote('')
      setReason('customer_return')
      onClose()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Refund failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue Refund" maxWidth="md">
      <div className="p-4 md:p-5 space-y-4">
        {error && (
          <div
            className="text-xs px-3 py-2 rounded-[var(--radius-md)] border"
            style={{ color: '#dc2626', borderColor: '#dc2626', background: '#fef2f2' }}
          >
            {error}
          </div>
        )}

        <div
          className="grid grid-cols-2 gap-3 p-3 rounded-[var(--radius-md)] text-xs"
          style={{ background: 'var(--color-background)' }}
        >
          <div>
            <div style={{ color: 'var(--color-text-muted)' }}>Order Total</div>
            <div className="font-black mt-0.5" style={{ color: 'var(--color-text)' }}>
              {formatPrice(orderTotal)}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--color-text-muted)' }}>Refundable</div>
            <div className="font-black mt-0.5" style={{ color: 'var(--color-primary)' }}>
              {formatPrice(remaining)}
            </div>
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-bold mb-1.5"
            style={{ color: 'var(--color-text)' }}
          >
            Refund Amount (৳)
          </label>
          <Input
            type="number"
            min="0"
            max={remaining}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`0 - ${remaining}`}
            disabled={busy}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setAmount(String(remaining))}
              className="text-[11px] font-bold px-2 py-1 rounded border transition hover:opacity-80"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}
              disabled={busy}
            >
              Full ({formatPrice(remaining)})
            </button>
            <button
              type="button"
              onClick={() => setAmount(String(Math.round(remaining / 2)))}
              className="text-[11px] font-bold px-2 py-1 rounded border transition hover:opacity-80"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}
              disabled={busy}
            >
              Half
            </button>
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-bold mb-1.5"
            style={{ color: 'var(--color-text)' }}
          >
            Reason
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={busy}
            className="w-full px-3 py-2 rounded-[var(--radius-md)] border text-sm"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="block text-xs font-bold mb-1.5"
            style={{ color: 'var(--color-text)' }}
          >
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Extra details for audit trail..."
            rows={2}
            maxLength={500}
            disabled={busy}
            className="w-full px-3 py-2 rounded-[var(--radius-md)] border text-sm resize-none"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            disabled={!isValid || busy}
            loading={busy}
          >
            Refund {parsedAmount > 0 ? formatPrice(parsedAmount) : ''}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
