'use client'

import { useState } from 'react'
import { Tag, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface CouponData {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  discount: number
}

interface Props {
  orderAmount: number
  appliedCoupon: CouponData | null
  onApply: (coupon: CouponData | null) => void
}

export function CouponInput({ orderAmount, appliedCoupon, onApply }: Props) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const applyCoupon = async () => {
    if (!code.trim()) {
      setError('Enter a coupon code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          orderAmount,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid coupon')

      onApply({
        id: data.coupon.id,
        code: data.coupon.code,
        description: data.coupon.description,
        discount_type: data.coupon.discount_type,
        discount_value: data.coupon.discount_value,
        discount: data.discount,
      })
      setCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply coupon')
      onApply(null)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      applyCoupon()
    }
  }

  const handleRemove = () => {
    onApply(null)
    setCode('')
    setError('')
  }

  // ═══ Applied state ═══
  if (appliedCoupon) {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border-2"
        style={{
          background: 'var(--color-success-bg)',
          borderColor: 'var(--color-success)',
        }}
      >
        <CheckCircle size={18} style={{ color: 'var(--color-success)' }} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono font-bold text-sm" style={{ color: 'var(--color-success)' }}>
              {appliedCoupon.code}
            </span>
            <span className="text-xs font-bold" style={{ color: 'var(--color-success)' }}>
              −৳{appliedCoupon.discount.toFixed(2)}
            </span>
          </div>
          {appliedCoupon.description && (
            <div className="text-[10px] line-clamp-1" style={{ color: 'var(--color-success)' }}>
              {appliedCoupon.description}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="p-1 rounded hover:bg-black/10 flex-shrink-0"
          style={{ color: 'var(--color-success)' }}
          aria-label="Remove coupon"
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  // ═══ Input state — uses div, not form ═══
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Enter coupon code"
            className="w-full pl-10 pr-3 py-2.5 text-sm font-mono uppercase rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-background)',
              color: 'var(--color-text)',
            }}
          />
        </div>
        <button
          type="button"
          onClick={applyCoupon}
          disabled={loading || !code.trim()}
          className="px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          style={{ background: 'var(--color-primary)' }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
        </button>
      </div>

      {error && (
        <div
          className="flex items-center gap-2 text-xs p-2 rounded-[var(--radius-sm)]"
          style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}
        >
          <AlertCircle size={12} />
          {error}
        </div>
      )}
    </div>
  )
}
