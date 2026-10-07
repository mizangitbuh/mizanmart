'use client'

import { useState } from 'react'
import { FileText, Truck, RotateCcw, Package, Star, PenSquare, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ReviewList, type ReviewItem, type ReviewStats } from '@/components/shop/ReviewList'
import { ReviewForm } from '@/components/shop/ReviewForm'

interface Props {
  productId: string
  description: string | null
  sku: string | null
  category: string | null
  rating?: number
  reviewCount?: number
  reviews?: ReviewItem[]
  stats?: ReviewStats
  isLoggedIn?: boolean
  userReviewStatus?: 'pending' | 'approved' | 'rejected' | null
}

type TabKey = 'description' | 'delivery' | 'returns' | 'reviews'

export function ProductDetailTabs({
  productId,
  description,
  sku,
  category,
  rating = 0,
  reviewCount = 0,
  reviews = [],
  stats,
  isLoggedIn = false,
  userReviewStatus = null,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('description')
  const [showForm, setShowForm] = useState(false)

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'description', label: 'Description', icon: FileText },
    { key: 'delivery', label: 'Delivery', icon: Truck },
    { key: 'returns', label: 'Returns', icon: RotateCcw },
    { key: 'reviews', label: 'Reviews', icon: Star },
  ]

  // Build stats fallback if not provided
  const effectiveStats: ReviewStats = stats || {
    average: rating,
    count: reviewCount,
    distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: 0 })),
  }

  const canWriteReview = isLoggedIn && !userReviewStatus

  return (
    <div className="rounded-[var(--radius-lg)] border bg-[var(--color-surface)] overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      {/* Tab Headers */}
      <div className="flex border-b overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors relative"
              style={{
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                background: active ? 'var(--color-primary-light)' : 'transparent',
              }}
            >
              <Icon size={16} />
              {tab.label}
              {tab.key === 'reviews' && effectiveStats.count > 0 && (
                <span
                  className="text-[10px] font-bold px-1.5 rounded-full"
                  style={{
                    background: active ? 'var(--color-primary)' : 'var(--color-border)',
                    color: active ? 'white' : 'var(--color-text-muted)',
                  }}
                >
                  {effectiveStats.count}
                </span>
              )}
              {active && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: 'var(--color-primary)' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="p-5 md:p-6 text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
        {activeTab === 'description' && (
          <div className="space-y-4">
            <p style={{ color: description ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
              {description || 'No description available for this product.'}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              {sku && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>SKU</span>
                  <div className="font-mono font-medium" style={{ color: 'var(--color-text)' }}>{sku}</div>
                </div>
              )}
              {category && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Category</span>
                  <div className="font-medium" style={{ color: 'var(--color-text)' }}>{category}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Package size={18} style={{ color: 'var(--color-primary)' }} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold mb-1" style={{ color: 'var(--color-text)' }}>Inside Dhaka</div>
                <div style={{ color: 'var(--color-text-secondary)' }}>৳60 — 1-2 business days</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Package size={18} style={{ color: 'var(--color-primary)' }} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold mb-1" style={{ color: 'var(--color-text)' }}>Outside Dhaka</div>
                <div style={{ color: 'var(--color-text-secondary)' }}>৳120 — 3-5 business days</div>
              </div>
            </div>
            <div className="flex gap-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <Truck size={18} style={{ color: 'var(--color-success)' }} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold mb-1" style={{ color: 'var(--color-success)' }}>Free Delivery</div>
                <div style={{ color: 'var(--color-text-secondary)' }}>On orders over ৳1000</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <RotateCcw size={18} style={{ color: 'var(--color-primary)' }} className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold mb-1" style={{ color: 'var(--color-text)' }}>7-Day Easy Return</div>
                <div style={{ color: 'var(--color-text-secondary)' }}>
                  If you're not satisfied, return the product within 7 days of delivery in original condition.
                </div>
              </div>
            </div>
            <div className="pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="font-bold mb-1" style={{ color: 'var(--color-text)' }}>Conditions</div>
              <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                <li>Product must be unused</li>
                <li>Original packaging required</li>
                <li>Return shipping is customer's responsibility unless product is defective</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-5">
            {/* Action bar — write review OR status */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {effectiveStats.count > 0
                  ? `${effectiveStats.count} approved review${effectiveStats.count !== 1 ? 's' : ''}`
                  : 'Share your thoughts'}
              </div>

              {userReviewStatus === 'pending' && (
                <div
                  className="inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-[var(--radius-md)]"
                  style={{ background: '#fef3c7', color: '#92400e' }}
                >
                  <Clock size={12} />
                  Your review is pending approval
                </div>
              )}

              {userReviewStatus === 'approved' && (
                <div
                  className="inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-[var(--radius-md)]"
                  style={{ background: '#dcfce7', color: '#16a34a' }}
                >
                  ✓ You reviewed this product
                </div>
              )}

              {!isLoggedIn && (
                <a
                  href="/login"
                  className="text-xs font-bold"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Sign in to write a review →
                </a>
              )}

              {canWriteReview && !showForm && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowForm(true)}
                >
                  <PenSquare size={14} />
                  Write a Review
                </Button>
              )}
            </div>

            {/* Form */}
            {showForm && (
              <ReviewForm
                productId={productId}
                onSuccess={() => setShowForm(false)}
                onCancel={() => setShowForm(false)}
              />
            )}

            {/* List */}
            <ReviewList reviews={reviews} stats={effectiveStats} />
          </div>
        )}
      </div>
    </div>
  )
}
