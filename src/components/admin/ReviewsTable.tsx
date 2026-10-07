'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Check,
  X,
  Trash2,
  Loader2,
  BadgeCheck,
  ExternalLink,
  MessageSquare,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { StarRating } from '@/components/shop/StarRating'
import { RejectModal } from '@/components/admin/RejectModal'

export interface AdminReview {
  id: string
  product_id: string
  user_id: string
  order_id: string | null
  rating: number
  title: string | null
  body: string | null
  status: 'pending' | 'approved' | 'rejected'
  admin_note: string | null
  created_at: string
  profiles:
    | { full_name: string | null; email: string | null }
    | { full_name: string | null; email: string | null }[]
    | null
  products:
    | { id: string; name: string; slug: string }
    | { id: string; name: string; slug: string }[]
    | null
}

interface Props {
  reviews: AdminReview[]
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
}

export function ReviewsTable({ reviews }: Props) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<AdminReview | null>(null)

  const normalize = <T,>(val: T | T[] | null): T | null =>
    Array.isArray(val) ? val[0] || null : val

  const updateStatus = async (
    id: string,
    status: 'approved' | 'rejected' | 'pending',
    adminNote?: string | null
  ) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_note: adminNote ?? null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')

      toast.success(
        status === 'approved'
          ? 'Review approved — now public'
          : status === 'rejected'
          ? 'Review rejected'
          : 'Review reset to pending'
      )
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review permanently? This cannot be undone.')) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      toast.success('Review deleted')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setBusyId(null)
    }
  }

  if (reviews.length === 0) {
    return (
      <div
        className="p-12 rounded-[var(--radius-lg)] border text-center"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <MessageSquare
          size={40}
          className="mx-auto mb-3"
          style={{ color: 'var(--color-text-muted)' }}
        />
        <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          No reviews found
        </div>
        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Try changing the filter or wait for new submissions
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {reviews.map((review) => {
          const profile = normalize(review.profiles)
          const product = normalize(review.products)
          const name = profile?.full_name || 'Anonymous'
          const email = profile?.email || ''
          const verified = !!review.order_id
          const isBusy = busyId === review.id

          return (
            <div
              key={review.id}
              className="p-4 rounded-[var(--radius-lg)] border"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  {/* Header row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant={statusVariant[review.status] || 'default'} size="sm">
                      {review.status}
                    </Badge>
                    {verified && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: '#dcfce7', color: '#16a34a' }}
                      >
                        <BadgeCheck size={10} />
                        Verified
                      </span>
                    )}
                    <span
                      className="text-[10px]"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {new Date(review.created_at).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Product link */}
                  {product && (
                    <Link
                      href={`/product/${product.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-bold mb-2 hover:underline"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      {product.name}
                      <ExternalLink size={10} />
                    </Link>
                  )}

                  {/* User */}
                  <div className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                      {name}
                    </span>
                    {email && <span className="ml-2">· {email}</span>}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} size={14} showValue />
                  </div>

                  {/* Title + body */}
                  {review.title && (
                    <div
                      className="text-sm font-bold mb-1"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {review.title}
                    </div>
                  )}
                  {review.body && (
                    <div
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {review.body}
                    </div>
                  )}

                  {/* Admin note (if any) */}
                  {review.admin_note && (
                    <div
                      className="mt-3 text-xs p-2 rounded border"
                      style={{
                        background: 'var(--color-background)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      <span className="font-bold">Admin note:</span> {review.admin_note}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                {review.status !== 'approved' && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => updateStatus(review.id, 'approved')}
                    disabled={isBusy}
                  >
                    {isBusy ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Check size={12} />
                    )}
                    Approve
                  </Button>
                )}

                {review.status !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectTarget(review)}
                    disabled={isBusy}
                  >
                    <X size={12} />
                    Reject
                  </Button>
                )}

                {review.status === 'rejected' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus(review.id, 'pending')}
                    disabled={isBusy}
                  >
                    Reset to Pending
                  </Button>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(review.id)}
                  disabled={isBusy}
                  className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-bold transition hover:opacity-80 disabled:opacity-50"
                  style={{ color: '#dc2626' }}
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={async (note) => {
          if (!rejectTarget) return
          await updateStatus(rejectTarget.id, 'rejected', note)
          setRejectTarget(null)
        }}
      />
    </>
  )
}
