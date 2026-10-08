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
  sizes?: string[]
}

export function BuyBox({ product, sizes = [] }: Props) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState(sizes.length > 0 ? sizes[0] : '')
  const [added, setAdded] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  const inStock = product.stock_quantity === undefined || product.stock_quantity > 0
  const lowStock = product.stock_quantity !== undefined && product.stock_quantity > 0 && product.stock_quantity <= 5

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  const handleAdd = () => {
    if (!inStock) return
    const itemName = selectedSize ? `${product.name} (${selectedSize})` : product.name
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: itemName,
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
    const itemName = selectedSize ? `${product.name} (${selectedSize})` : product.name
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: itemName,
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

      {/* Stock status with Live Urgency Progress Bar */}
      <div className="mb-4 pb-3 border-b space-y-2" style={{ borderColor: 'var(--color-border)' }}>
        {inStock ? (
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                <CheckCircle2 size={15} /> স্টকে আছে (In Stock)
              </span>
              <span className="font-semibold text-gray-500">
                {product.stock_quantity ? `${product.stock_quantity}টি অবশিষ্ট` : 'সীমিত স্টক'}
              </span>
            </div>
            {/* Visual Stock Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max(20, Math.min(90, ((product.stock_quantity || 8) / 15) * 100))}%`,
                  background: lowStock ? 'linear-gradient(90deg, #EF4444, #F59E0B)' : 'linear-gradient(90deg, #10B981, #059669)',
                }}
              />
            </div>
            {lowStock ? (
              <span className="text-[11px] font-bold block text-red-600 animate-pulse mt-1">
                🔥 দ্রুত অর্ডার করুন, মাত্র {product.stock_quantity}টি বাকি রয়েছে!
              </span>
            ) : (
              <span className="text-[11px] text-gray-500 block mt-1">
                ⚡ দ্রুত ডেলিভারির জন্য আজই অর্ডার কনফার্ম করুন
              </span>
            )}
          </div>
        ) : (
          <span className="text-sm font-bold" style={{ color: 'var(--color-error)' }}>
            দুঃখিত, স্টক শেষ
          </span>
        )}
      </div>

      {/* Reward Points / Cashback Badge */}
      <div className="mb-4 p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center gap-2.5 text-xs">
        <span className="text-base flex-shrink-0">🪙</span>
        <div>
          <span className="font-bold text-amber-900">MizanMart ক্যাশব্যাক রিওয়ার্ড:</span>
          <span className="text-amber-800 ml-1">
            এই অর্ডারে পাবেন <strong className="font-black text-amber-950">{Math.max(10, Math.round(product.price * 0.02))} পয়েন্ট</strong>
          </span>
        </div>
      </div>

      {/* Quantity & CTA */}
      {inStock && (
        <div className="space-y-3 mb-5">
          {/* Size Selector in BuyBox */}
          {sizes && sizes.length > 0 && (
            <div className="space-y-1.5 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-[var(--color-text)]">
                  সাইজ (Size):
                </label>
                <span className="font-black text-[var(--color-primary)]">
                  {selectedSize}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((s) => {
                  const isSel = selectedSize === s
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className="px-2.5 py-1 rounded-md text-xs font-bold border transition-all active:scale-95"
                      style={{
                        background: isSel ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: isSel ? 'white' : 'var(--color-text)',
                        borderColor: isSel ? 'var(--color-primary)' : 'var(--color-border)',
                      }}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

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
