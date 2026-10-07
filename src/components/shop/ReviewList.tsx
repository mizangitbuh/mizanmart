'use client'

import { BadgeCheck, MessageSquare } from 'lucide-react'
import { StarRating } from '@/components/shop/StarRating'
import { Badge } from '@/components/ui/Badge'

export interface ReviewItem {
  id: string
  rating: number
  title: string | null
  body: string | null
  order_id: string | null
  created_at: string
  user_id: string
  profiles:
    | { full_name: string | null }
    | { full_name: string | null }[]
    | null
}

export interface ReviewStats {
  average: number
  count: number
  distribution: { star: number; count: number }[]
}

interface Props {
  reviews: ReviewItem[]
  stats: ReviewStats
}

export function ReviewList({ reviews, stats }: Props) {
  if (stats.count === 0) {
    return (
      <div
        className="p-8 rounded-[var(--radius-lg)] border text-center"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <MessageSquare
          size={36}
          className="mx-auto mb-3"
          style={{ color: 'var(--color-text-muted)' }}
        />
        <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          No reviews yet
        </div>
        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Be the first to review this product
        </div>
      </div>
    )
  }

  const maxCount = Math.max(...stats.distribution.map((d) => d.count), 1)

  return (
    <div className="space-y-5">
      {/* Stats Card */}
      <div
        className="p-5 rounded-[var(--radius-lg)] border grid md:grid-cols-[200px_1fr] gap-5"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {/* Left: Average */}
        <div
          className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r pb-5 md:pb-0 md:pr-5"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="text-5xl font-black mb-1" style={{ color: 'var(--color-primary)' }}>
            {stats.average.toFixed(1)}
          </div>
          <StarRating rating={stats.average} size={16} />
          <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
            {stats.count} review{stats.count !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Right: Distribution */}
        <div className="space-y-2">
          {stats.distribution.map(({ star, count }) => {
            const pct = stats.count > 0 ? (count / stats.count) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span
                  className="font-bold w-10 text-right"
                  style={{ color: 'var(--color-text)' }}
                >
                  {star} ★
                </span>
                <div
                  className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ background: 'var(--color-background)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: 'var(--color-primary)',
                    }}
                  />
                </div>
                <span
                  className="font-mono w-8 text-right"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.map((review) => {
          const profilesRaw = review.profiles
          const profilesObj = Array.isArray(profilesRaw)
            ? profilesRaw[0] || null
            : profilesRaw
          const name = profilesObj?.full_name || 'Anonymous'
          const initial = name.charAt(0).toUpperCase()
          const verified = !!review.order_id

          return (
            <div
              key={review.id}
              className="p-4 rounded-[var(--radius-lg)] border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className="font-bold text-sm"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {name}
                    </span>
                    {verified && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: '#dcfce7', color: '#16a34a' }}
                      >
                        <BadgeCheck size={10} />
                        Verified Purchase
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} size={12} />
                    <span
                      className="text-[10px]"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {new Date(review.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {review.title && (
                    <div
                      className="font-bold text-sm mb-1"
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
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
