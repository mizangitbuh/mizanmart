import Link from 'next/link'
import { CheckCircle, Package, Phone, Truck } from 'lucide-react'

interface Props {
  params: Promise<{ orderNumber: string }>
}

export default async function OrderSuccessPage({ params }: Props) {
  const { orderNumber } = await params

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckCircle size={44} className="text-[var(--color-success)]" />
          </div>
          <h1 className="text-3xl font-black text-[var(--color-text)] mb-2">
            Order Confirmed! 🎉
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Thank you for shopping with mizanmart
          </p>
        </div>

        {/* Order Number */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 mb-6">
          <div className="text-center">
            <div className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
              Order Number
            </div>
            <div className="text-2xl font-black font-mono" style={{ color: 'var(--color-primary)' }}>
              {orderNumber}
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 mb-6">
          <h2 className="text-lg font-black text-[var(--color-text)] mb-4">What happens next?</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center flex-shrink-0">
                <Phone size={18} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <div className="font-semibold text-sm text-[var(--color-text)]">Confirmation Call</div>
                <div className="text-xs text-[var(--color-text-muted)]">We'll call you within 24 hours to confirm your order</div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center flex-shrink-0">
                <Package size={18} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <div className="font-semibold text-sm text-[var(--color-text)]">Order Processing</div>
                <div className="text-xs text-[var(--color-text-muted)]">Your items will be packed with care</div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center flex-shrink-0">
                <Truck size={18} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div>
                <div className="font-semibold text-sm text-[var(--color-text)]">Fast Delivery</div>
                <div className="text-xs text-[var(--color-text-muted)]">Delivered within 2-3 business days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Note */}
        <div className="bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 rounded-2xl p-4 mb-6 text-center">
          <div className="text-sm text-[var(--color-text)]">
            💵 <strong>Cash on Delivery</strong> — Pay ৳ when you receive
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/products"
            className="flex-1 text-center px-6 py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-full font-bold text-sm transition"
          >
            Continue Shopping
          </Link>
          <Link
            href="/orders"
            className="flex-1 text-center px-6 py-3.5 border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-full font-bold text-sm hover:bg-[var(--color-primary)] hover:text-white transition"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  )
}
