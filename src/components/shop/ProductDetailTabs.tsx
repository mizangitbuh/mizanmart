'use client'

import { useState } from 'react'
import { FileText, Truck, RotateCcw, Package, Star } from 'lucide-react'

interface Props {
  description: string | null
  sku: string | null
  category: string | null
  rating?: number
  reviewCount?: number
}

type TabKey = 'description' | 'delivery' | 'returns' | 'reviews'

export function ProductDetailTabs({ description, sku, category, rating = 0, reviewCount = 0 }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('description')

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'description', label: 'Description', icon: FileText },
    { key: 'delivery', label: 'Delivery', icon: Truck },
    { key: 'returns', label: 'Returns', icon: RotateCcw },
    { key: 'reviews', label: 'Reviews', icon: Star },
  ]

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
          <div className="text-center py-8">
            <Star size={40} className="mx-auto mb-3 star-filled fill-current" />
            <div className="text-2xl font-black mb-1" style={{ color: 'var(--color-text)' }}>
              {rating > 0 ? rating.toFixed(1) : 'No ratings yet'}
            </div>
            <div className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              {reviewCount > 0 ? `Based on ${reviewCount} reviews` : 'Be the first to review'}
            </div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Customer reviews coming soon
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
