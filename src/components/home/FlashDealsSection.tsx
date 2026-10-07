'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'
import { ProductCard, type ProductCardData } from '@/components/shop/ProductCard'

interface Props {
  products: ProductCardData[]
}

function useCountdown(targetHours = 24) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 })

  useEffect(() => {
    // 24-hour reset: countdown from current time to midnight
    const calcTime = () => {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const diff = Math.floor((midnight.getTime() - now.getTime()) / 1000)
      return {
        h: Math.floor(diff / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
      }
    }

    setTimeLeft(calcTime())
    const interval = setInterval(() => setTimeLeft(calcTime()), 1000)
    return () => clearInterval(interval)
  }, [])

  return timeLeft
}

export function FlashDealsSection({ products }: Props) {
  const { h, m, s } = useCountdown()

  if (!products || products.length === 0) return null

  return (
    <section
      className="py-5"
      style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Zap size={20} fill="currentColor" style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-xl font-black" style={{ color: 'var(--color-text)' }}>
                ⚡ Flash Deals
              </h2>
            </div>
            {/* Countdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                শেষ হবে:
              </span>
              {[
                { val: String(h).padStart(2, '0'), label: 'ঘণ্টা' },
                { val: String(m).padStart(2, '0'), label: 'মিনিট' },
                { val: String(s).padStart(2, '0'), label: 'সেকেন্ড' },
              ].map((item, i) => (
                <span key={item.label} className="flex items-center gap-1">
                  <span
                    className="inline-flex flex-col items-center justify-center w-9 h-9 rounded font-black text-sm text-white"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    {item.val}
                    <span className="text-[7px] font-medium opacity-80 leading-none">{item.label}</span>
                  </span>
                  {i < 2 && <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>:</span>}
                </span>
              ))}
            </div>
          </div>
          <Link
            href="/products?discount=yes"
            className="flex items-center gap-1 text-xs font-bold hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            সব ডিল দেখুন <ArrowRight size={14} />
          </Link>
        </div>

        {/* Horizontal scroll of product cards */}
        <div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0"
              style={{ width: '180px', scrollSnapAlign: 'start' }}
            >
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
