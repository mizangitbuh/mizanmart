'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Ticket, Copy, Check, Clock, Percent, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { CouponForm } from '@/components/admin/CouponForm'
import { formatPrice } from '@/lib/utils'

interface Coupon {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  max_discount_amount: number | null
  usage_limit: number | null
  usage_count: number
  per_customer_limit: number | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
}

interface Props {
  coupons: Coupon[]
}

export function CouponsTable({ coupons }: Props) {
  const router = useRouter()
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleNew = () => {
    setEditCoupon(null)
    setShowForm(true)
  }

  const handleEdit = (coupon: Coupon) => {
    setEditCoupon(coupon)
    setShowForm(true)
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 1500)
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Delete failed')
      }
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const handleSuccess = () => {
    router.refresh()
  }

  const getStatus = (coupon: Coupon): { label: string; variant: 'success' | 'warning' | 'danger' | 'default' } => {
    if (!coupon.is_active) return { label: 'Disabled', variant: 'default' }
    const now = new Date()
    if (coupon.end_date && new Date(coupon.end_date) < now) return { label: 'Expired', variant: 'danger' }
    if (coupon.start_date && new Date(coupon.start_date) > now) return { label: 'Scheduled', variant: 'warning' }
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) return { label: 'Limit Reached', variant: 'danger' }
    return { label: 'Active', variant: 'success' }
  }

  if (coupons.length === 0) {
    return (
      <>
        <div
          className="p-12 rounded-[var(--radius-lg)] border text-center"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <Ticket size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>
            No coupons yet
          </div>
          <div className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Create your first discount coupon
          </div>
          <button
            onClick={handleNew}
            className="inline-block px-5 py-2.5 rounded-[var(--radius-md)] font-bold text-sm text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            + Create Coupon
          </button>
        </div>

        <CouponForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSuccess={handleSuccess}
          coupon={editCoupon}
        />
      </>
    )
  }

  return (
    <>
      <div
        className="rounded-[var(--radius-lg)] border overflow-hidden"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-background)' }}>
                <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Coupon
                </th>
                <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Discount
                </th>
                <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide hidden md:table-cell" style={{ color: 'var(--color-text-muted)' }}>
                  Min Order
                </th>
                <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-wide hidden lg:table-cell" style={{ color: 'var(--color-text-muted)' }}>
                  Usage
                </th>
                <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-wide hidden md:table-cell" style={{ color: 'var(--color-text-muted)' }}>
                  Expires
                </th>
                <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Status
                </th>
                <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const status = getStatus(coupon)
                const isDeleting = deleting === coupon.id

                return (
                  <tr
                    key={coupon.id}
                    className="border-t transition-colors hover:bg-[var(--color-surface-hover)]"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] font-mono font-bold text-xs transition-colors hover:opacity-80"
                          style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                          title="Click to copy"
                        >
                          {copiedCode === coupon.code ? <Check size={11} /> : <Copy size={11} />}
                          {coupon.code}
                        </button>
                      </div>
                      {coupon.description && (
                        <div className="text-[10px] mt-1 line-clamp-1" style={{ color: 'var(--color-text-muted)' }}>
                          {coupon.description}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-black text-sm" style={{ color: 'var(--color-primary)' }}>
                        {coupon.discount_type === 'percentage' ? (
                          <>
                            <Percent size={13} />
                            {coupon.discount_value}%
                          </>
                        ) : (
                          <>
                            <DollarSign size={13} />
                            {formatPrice(coupon.discount_value)}
                          </>
                        )}
                      </div>
                      {coupon.max_discount_amount && (
                        <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                          Max: {formatPrice(coupon.max_discount_amount)}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                        {coupon.min_order_amount > 0 ? formatPrice(coupon.min_order_amount) : '—'}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <div className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
                        {coupon.usage_count}
                        {coupon.usage_limit && (
                          <span style={{ color: 'var(--color-text-muted)' }}> / {coupon.usage_limit}</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      {coupon.end_date ? (
                        <div className="text-xs flex items-center justify-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                          <Clock size={10} />
                          {new Date(coupon.end_date).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: '2-digit'
                          })}
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <Badge variant={status.variant} size="sm">{status.label}</Badge>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-hover)]"
                          style={{ color: 'var(--color-primary)' }}
                          aria-label="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id, coupon.code)}
                          disabled={isDeleting}
                          className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-error-bg)] disabled:opacity-50"
                          style={{ color: 'var(--color-error)' }}
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CouponForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleSuccess}
        coupon={editCoupon}
      />
    </>
  )
}
