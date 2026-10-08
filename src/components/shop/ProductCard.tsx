'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Star, Heart } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import { useState } from 'react'
import { WishlistButton } from '@/components/shop/WishlistButton'

export interface ProductCardData {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  images: string[]
  stock_quantity?: number
  featured?: boolean
  initialWishlisted?: boolean
}

// Deterministic hash — same product always same rating
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

interface Props {
  product: ProductCardData
  compact?: boolean  // Flash Deals carousel-এ ছোট সাইজের জন্য
}

export function ProductCard({ product, compact = false }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [justAdded, setJustAdded] = useState(false)

  let image = 'https://picsum.photos/seed/' + product.slug + '/600/600'
  if (product.images && Array.isArray(product.images) && product.images[0]?.trim()) {
    image = product.images[0]
  }

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  const outOfStock = product.stock_quantity !== undefined && product.stock_quantity <= 0
  const lowStock = product.stock_quantity !== undefined && product.stock_quantity > 0 && product.stock_quantity <= 5

  // ⭐ Deterministic rating
  const hash = hashString(product.id)
  const rating = 4 + (hash % 10) / 10   // 4.0 - 4.9
  const reviewCount = 20 + (hash % 480)  // 20 - 499
  const soldCount = 50 + (hash % 950)    // 50 - 999

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock) return
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image,
    })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  const stars = Array.from({ length: 5 }, (_, i) => i + 1)

  if (compact) {
    // Flash Deals compact card
    return (
      <Link href={`/product/${product.slug}`} className="group block h-full">
        <div
          className="product-card rounded-[var(--radius-md)] overflow-hidden h-full flex flex-col border"
          style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)' }}
        >
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="180px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {discount > 0 && (
              <div
                className="absolute top-1.5 left-1.5 text-[10px] font-black text-white px-1.5 py-0.5 rounded"
                style={{ background: 'var(--color-primary)' }}
              >
                -{discount}%
              </div>
            )}
            {outOfStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold px-2 py-1 rounded" style={{ background: 'var(--color-error)' }}>
                  Stock নেই
                </span>
              </div>
            )}
          </div>
          <div className="p-2 flex flex-col flex-1">
            <p className="text-xs font-medium line-clamp-2 mb-1" style={{ color: 'var(--color-text)', minHeight: '32px' }}>
              {product.name}
            </p>
            <div className="flex items-center gap-1 mb-1">
              <div className="flex">
                {stars.map((star) => (
                  <Star
                    key={star}
                    size={9}
                    style={{ color: star <= Math.round(rating) ? '#F59E0B' : 'var(--color-border)' }}
                    fill={star <= Math.round(rating) ? '#F59E0B' : 'none'}
                  />
                ))}
              </div>
              <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>({reviewCount})</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black" style={{ color: 'var(--color-primary)' }}>
                {formatPrice(product.price)}
              </span>
              {product.compare_price && (
                <span className="text-[9px] line-through" style={{ color: 'var(--color-text-muted)' }}>
                  {formatPrice(product.compare_price)}
                </span>
              )}
            </div>
            {!outOfStock && (
              <button
                onClick={handleAdd}
                className="mt-2 w-full py-1.5 text-[10px] font-bold text-white rounded transition-colors"
                style={{ background: justAdded ? 'var(--color-success)' : 'var(--color-primary)' }}
              >
                {justAdded ? '✓ Added!' : '+ Cart'}
              </button>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // Full card — dense Amazon-style
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div
        className="product-card rounded-[var(--radius-md)] overflow-hidden h-full flex flex-col border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden" style={{ background: 'var(--color-background)' }}>
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Discount & Featured badge */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.featured && (
              <span
                className="text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm text-black flex items-center gap-0.5 tracking-wider uppercase"
                style={{ background: '#F59E0B' }}
              >
                ⭐ FEATURED
              </span>
            )}
            {discount > 0 && (
              <span
                className="text-[11px] font-black text-white px-2 py-0.5 rounded"
                style={{ background: 'var(--color-primary)' }}
              >
                -{discount}%
              </span>
            )}
            {discount === 0 && !product.featured && (
              <span
                className="text-[10px] font-black text-white px-2 py-0.5 rounded"
                style={{ background: 'var(--color-success)' }}
              >
                NEW
              </span>
            )}
          </div>

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-bold px-3 py-1.5 rounded" style={{ background: 'var(--color-error)' }}>
                STOCK নেই
              </span>
            </div>
          )}

          {/* Low stock */}
          {lowStock && !outOfStock && (
            <div className="absolute bottom-2 left-2">
              <span
                className="text-[10px] font-bold text-white px-2 py-0.5 rounded"
                style={{ background: 'var(--color-warning)' }}
              >
                মাত্র {product.stock_quantity}টি বাকি!
              </span>
            </div>
          )}

          {/* Wishlist */}
          <div className="absolute top-2 right-2">
            <WishlistButton productId={product.id} initialWishlisted={product.initialWishlisted || false} />
          </div>

          {/* Quick Add to Cart — hover reveal */}
          {!outOfStock && (
            <button
              onClick={handleAdd}
              className="absolute bottom-2 left-2 right-2 py-2 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all flex items-center justify-center gap-1.5"
              style={{ background: justAdded ? 'var(--color-success)' : 'var(--color-primary)' }}
            >
              <ShoppingCart size={13} />
              {justAdded ? '✓ কার্টে যোগ হয়েছে!' : 'কার্টে যোগ করুন'}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-2.5 flex flex-col flex-1">
          {/* Title */}
          <h3
            className="text-xs font-semibold line-clamp-2 mb-1.5 group-hover:text-[var(--color-primary)] transition-colors leading-snug"
            style={{ color: 'var(--color-text)', minHeight: '32px' }}
          >
            {product.name}
          </h3>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex">
              {stars.map((star) => (
                <Star
                  key={star}
                  size={11}
                  style={{ color: star <= Math.round(rating) ? '#F59E0B' : 'var(--color-border)' }}
                  fill={star <= Math.round(rating) ? '#F59E0B' : 'none'}
                />
              ))}
            </div>
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {rating.toFixed(1)}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              ({reviewCount})
            </span>
          </div>

          {/* Price row */}
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-sm font-black" style={{ color: 'var(--color-primary)' }}>
              {formatPrice(product.price)}
            </span>
            {product.compare_price && (
              <span className="text-[10px] line-through" style={{ color: 'var(--color-text-muted)' }}>
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          {/* Tags row */}
          <div className="flex items-center gap-1.5 mt-auto">
            <span className="text-[10px] font-semibold" style={{ color: 'var(--color-success)' }}>
              🚚 ফ্রি ডেলিভারি
            </span>
            {discount > 0 && (
              <span className="text-[10px] font-semibold ml-auto" style={{ color: 'var(--color-text-muted)' }}>
                {soldCount}+ বিক্রি
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
