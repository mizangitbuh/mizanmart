'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, ArrowRight, Sparkles, Check, ShoppingCart } from 'lucide-react'
import { ProductCard, type ProductCardData } from '@/components/shop/ProductCard'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/stores/cart'
import { useState } from 'react'

interface Props {
  products: ProductCardData[]
}

export function FeaturedSection({ products }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [justAddedId, setJustAddedId] = useState<string | null>(null)

  if (!products || products.length === 0) return null

  // Ensure all products in this section have the featured flag on
  const featuredList = products.map((p) => ({ ...p, featured: true }))

  const handleQuickAdd = (p: ProductCardData, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const img = p.images?.[0] || `https://picsum.photos/seed/${p.slug}/400/400`
    addItem({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      image: img,
    })
    setJustAddedId(p.id)
    setTimeout(() => setJustAddedId(null), 1500)
  }

  // If exactly 1 featured product, show an Amazon-style Spotlight Hero Card
  if (featuredList.length === 1) {
    const p = featuredList[0]
    const img = p.images?.[0] || `https://picsum.photos/seed/${p.slug}/600/600`
    const discount = p.compare_price
      ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100)
      : 0

    return (
      <section
        className="py-6"
        style={{
          background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, var(--color-surface) 100%)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500 text-white shadow-sm flex items-center justify-center">
                <Star size={18} fill="currentColor" />
              </span>
              <div>
                <h2 className="text-xl font-black flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  ফিচার্ড স্পটলাইট (Featured Product)
                </h2>
                <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  হোমপেজে বিশেষভাবে প্রদর্শিত ও নির্বাচিত প্রিমিয়াম পণ্য
                </p>
              </div>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-xs font-bold hover:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              সব পণ্য দেখুন <ArrowRight size={13} />
            </Link>
          </div>

          {/* Spotlight Card */}
          <div
            className="rounded-[var(--radius-xl)] border p-5 md:p-6 transition-all hover:shadow-xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'rgba(245, 158, 11, 0.3)',
            }}
          >
            {/* Image col */}
            <div className="md:col-span-5 relative aspect-square max-h-[380px] rounded-[var(--radius-lg)] overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
              <Link href={`/product/${p.slug}`} className="block w-full h-full relative">
                <Image
                  src={img}
                  alt={p.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </Link>
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span className="text-[11px] font-black px-2.5 py-1 rounded-full shadow-md bg-amber-500 text-white flex items-center gap-1">
                  <Star size={12} fill="currentColor" /> FEATURED CHOICE
                </span>
                {discount > 0 && (
                  <span className="text-xs font-black px-2 py-0.5 rounded shadow-sm text-white" style={{ background: 'var(--color-primary)' }}>
                    -{discount}% ছাড়
                  </span>
                )}
              </div>
            </div>

            {/* Details col */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-primary)' }}>
                  <Sparkles size={14} /> বিশেষ প্রদর্শন (Featured on Homepage)
                </div>
                <Link href={`/product/${p.slug}`}>
                  <h3 className="text-xl md:text-2xl font-black hover:text-[var(--color-primary)] transition-colors leading-snug" style={{ color: 'var(--color-text)' }}>
                    {p.name}
                  </h3>
                </Link>

                {/* Ratings */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-amber-400 text-sm">★★★★★</div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                    (৫.০ রেটিং • টপ কোয়ালিটি)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-2xl md:text-3xl font-black" style={{ color: 'var(--color-primary)' }}>
                    {formatPrice(p.price)}
                  </span>
                  {p.compare_price && (
                    <span className="text-base line-through" style={{ color: 'var(--color-text-muted)' }}>
                      {formatPrice(p.compare_price)}
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                      আপনি সাশ্রয় করছেন {formatPrice(p.compare_price! - p.price)}
                    </span>
                  )}
                </div>

                {/* Bullets */}
                <ul className="mt-4 space-y-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500 flex-shrink-0" />
                    <span>১০০% আসল ও অরিজিনাল কোয়ালিটি নিশ্চিত</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500 flex-shrink-0" />
                    <span>ক্যাশ অন ডেলিভারিতে সারাদেশে দ্রুততম ডেলিভারি</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-500 flex-shrink-0" />
                    <span>৭ দিনের সহজ রিটার্ন ও রিপ্লেসমেন্ট গ্যারান্টি</span>
                  </li>
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={(e) => handleQuickAdd(p, e)}
                  className="flex-1 md:flex-initial px-6 py-3 rounded-[var(--radius-md)] text-sm font-bold text-white flex items-center justify-center gap-2 transition hover:opacity-90 shadow-md"
                  style={{ background: justAddedId === p.id ? 'var(--color-success)' : 'var(--color-primary)' }}
                >
                  <ShoppingCart size={16} />
                  {justAddedId === p.id ? 'কার্টে যুক্ত হয়েছে!' : 'কার্টে যোগ করুন'}
                </button>
                <Link
                  href={`/product/${p.slug}`}
                  className="px-6 py-3 rounded-[var(--radius-md)] text-sm font-bold border transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  বিস্তারিত দেখুন
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Multiple featured products: Grid Showcase
  return (
    <section
      className="py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.06) 0%, var(--color-surface) 100%)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-500 text-white shadow-sm flex items-center justify-center">
              <Star size={18} fill="currentColor" />
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-black flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                ফিচার্ড কালেকশন (Featured Products)
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#B45309' }}>
                ⭐ আমাদের বিশেষ চয়েস • হোমপেজে বিশেষ প্রদর্শন
              </span>
            </div>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-xs font-bold hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            সব দেখুন <ArrowRight size={13} />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {featuredList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
