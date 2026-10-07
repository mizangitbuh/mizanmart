'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StarRating } from '@/components/shop/StarRating'

interface Props {
  productId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReviewForm({ productId, onSuccess, onCancel }: Props) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = rating > 0 && !busy

  const handleSubmit = async () => {
    if (!canSubmit) return
    setBusy(true)
    setError(null)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          rating,
          title: title.trim() || null,
          body: body.trim() || null,
        }),
      })

      const data = await res.json()

      if (res.status === 401) {
        toast.error('Please sign in to write a review')
        router.push('/login')
        return
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      toast.success(
        data.message ||
          'Review submitted! It will appear after admin approval.'
      )
      setRating(0)
      setTitle('')
      setBody('')
      onSuccess?.()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="p-5 rounded-[var(--radius-lg)] border"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-primary)',
        borderWidth: '1.5px',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-black text-sm uppercase tracking-wide"
          style={{ color: 'var(--color-text)' }}
        >
          Write a Review
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded hover:bg-[var(--color-surface-hover)]"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Cancel"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {error && (
        <div
          className="text-xs px-3 py-2 rounded-[var(--radius-md)] border mb-4"
          style={{ color: '#dc2626', borderColor: '#dc2626', background: '#fef2f2' }}
        >
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            className="block text-xs font-bold mb-2"
            style={{ color: 'var(--color-text)' }}
          >
            Rating <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <StarRating mode="interactive" value={rating} onChange={setRating} size={26} />
        </div>

        <div>
          <label
            className="block text-xs font-bold mb-1.5"
            style={{ color: 'var(--color-text)' }}
          >
            Title (optional)
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Excellent quality!"
            maxLength={120}
            disabled={busy}
          />
        </div>

        <div>
          <label
            className="block text-xs font-bold mb-1.5"
            style={{ color: 'var(--color-text)' }}
          >
            Review (optional)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            maxLength={2000}
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
            {body.length}/2000
          </div>
        </div>

        <div
          className="text-[11px] italic p-2 rounded"
          style={{ background: 'var(--color-background)', color: 'var(--color-text-muted)' }}
        >
          ℹ️ Your review will appear publicly after admin approval.
          Verified purchases get a special badge.
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={busy}
          >
            {busy ? (
              <>Submitting...</>
            ) : (
              <>
                <Send size={14} />
                Submit Review
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
