'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Check, CreditCard, Ticket } from 'lucide-react'
import { CouponInput } from '@/components/shop/CouponInput'

interface CouponData {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  discount: number
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)
  const [storeSettings, setStoreSettings] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: '',
  })

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => setStoreSettings(data))
      .catch(() => {})
  }, [])

  const subtotal = total()
  const isInsideDhaka =
    form.city?.trim().toLowerCase().includes('dhaka') || form.city?.trim().includes('ঢাকা')
  const insideShipping = Number(storeSettings?.inside_dhaka_shipping ?? 60)
  const outsideShipping = Number(storeSettings?.outside_dhaka_shipping ?? 120)
  const freeThreshold = Number(storeSettings?.free_shipping_threshold ?? 1000)
  const freeEnabled = storeSettings?.free_shipping_enabled ?? true

  const baseShipping = form.city ? (isInsideDhaka ? insideShipping : outsideShipping) : insideShipping
  const isFree = freeEnabled && subtotal >= freeThreshold
  const shipping = isFree ? 0 : baseShipping
  const discount = appliedCoupon?.discount || 0
  const grandTotal = Math.max(0, subtotal + shipping - discount)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        setForm((f) => ({
          ...f,
          email: data.user.email || '',
          name: data.user.user_metadata?.full_name || '',
          phone: data.user.user_metadata?.phone || '',
        }))
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form,
          items,
          subtotal,
          shipping,
          discount,
          couponCode: appliedCoupon?.code || null,
          couponId: appliedCoupon?.id || null,
          grandTotal,
          paymentMethod,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Order failed')

      clearCart()
      router.push(`/order-success/${data.orderNumber}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
        <div className="container-main py-20 text-center">
          <ShoppingBag size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--color-text)' }}>
            Your Cart is Empty
          </h1>
          <Link
            href="/products"
            className="inline-block mt-4 px-6 py-3 rounded-full font-bold text-sm text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            Shop Now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      <div className="container-main py-6">
        <h1 className="text-2xl md:text-3xl font-black mb-6" style={{ color: 'var(--color-text)' }}>
          Checkout
        </h1>

        {!user && (
          <div
            className="mb-6 p-4 rounded-[var(--radius-lg)] border text-sm"
            style={{
              background: 'var(--color-primary-light)',
              borderColor: 'var(--color-primary)',
            }}
          >
            <span style={{ color: 'var(--color-text)' }}>Already have an account? </span>
            <Link
              href="/login"
              className="font-bold hover:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Login
            </Link>
            <span style={{ color: 'var(--color-text-muted)' }}> for faster checkout</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Shipping Info */}
            <div
              className="p-5 md:p-6 rounded-[var(--radius-lg)] border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-lg font-black mb-5 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <span
                  className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--color-primary)' }}
                >
                  1
                </span>
                Shipping Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text)' }}>
                    Full Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text)' }}>
                    Phone *
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  placeholder="you@example.com"
                />
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text)' }}>
                  Address *
                </label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  placeholder="Village / Road / House"
                />
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text)' }}>
                  City *
                </label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  placeholder="Dhaka"
                />
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text)' }}>
                  Notes (optional)
                </label>
                <input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  placeholder="Delivery instructions"
                />
              </div>
            </div>

            {/* Coupon Section */}
            <div
              className="p-5 md:p-6 rounded-[var(--radius-lg)] border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-lg font-black mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <Ticket size={18} style={{ color: 'var(--color-primary)' }} />
                Have a Coupon?
              </h2>
              <CouponInput
                orderAmount={subtotal}
                appliedCoupon={appliedCoupon}
                onApply={setAppliedCoupon}
              />
            </div>

            {/* Payment Method */}
            <div
              className="p-5 md:p-6 rounded-[var(--radius-lg)] border space-y-3"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-lg font-black mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <span
                  className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold"
                  style={{ background: 'var(--color-primary)' }}
                >
                  3
                </span>
                Payment Method
              </h2>

              <div className="space-y-2.5">
                {/* Cash on Delivery */}
                {storeSettings?.cod_enabled !== false && (
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-center gap-3 p-4 rounded-[var(--radius-md)] border-2 cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'cod' ? 'border-[var(--color-primary)]' : 'border-gray-400'
                      }`}
                    >
                      {paymentMethod === 'cod' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                      )}
                    </div>
                    <CreditCard
                      size={20}
                      className={paymentMethod === 'cod' ? 'text-[var(--color-primary)]' : 'text-gray-500'}
                    />
                    <div className="flex-1">
                      <div className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                        Cash on Delivery
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        Pay when you receive the order at your doorstep
                      </div>
                    </div>
                    {paymentMethod === 'cod' && <Check size={18} className="text-[var(--color-primary)]" />}
                  </div>
                )}

                {/* bKash */}
                {storeSettings?.bkash_enabled && (
                  <div
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-4 rounded-[var(--radius-md)] border-2 cursor-pointer transition-all space-y-2 ${
                      paymentMethod === 'bkash'
                        ? 'border-[#E2136E] bg-[#E2136E]/5'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'bkash' ? 'border-[#E2136E]' : 'border-gray-400'
                        }`}
                      >
                        {paymentMethod === 'bkash' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#E2136E]" />
                        )}
                      </div>
                      <div className="flex-1 font-bold text-sm text-[#E2136E]">
                        বিকাশ পেমেন্ট (bKash)
                      </div>
                      {paymentMethod === 'bkash' && <Check size={18} className="text-[#E2136E]" />}
                    </div>
                    {paymentMethod === 'bkash' && (
                      <div className="pl-8 text-xs space-y-1 text-[var(--color-text-muted)]">
                        <div>
                          নাম্বার:{' '}
                          <strong className="text-[var(--color-text)] font-mono">
                            {storeSettings.bkash_number || 'আমাদের টিম যোগাযোগ করবে'}
                          </strong>{' '}
                          ({storeSettings.bkash_type || 'personal'})
                        </div>
                        <div>অর্ডার প্লেস করার পর উল্লেখিত বিকাশ নম্বরে টাকা পাঠিয়ে অর্ডার সম্পন্ন করুন।</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Nagad */}
                {storeSettings?.nagad_enabled && (
                  <div
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-4 rounded-[var(--radius-md)] border-2 cursor-pointer transition-all space-y-2 ${
                      paymentMethod === 'nagad'
                        ? 'border-[#F7941D] bg-[#F7941D]/5'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'nagad' ? 'border-[#F7941D]' : 'border-gray-400'
                        }`}
                      >
                        {paymentMethod === 'nagad' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#F7941D]" />
                        )}
                      </div>
                      <div className="flex-1 font-bold text-sm text-[#F7941D]">
                        নগদ পেমেন্ট (Nagad)
                      </div>
                      {paymentMethod === 'nagad' && <Check size={18} className="text-[#F7941D]" />}
                    </div>
                    {paymentMethod === 'nagad' && (
                      <div className="pl-8 text-xs space-y-1 text-[var(--color-text-muted)]">
                        <div>
                          নাম্বার:{' '}
                          <strong className="text-[var(--color-text)] font-mono">
                            {storeSettings.nagad_number || 'আমাদের টিম যোগাযোগ করবে'}
                          </strong>{' '}
                          ({storeSettings.nagad_type || 'personal'})
                        </div>
                        <div>অর্ডার প্লেস করার পর উল্লেখিত নগদ নম্বরে টাকা পাঠিয়ে অর্ডার সম্পন্ন করুন।</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-28 p-5 md:p-6 rounded-[var(--radius-lg)] border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-lg font-black mb-5 pb-4 border-b" style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}>
                Order Summary
              </h2>

              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm gap-3">
                    <span className="truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold flex-shrink-0" style={{ color: 'var(--color-text)' }}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                  <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{formatPrice(subtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between" style={{ color: 'var(--color-success)' }}>
                    <span className="flex items-center gap-1">
                      <Ticket size={12} />
                      {appliedCoupon.code}
                    </span>
                    <span className="font-bold">−{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
                  <span className="font-semibold" style={{ color: shipping === 0 ? 'var(--color-success)' : 'var(--color-text)' }}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between items-center mb-5" style={{ borderColor: 'var(--color-border)' }}>
                <span className="font-bold" style={{ color: 'var(--color-text)' }}>Total</span>
                <span className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>
                  {formatPrice(grandTotal)}
                </span>
              </div>

              {error && (
                <div className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-[var(--radius-md)]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full font-bold text-sm text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'var(--color-primary)' }}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>

              <p className="text-xs text-center mt-3" style={{ color: 'var(--color-text-muted)' }}>
                By placing order you agree to our terms
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
