import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { AddToCartButton } from '@/components/shop/AddToCartButton'
import { Star, Truck, Shield, RotateCcw, Heart } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(name, slug)')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!product) notFound()

  const image = product.images?.[0] || 'https://picsum.photos/seed/' + product.slug + '/800/800'
  const inStock = product.stock_quantity > 0
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  const rating = 4.5
  const reviewCount = 128

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Breadcrumb */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="container-main py-3 text-sm text-[var(--color-text-muted)]">
          <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/products?category=${product.category?.slug}`} className="hover:text-[var(--color-primary)]">
            {product.category?.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--color-text)] font-medium">{product.name}</span>
        </div>
      </div>

      <div className="container-main py-6 md:py-8">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 bg-[var(--color-surface)] rounded-xl p-4 md:p-8 border border-[var(--color-border)]">
          {/* Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-[var(--color-background)]">
            <Image src={image} alt={product.name} fill className="object-cover" sizes="50vw" priority />
            {discount > 0 && (
              <span className="badge-sale absolute top-4 left-4 rounded">
                -{discount}% OFF
              </span>
            )}
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
              <Heart size={18} className="text-gray-600" />
            </button>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text)] mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} className={s <= Math.round(rating) ? 'star-filled fill-current' : 'star-empty'} />
                ))}
              </div>
              <span className="text-sm text-[var(--color-text-muted)]">
                {rating} ({reviewCount} reviews)
              </span>
              <span className="text-sm text-[var(--color-success)] font-medium">
                ✓ In Stock
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-[var(--color-border)]">
              <span className="text-3xl md:text-4xl font-black" style={{ color: 'var(--color-primary)' }}>
                {formatPrice(product.price)}
              </span>
              {product.compare_price && (
                <>
                  <span className="text-lg text-[var(--color-text-light)] line-through">
                    {formatPrice(product.compare_price)}
                  </span>
                  <span className="text-sm font-bold text-[var(--color-success)] bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                    Save {formatPrice(product.compare_price - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 uppercase tracking-wide">
                  Description
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* SKU */}
            {product.sku && (
              <div className="text-xs text-[var(--color-text-muted)] mb-6">
                SKU: <span className="font-mono">{product.sku}</span>
              </div>
            )}

            {/* Add to Cart */}
            <div className="mb-6">
              <AddToCartButton
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  image,
                }}
                disabled={!inStock}
              />
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[var(--color-border)]">
              <div className="text-center">
                <Truck size={20} className="mx-auto mb-1 text-[var(--color-primary)]" />
                <div className="text-xs font-semibold text-[var(--color-text)]">Free Delivery</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">Over ৳1000</div>
              </div>
              <div className="text-center">
                <RotateCcw size={20} className="mx-auto mb-1 text-[var(--color-primary)]" />
                <div className="text-xs font-semibold text-[var(--color-text)]">Easy Return</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">7 days</div>
              </div>
              <div className="text-center">
                <Shield size={20} className="mx-auto mb-1 text-[var(--color-primary)]" />
                <div className="text-xs font-semibold text-[var(--color-text)]">Warranty</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">100% Genuine</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
