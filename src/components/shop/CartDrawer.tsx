'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X, ShoppingBag, Trash2, ArrowRight, Truck, CheckCircle2, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'

export function CartDrawer() {
  const router = useRouter()
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity } = useCartStore()

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const freeShippingThreshold = 1000
  const freeShippingReached = subtotal >= freeShippingThreshold
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal)
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen && closeDrawer) {
        closeDrawer()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDrawerOpen, closeDrawer])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isDrawerOpen])

  if (!isDrawerOpen) return null

  const handleCheckout = () => {
    if (closeDrawer) closeDrawer()
    router.push('/checkout')
  }

  const handleViewCart = () => {
    if (closeDrawer) closeDrawer()
    router.push('/cart')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => closeDrawer && closeDrawer()}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
          style={{ background: 'var(--color-surface)' }}
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} style={{ color: 'var(--color-primary)' }} />
              <h2 className="font-black text-base text-[var(--color-text)]">
                আপনার শপিং কার্ট ({totalCount})
              </h2>
            </div>
            <button
              onClick={() => closeDrawer && closeDrawer()}
              className="p-1.5 rounded-full hover:bg-[var(--color-surface-hover)] text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="p-3.5 bg-amber-50/70 border-b border-amber-100">
            <div className="flex items-center gap-2 text-xs mb-1.5">
              <Truck size={15} className="text-amber-700 flex-shrink-0" />
              {freeShippingReached ? (
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 size={13} /> অভিনন্দন! আপনি সম্পূর্ণ ফ্রি ডেলিভারি পাচ্ছেন!
                </span>
              ) : (
                <span className="text-amber-900">
                  আর মাত্র <strong className="font-bold text-amber-950">{formatPrice(remainingForFreeShipping)}</strong> টাকার পণ্য নিলে <strong>ফ্রি ডেলিভারি</strong> পাবেন!
                </span>
              )}
            </div>
            <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                  background: freeShippingReached ? '#10B981' : 'var(--color-primary)',
                }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center text-gray-400">
                  <ShoppingBag size={28} />
                </div>
                <div className="font-bold text-sm text-[var(--color-text)]">কার্ট বর্তমানে খালি</div>
                <p className="text-xs text-[var(--color-text-muted)] max-w-xs mx-auto">
                  আপনার পছন্দের প্রিমিয়াম পণ্যগুলো কার্টে যোগ করতে কেনাকাটা শুরু করুন।
                </p>
                <button
                  onClick={() => {
                    if (closeDrawer) closeDrawer()
                    router.push('/products')
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--color-primary)' }}
                >
                  পণ্য ব্রাউজ করুন
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="pt-3 first:pt-0 flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-white">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => closeDrawer && closeDrawer()}
                      className="text-xs font-bold text-[var(--color-text)] hover:text-[var(--color-primary)] line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <div className="text-xs font-black mt-0.5" style={{ color: 'var(--color-primary)' }}>
                      {formatPrice(item.price)}
                    </div>
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 text-gray-600"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-bold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 text-gray-600"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>মোট সাবটোটাল:</span>
                  <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="font-bold text-emerald-600">
                    {freeShippingReached ? 'ফ্রি' : '৬০ ৳ (ঢাকার ভেতরে)'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 border-t pt-2 mt-2">
                  <span>সর্বমোট:</span>
                  <span style={{ color: 'var(--color-primary)' }}>
                    {formatPrice(freeShippingReached ? subtotal : subtotal + 60)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 rounded-full font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all hover:opacity-95 active:scale-95"
                  style={{ background: 'var(--color-primary)' }}
                >
                  <span>সরাসরি চেকআউট করুন (Cash on Delivery)</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  onClick={handleViewCart}
                  className="w-full py-2.5 rounded-full font-bold text-xs border text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  সম্পূর্ণ কার্ট পেজ দেখুন
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
