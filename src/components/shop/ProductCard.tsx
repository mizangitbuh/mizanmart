'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Star } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { WishlistButton } from '@/components/shop/WishlistButton'

export interface ProductCardData {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  images: string[]
  stock_quantity?: number
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

export function ProductCard({ product }: { product: ProductCardData }) {
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

  // ⭐ Deterministic rating — same product always same value
  const hash = hashString(product.id)
  const rating = 4 + (hash % 10) / 10 // 4.0 - 4.9
  const reviewCount = 20 + (hash % 480) // 20 - 499

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

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div
        className="product-card rounded-[var(--radius-lg)] overflow-hidden h-full flex flex-col"
        style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
      >
        <div className="relative aspect-square overflow-hidden" style={{ background: 'var(--color-background)' }}>
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && <Badge variant="sale" size="sm">-{discount}%</Badge>}
            {discount === 0 && <Badge variant="new" size="sm">NEW</Badge>}
          </div>

          {outOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-bold px-3 py-1.5 rounded" style={{ background: 'var(--color-error)' }}>
                OUT OF STOCK
              </span>
            </div>
          )}

          {lowStock && !outOfStock && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="warning" size="sm">Only {product.stock_quantity} left</Badge>
            </div>
          )}

          <div className="absolute top-2 right-2">
            <WishlistButton
              productId={product.id}
              initialWishlisted={product.initialWishlisted || false}
            />
          </div>

          {!outOfStock && (
            <button
              onClick={handleAdd}
              className="absolute bottom-2 left-2 right-2 py-2 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all flex items-center justify-center gap-1"
              style={{ background: justAdded ? 'var(--color-success)' : 'var(--color-primary)' }}
            >
              <ShoppingCart size={14} />
              {justAdded ? 'Added!' : 'Add to Cart'}
            </button>
          )}
        </div>

        <div className="p-3 flex flex-col flex-1">
          <h3
            className="text-sm font-medium line-clamp-2 mb-2 min-h-[40px] group-hover:text-[var(--color-primary)] transition-colors"
            style={{ color: 'var(--color-text)' }}
          >
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={11}
                  className={star <= Math.round(rating) ? 'star-filled fill-current' : 'star-empty'}
                />
              ))}
            </div>
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              ({reviewCount})
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-base font-black" style={{ color: 'var(--color-primary)' }}>
              {formatPrice(product.price)}
            </span>
            {product.compare_price && (
              <span className="text-xs line-through" style={{ color: 'var(--color-text-muted)' }}>
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          <div className="text-[10px] font-semibold mt-auto" style={{ color: 'var(--color-success)' }}>
            🚚 Free Delivery
          </div>
        </div>
      </div>
    </Link>
  )
}
