'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore()
  const subtotal = total()
  const shipping = subtotal > 1000 ? 0 : 60
  const grandTotal = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="container-main py-20 text-center">
          <div className="w-24 h-24 rounded-full bg-[var(--color-primary-light)] mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag size={48} style={{ color: 'var(--color-primary)' }} />
          </div>
          <h1 className="text-2xl font-black text-[var(--color-text)] mb-2">Your Cart is Empty</h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">Add products to continue shopping</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-full font-bold text-sm transition">
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="container-main py-6">
        <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text)] mb-6">
          Shopping Cart <span className="text-[var(--color-text-muted)] font-medium">({items.length} items)</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                <Link href={`/product/${item.slug}`} className="relative w-20 h-20 rounded-lg overflow-hidden bg-[var(--color-background)] flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.slug}`} className="font-semibold text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] line-clamp-2">
                    {item.name}
                  </Link>
                  <div className="text-base font-bold mt-1" style={{ color: 'var(--color-primary)' }}>
                    {formatPrice(item.price)}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-[var(--color-border)] rounded-md">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-surface-hover)]"
                        aria-label="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-surface-hover)]"
                        aria-label="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-red-500 hover:text-red-700 p-1 ml-auto"
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-right font-black text-base hidden md:block" style={{ color: 'var(--color-primary)' }}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}

            <button onClick={clearCart} className="text-xs text-red-500 hover:underline font-medium">
              Clear entire cart
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
              <h2 className="text-lg font-black text-[var(--color-text)] mb-5 pb-4 border-b border-[var(--color-border)]">
                Order Summary
              </h2>
              <div className="space-y-3 text-sm mb-5">
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
                {shipping > 0 && (
                  <div className="text-xs bg-[var(--color-primary-light)] text-[var(--color-primary)] p-2 rounded">
                    Add {formatPrice(1000 - subtotal)} more for FREE delivery
                  </div>
                )}
              </div>
              <div className="border-t border-[var(--color-border)] pt-4 flex justify-between items-center mb-6">
                <span className="font-bold text-[var(--color-text)]">Total</span>
                <span className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>
                  {formatPrice(grandTotal)}
                </span>
              </div>

              <Link href="/checkout" className="flex items-center justify-center gap-2 w-full py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-full font-bold text-sm transition">
                Proceed to Checkout <ArrowRight size={16} />
              </Link>

              <Link href="/products" className="block text-center text-xs text-[var(--color-primary)] hover:underline mt-4 font-medium">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
