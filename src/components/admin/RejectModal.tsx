'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: (note: string | null) => Promise<void> | void
  title?: string
  label?: string
  placeholder?: string
}

const REASON_PRESETS = [
  'Spam or promotional content',
  'Offensive or inappropriate language',
  'Off-topic (not about the product)',
  'Duplicate review',
  'Suspicious / fake review',
] as const

export function RejectModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Reject Review',
  label = 'Reason (optional)',
  placeholder = 'Explain why this review is being rejected (visible to admins only)...',
}: Props) {
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setNote('')
      setBusy(false)
    }
  }, [isOpen])

  const handleConfirm = async () => {
    setBusy(true)
    try {
      await onConfirm(note.trim() || null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="p-4 md:p-5 space-y-4">
        <div>
          <label
            className="block text-xs font-bold mb-1.5"
            style={{ color: 'var(--color-text)' }}
          >
            {label}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={placeholder}
            rows={3}
            maxLength={500}
            disabled={busy}
            className="w-full px-3 py-2 rounded-[var(--radius-md)] border text-sm resize-none"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          />
          <div
            className="text-[10px] text-right mt-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {note.length}/500
          </div>
        </div>

        {/* Quick reason presets */}
        <div>
          <div
            className="text-[10px] font-bold uppercase tracking-wide mb-2"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Quick reasons
          </div>
          <div className="flex flex-wrap gap-2">
            {REASON_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() =>
                  setNote((prev) =>
                    prev ? `${prev}; ${preset}` : preset
                  )
                }
                disabled={busy}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full border transition hover:opacity-80 disabled:opacity-50"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  background: 'var(--color-background)',
                }}
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>

        <div
          className="text-[11px] italic p-2 rounded"
          style={{
            background: 'var(--color-background)',
            color: 'var(--color-text-muted)',
          }}
        >
          ℹ️ Rejection note is visible to admins only — not shown to the reviewer.
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={busy}
            loading={busy}
          >
            Reject Review
          </Button>
        </div>
      </div>
    </Modal>
  )
}
