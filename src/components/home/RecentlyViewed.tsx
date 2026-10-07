'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const VIEWED_KEY = 'mizanmart_recently_viewed'
const MAX_VIEWED = 10

interface ViewedProduct {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  image: string
  viewedAt: number
}

export function RecentlyViewed() {
  const [items, setItems] = useState<ViewedProduct[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(VIEWED_KEY)
      if (saved) {
        const parsed: ViewedProduct[] = JSON.parse(saved)
        setItems(parsed.slice(0, MAX_VIEWED))
      }
    } catch {}
  }, [])

  if (!mounted || items.length === 0) return null

  return (
    <section className="py-5 border-t" style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-base font-black" style={{ color: 'var(--color-text)' }}>
              সম্প্রতি দেখা পণ্য
            </h2>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem(VIEWED_KEY)
              setItems([])
            }}
            className="text-xs hover:underline"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ক্লিয়ার করুন
          </button>
        </div>

        <div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
        >
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.slug}`}
              className="group flex-shrink-0"
              style={{ width: '140px', scrollSnapAlign: 'start' }}
            >
              <div
                className="rounded-[var(--radius-md)] border overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
              >
                <div className="relative aspect-square overflow-hidden" style={{ background: 'var(--color-background)' }}>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="140px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-2">
                  <p className="text-[11px] font-medium line-clamp-2 mb-1 group-hover:text-[var(--color-primary)] transition-colors"
                    style={{ color: 'var(--color-text)' }}>
                    {item.name}
                  </p>
                  <span className="text-xs font-black" style={{ color: 'var(--color-primary)' }}>
                    {formatPrice(item.price)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// Product page-এ call করতে হবে — product দেখলে localStorage-এ save করে
export function trackProductView(product: {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  images: string[]
}) {
  try {
    const image = product.images?.[0] || `https://picsum.photos/seed/${product.slug}/300/300`
    const saved = localStorage.getItem(VIEWED_KEY)
    const existing: ViewedProduct[] = saved ? JSON.parse(saved) : []
    const filtered = existing.filter((p) => p.id !== product.id)
    const newItem: ViewedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      compare_price: product.compare_price,
      image,
      viewedAt: Date.now(),
    }
    const updated = [newItem, ...filtered].slice(0, MAX_VIEWED)
    localStorage.setItem(VIEWED_KEY, JSON.stringify(updated))
  } catch {}
}
