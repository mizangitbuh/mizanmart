'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Zap, Truck, ShieldCheck, RotateCcw, Heart, CheckCircle2 } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import { QuantitySelector } from '@/components/shop/QuantitySelector'

interface Props {
  product: {
    id: string
    name: string
    slug: string
    price: number
    compare_price: number | null
    image: string
    stock_quantity?: number
  }
}

export function BuyBox({ product }: Props) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  const inStock = product.stock_quantity === undefined || product.stock_quantity > 0
  const lowStock = product.stock_quantity !== undefined && product.stock_quantity > 0 && product.stock_quantity <= 5

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  const handleAdd = () => {
    if (!inStock) return
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    if (!inStock) return
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
      })
    }
    router.push('/checkout')
  }

  // Delivery date estimate (3 days from now)
  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + 3)
  const dateFormatted = deliveryDate.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  })

  return (
    <div
      className="rounded-[var(--radius-lg)] border p-5 shadow-sm sticky top-24"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black" style={{ color: 'var(--color-primary)' }}>
            {formatPrice(product.price)}
          </span>
          {product.compare_price && (
            <span className="text-sm line-through" style={{ color: 'var(--color-text-muted)' }}>
              {formatPrice(product.compare_price)}
            </span>
          )}
        </div>
        {product.compare_price && (
          <div className="mt-1">
            <span
              className="inline-block text-xs font-bold px-2 py-0.5 rounded"
              style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}
            >
              সাশ্রয় {formatPrice(product.compare_price - product.price)} ({discount}% ছাড়)
            </span>
          </div>
        )}
      </div>

      {/* Stock status */}
      <div className="mb-4 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {inStock ? (
          <div>
            <span className="text-sm font-bold flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
              <CheckCircle2 size={16} /> স্টকে আছে
            </span>
            {lowStock && (
              <span className="text-xs font-semibold block mt-0.5" style={{ color: 'var(--color-warning)' }}>
                দ্রুত অর্ডার করুন, মাত্র {product.stock_quantity}টি বাকি!
              </span>
            )}
          </div>
        ) : (
          <span className="text-sm font-bold" style={{ color: 'var(--color-error)' }}>
            দুঃখিত, স্টক শেষ
          </span>
        )}
      </div>

      {/* Quantity & CTA */}
      {inStock && (
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>
              পরিমাণ (Quantity):
            </label>
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={Math.min(product.stock_quantity || 99, 99)}
            />
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAdd}
            className="w-full py-3 rounded-full font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-95 hover:shadow-md active:scale-95"
            style={{
              background: added ? 'var(--color-success)' : 'var(--color-primary)',
            }}
          >
            <ShoppingCart size={16} />
            {added ? '✓ কার্টে যোগ করা হয়েছে!' : 'কার্টে যোগ করুন (Add to Cart)'}
          </button>

          {/* Buy Now button */}
          <button
            onClick={handleBuyNow}
            className="w-full py-3 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-[var(--color-surface-hover)] border-2 active:scale-95"
            style={{
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)',
              background: 'var(--color-surface)',
            }}
          >
            <Zap size={16} />
            সরাসরি অর্ডার করুন (Buy Now)
          </button>
        </div>
      )}

      {/* Delivery information */}
      <div className="space-y-3 pt-3 border-t text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
        <div className="flex items-start gap-2.5">
          <Truck size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="font-bold text-[var(--color-text)]">ডেলিভারি আনুমানিক সময়:</div>
            <div>{dateFormatted} এর মধ্যে পাবেন</div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--color-success)' }}>
              {product.price >= 1000 ? '✓ ফ্রি ডেলিভারি প্রযোজ্য' : '🚚 মাত্র ৬০ টাকা ডেলিভারি চার্জ'}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <RotateCcw size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="font-bold text-[var(--color-text)]">৭ দিন সহজ রিটার্ন:</div>
            <div>পণ্য পছন্দ না হলে ফেরতযোগ্য</div>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <ShieldCheck size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
          <div>
            <div className="font-bold text-[var(--color-text)]">১০০% আসল পণ্যের গ্যারান্টি:</div>
            <div>MizanMart ভেরিফাইড কোয়ালিটি</div>
          </div>
        </div>
      </div>
    </div>
  )
}
