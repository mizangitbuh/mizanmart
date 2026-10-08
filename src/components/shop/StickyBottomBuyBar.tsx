'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Zap, Check } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'

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

export function StickyBottomBuyBar({ product }: Props) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const [visible, setVisible] = useState(false)
  const [added, setAdded] = useState(false)

  const inStock = product.stock_quantity === undefined || product.stock_quantity > 0

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down 500px
      if (window.scrollY > 450) {
        setVisible(true)
      } else {
        setVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  const handleAdd = () => {
    if (!inStock) return
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    if (!inStock) return
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
    })
    router.push('/checkout')
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom"
      style={{
        background: 'rgba(255, 255, 255, 0.96)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div
        className="mx-auto px-4 py-2.5 flex items-center justify-between gap-3"
        style={{ maxWidth: '1440px' }}
      >
        {/* Product Info (Desktop & Mobile) */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-white">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-[var(--color-text)] truncate max-w-xs sm:max-w-md">
              {product.name}
            </h4>
            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-black" style={{ color: 'var(--color-primary)' }}>
                {formatPrice(product.price)}
              </span>
              {product.compare_price && (
                <span className="text-[11px] line-through text-gray-400">
                  {formatPrice(product.compare_price)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {inStock ? (
            <>
              {/* Add to Cart button */}
              <button
                onClick={handleAdd}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all hover:bg-[var(--color-surface-hover)] border active:scale-95"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                <ShoppingCart size={14} />
                {added ? '✓ যোগ হয়েছে' : 'কার্টে যোগ করুন'}
              </button>

              {/* Direct Buy Now button */}
              <button
                onClick={handleBuyNow}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'var(--color-primary)' }}
              >
                <Zap size={14} />
                <span>সরাসরি অর্ডার (COD)</span>
              </button>
            </>
          ) : (
            <span className="text-xs font-bold text-red-600 px-3 py-1 bg-red-50 rounded-full">
              স্টক শেষ
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
