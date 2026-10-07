'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck, Truck, RotateCcw, Heart, Tag } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import { CouponInput } from '@/components/shop/CouponInput'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore()
  const [savedForLater, setSavedForLater] = useState<string[]>([])
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const couponDiscount = appliedCoupon?.discount || 0

  const subtotal = total()
  const freeThreshold = 1000
  const isFreeDelivery = subtotal >= freeThreshold
  const amountNeeded = Math.max(0, freeThreshold - subtotal)
  const shipping = isFreeDelivery || subtotal === 0 ? 0 : 60
  const grandTotal = Math.max(0, subtotal + shipping - couponDiscount)
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100))

  const handleSaveForLater = (productId: string) => {
    setSavedForLater((prev) => [...prev, productId])
    removeItem(productId)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '60px 16px' }} className="text-center">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center shadow-inner"
            style={{ background: 'var(--color-primary-light)' }}
          >
            <ShoppingBag size={40} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--color-text)' }}>
            আপনার শপিং কার্ট খালি
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
            পছন্দের পণ্য খুঁজে নিন এবং কার্টে যোগ করে কেনাকাটা চালিয়ে যান।
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white transition-all hover:scale-105"
            style={{ background: 'var(--color-primary)' }}
          >
            শপিং শুরু করুন <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-6" style={{ background: 'var(--color-background)' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Breadcrumb / Title */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h1 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--color-text)' }}>
            শপিং কার্ট <span className="text-base font-normal" style={{ color: 'var(--color-text-muted)' }}>({items.length}টি পণ্য)</span>
          </h1>
          <button
            onClick={clearCart}
            className="text-xs text-red-500 hover:underline font-semibold"
          >
            সব আইটেম মুছুন
          </button>
        </div>

        {/* 2-Column Amazon Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Items List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Free Shipping Progress Meter */}
            <div
              className="p-4 rounded-[var(--radius-lg)] border"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="flex items-center gap-1.5" style={{ color: isFreeDelivery ? 'var(--color-success)' : 'var(--color-text)' }}>
                  <Truck size={16} style={{ color: isFreeDelivery ? 'var(--color-success)' : 'var(--color-primary)' }} />
                  {isFreeDelivery
                    ? '🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন!'
                    : `আরও ${formatPrice(amountNeeded)} শপিং করলে ফ্রি ডেলিভারি পাবেন`}
                </span>
                <span style={{ color: 'var(--color-text-muted)' }}>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden bg-gray-200">
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${progressPercent}%`,
                    background: isFreeDelivery ? 'var(--color-success)' : 'var(--color-primary)',
                  }}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div
              className="rounded-[var(--radius-lg)] border divide-y divide-gray-200"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              {items.map((item) => (
                <div key={item.productId} className="p-4 sm:p-5 flex gap-4 items-start">
                  {/* Product Image */}
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[var(--radius-md)] overflow-hidden border flex-shrink-0"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
                  >
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="112px" />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          className="font-bold text-sm sm:text-base line-clamp-2 hover:text-[var(--color-primary)] transition-colors"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {item.name}
                        </Link>
                        <div className="text-right font-black text-base sm:text-lg flex-shrink-0" style={{ color: 'var(--color-primary)' }}>
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        একক মূল্য: {formatPrice(item.price)}
                      </div>
                    </div>

                    {/* Quantity + Actions row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="flex items-center border rounded-[var(--radius-sm)]" style={{ borderColor: 'var(--color-border)' }}>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          aria-label="Decrease"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center font-bold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
                          aria-label="Increase"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <button
                          onClick={() => handleSaveForLater(item.productId)}
                          className="flex items-center gap-1 hover:text-[var(--color-primary)] transition-colors"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          <Heart size={14} /> পরে কেনার জন্য রাখুন
                        </button>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={14} /> মুছে ফেলুন
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping Link */}
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                ← আরও কেনাকাটা চালিয়ে যান (Continue Shopping)
              </Link>
            </div>
          </div>

          {/* RIGHT: Order Summary (4 cols, sticky) */}
          <div className="lg:col-span-4">
            <div
              className="rounded-[var(--radius-lg)] border p-5 sm:p-6 sticky top-24 shadow-sm"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-base font-black pb-3 border-b mb-4" style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}>
                অর্ডার সারাংশ (Order Summary)
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-3 text-xs mb-4">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>পণ্যের মোট মূল্য (Subtotal):</span>
                  <span className="font-bold" style={{ color: 'var(--color-text)' }}>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--color-text-secondary)' }}>ডেলিভারি চার্জ (Delivery):</span>
                  <span className="font-bold" style={{ color: shipping === 0 ? 'var(--color-success)' : 'var(--color-text)' }}>
                    {shipping === 0 ? 'বিনামূল্যে (FREE)' : formatPrice(shipping)}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between" style={{ color: 'var(--color-success)' }}>
                    <span>কুপন ডিসকাউন্ট:</span>
                    <span className="font-bold">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
              </div>

              {/* Inline Coupon Input */}
              <div className="mb-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <CouponInput
                  orderAmount={subtotal}
                  appliedCoupon={appliedCoupon}
                  onApply={(coupon) => setAppliedCoupon(coupon)}
                />
              </div>

              {/* Total Row */}
              <div className="pt-3 border-t flex justify-between items-baseline mb-5" style={{ borderColor: 'var(--color-border)' }}>
                <span className="font-black text-sm" style={{ color: 'var(--color-text)' }}>সর্বমোট (Total):</span>
                <span className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>
                  {formatPrice(grandTotal)}
                </span>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full py-3.5 rounded-full font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-95 shadow-md active:scale-95"
                style={{ background: 'var(--color-primary)' }}
              >
                চেকআউট করুন <ArrowRight size={16} />
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-5 border-t space-y-2.5 text-[11px]" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} style={{ color: 'var(--color-success)' }} />
                  <span>১০০% নিরাপদ ও সুরক্ষিত পেমেন্ট</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={16} style={{ color: 'var(--color-primary)' }} />
                  <span>দ্রুততম হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} style={{ color: '#7C3AED' }} />
                  <span>৭ দিনের মধ্যে সহজ রিটার্ন সুবিধা</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
