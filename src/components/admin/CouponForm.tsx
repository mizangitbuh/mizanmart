'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Ticket, Percent, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  coupon: any | null
}

export function CouponForm({ isOpen, onClose, onSuccess, coupon }: Props) {
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [minOrder, setMinOrder] = useState('0')
  const [maxDiscount, setMaxDiscount] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [perCustomer, setPerCustomer] = useState('1')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (coupon) {
        setCode(coupon.code || '')
        setDescription(coupon.description || '')
        setDiscountType(coupon.discount_type || 'percentage')
        setDiscountValue(String(coupon.discount_value || ''))
        setMinOrder(String(coupon.min_order_amount || '0'))
        setMaxDiscount(coupon.max_discount_amount ? String(coupon.max_discount_amount) : '')
        setUsageLimit(coupon.usage_limit ? String(coupon.usage_limit) : '')
        setPerCustomer(String(coupon.per_customer_limit || '1'))
        setStartDate(coupon.start_date ? new Date(coupon.start_date).toISOString().slice(0, 16) : '')
        setEndDate(coupon.end_date ? new Date(coupon.end_date).toISOString().slice(0, 16) : '')
        setIsActive(coupon.is_active !== false)
      } else {
        setCode('')
        setDescription('')
        setDiscountType('percentage')
        setDiscountValue('')
        setMinOrder('0')
        setMaxDiscount('')
        setUsageLimit('')
        setPerCustomer('1')
        setStartDate('')
        setEndDate('')
        setIsActive(true)
      }
      setError('')
    }
  }, [isOpen, coupon])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      setError('Coupon code required')
      return
    }
    if (!discountValue || Number(discountValue) <= 0) {
      setError('Valid discount value required')
      return
    }
    if (discountType === 'percentage' && Number(discountValue) > 100) {
      setError('Percentage cannot exceed 100')
      return
    }

    setSaving(true)
    setError('')

    try {
      const payload: any = {
        code: code.toUpperCase().trim(),
        description: description || null,
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_amount: Number(minOrder) || 0,
        max_discount_amount: maxDiscount ? Number(maxDiscount) : null,
        usage_limit: usageLimit ? Number(usageLimit) : null,
        per_customer_limit: Number(perCustomer) || 1,
        start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : null,
        is_active: isActive,
      }

      if (coupon) payload.id = coupon.id

      const res = await fetch('/api/admin/coupons', {
        method: coupon ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save coupon')

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl my-8 rounded-[var(--radius-lg)] border overflow-hidden"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-primary-light)' }}>
              <Ticket size={18} style={{ color: 'var(--color-primary)' }} />
            </div>
            <div>
              <h2 className="font-black text-sm" style={{ color: 'var(--color-text)' }}>
                {coupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {coupon ? `Editing: ${coupon.code}` : 'Add a new discount code'}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--color-surface-hover)]" style={{ color: 'var(--color-text-muted)' }} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Code + Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Coupon Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="WELCOME10"
                required
                className="w-full px-4 py-2.5 text-sm font-mono uppercase rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="New customer offer"
                className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
              />
            </div>
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Discount Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDiscountType('percentage')}
                className="flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-[var(--radius-md)] transition-colors"
                style={{
                  background: discountType === 'percentage' ? 'var(--color-primary)' : 'var(--color-background)',
                  color: discountType === 'percentage' ? 'white' : 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Percent size={14} />
                Percentage (%)
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('fixed')}
                className="flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-[var(--radius-md)] transition-colors"
                style={{
                  background: discountType === 'fixed' ? 'var(--color-primary)' : 'var(--color-background)',
                  color: discountType === 'fixed' ? 'white' : 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <DollarSign size={14} />
                Fixed Amount (৳)
              </button>
            </div>
          </div>

          {/* Value + Min Order + Max Discount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                {discountType === 'percentage' ? 'Percentage Off *' : 'Amount Off (৳) *'}
              </label>
              <input
                type="number"
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percentage' ? '10' : '100'}
                required
                className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Min. Order (৳)
              </label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Max Discount (৳)
              </label>
              <input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="No limit"
                disabled={discountType === 'fixed'}
                className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-50"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
              />
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Total Usage Limit
              </label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Unlimited"
                className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Per Customer Limit
              </label>
              <input
                type="number"
                value={perCustomer}
                onChange={(e) => setPerCustomer(e.target.value)}
                placeholder="1"
                className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                Start Date
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                End Date
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
              />
            </div>
          </div>

          {/* Active */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-[var(--radius-md)]" style={{ background: 'var(--color-background)' }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <div>
              <div className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>Active</div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Coupon can be used at checkout</div>
            </div>
          </label>

          {error && (
            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-[var(--radius-md)]">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? <Loader2 size={16} className="animate-spin" /> : coupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
