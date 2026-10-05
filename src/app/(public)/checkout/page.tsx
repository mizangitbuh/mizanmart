'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Check, CreditCard } from 'lucide-react'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: '',
  })

  const subtotal = total()
  const shipping = subtotal > 1000 ? 0 : 60
  const grandTotal = subtotal + shipping

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
        body: JSON.stringify({ form, items, subtotal, shipping, grandTotal }),
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
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="container-main py-20 text-center">
          <ShoppingBag size={48} className="mx-auto text-[var(--color-text-light)] mb-4" />
          <h1 className="text-2xl font-black mb-2">Your Cart is Empty</h1>
          <Link href="/products" className="inline-block mt-4 px-6 py-3 bg-[var(--color-primary)] text-white rounded-full font-bold text-sm">
            Shop Now
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="container-main py-6">
        <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text)] mb-6">Checkout</h1>

        {!user && (
          <div className="mb-6 p-4 rounded-xl bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 text-sm">
            <span className="text-[var(--color-text)]">Already have an account? </span>
            <Link href="/login" className="text-[var(--color-primary)] hover:underline font-bold">Login</Link>
            <span className="text-[var(--color-text-muted)]"> for faster checkout</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Shipping Info */}
            <div className="p-5 md:p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <h2 className="text-lg font-black text-[var(--color-text)] mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">1</span>
                Shipping Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-2 uppercase tracking-wide">Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] mb-2 uppercase tracking-wide">Phone *</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-[var(--color-text)] mb-2 uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="you@example.com"
                />
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-[var(--color-text)] mb-2 uppercase tracking-wide">Address *</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="Village / Road / House"
                />
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-[var(--color-text)] mb-2 uppercase tracking-wide">City *</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="Dhaka"
                />
              </div>

              <div className="mt-4">
                <label className="block text-xs font-bold text-[var(--color-text)] mb-2 uppercase tracking-wide">Notes (optional)</label>
                <input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="Delivery instructions"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="p-5 md:p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <h2 className="text-lg font-black text-[var(--color-text)] mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">2</span>
                Payment Method
              </h2>

              <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-[var(--color-primary)] bg-[var(--color-primary-light)]">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
                </div>
                <CreditCard size={20} className="text-[var(--color-primary)]" />
                <div className="flex-1">
                  <div className="font-bold text-sm text-[var(--color-text)]">Cash on Delivery</div>
                  <div className="text-xs text-[var(--color-text-muted)]">Pay when you receive the order</div>
                </div>
                <Check size={18} className="text-[var(--color-primary)]" />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 p-5 md:p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <h2 className="text-lg font-black text-[var(--color-text)] mb-5 pb-4 border-b border-[var(--color-border)]">
                Order Summary
              </h2>

              <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm gap-3">
                    <span className="text-[var(--color-text-muted)] truncate">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--color-border)] pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Shipping</span>
                  <span className="font-semibold" style={{ color: shipping === 0 ? 'var(--color-success)' : 'var(--color-text)' }}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <div className="border-t border-[var(--color-border)] pt-4 flex justify-between items-center mb-5">
                <span className="font-bold text-[var(--color-text)]">Total</span>
                <span className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>
                  {formatPrice(grandTotal)}
                </span>
              </div>

              {error && (
                <div className="mb-4 text-sm text-red-500 bg-red-50 p-3 rounded-lg">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-full font-bold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>

              <p className="text-xs text-center text-[var(--color-text-muted)] mt-3">
                By placing order you agree to our terms
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
