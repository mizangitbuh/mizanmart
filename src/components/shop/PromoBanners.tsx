'use client'

import Link from 'next/link'
import { ArrowRight, Zap, Sparkles, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Banner {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  image_url: string | null
  media_url: string | null
  media_type: string | null
  cta_text: string | null
  cta_url: string | null
  background_color: string
  text_color: string
}

interface Props {
  banners: Banner[]
}

function useCountdownMini() {
  const [s, setS] = useState(0)
  useEffect(() => {
    const calc = () => {
      const now = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      setS(Math.floor((midnight.getTime() - now.getTime()) / 1000))
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [])
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const DEFAULT_PROMO_TILES = [
  {
    id: 'promo-1',
    title: '⚡ Flash Sale',
    subtitle: 'আজকের বিশেষ অফার',
    description: 'সীমিত সময়ের ডিসকাউন্ট!',
    cta_text: 'দেখুন',
    cta_url: '/products?discount=yes',
    bg: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
    type: 'flash',
  },
  {
    id: 'promo-2',
    title: '🆕 নতুন পণ্য',
    subtitle: 'Fresh Arrivals',
    description: 'সদ্য যোগ হওয়া পণ্য দেখুন',
    cta_text: 'দেখুন',
    cta_url: '/products?sort=newest',
    bg: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
    type: 'new',
  },
  {
    id: 'promo-3',
    title: '🚚 ফ্রি ডেলিভারি',
    subtitle: '৳১০০০+ অর্ডারে',
    description: 'সারাদেশে দ্রুত ডেলিভারি',
    cta_text: 'শপিং করুন',
    cta_url: '/products',
    bg: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)',
    type: 'delivery',
  },
]

export function PromoBanners({ banners }: Props) {
  const countdown = useCountdownMini()

  // DB banners আছে কিনা, না থাকলে default tiles দেখাই
  const tiles = banners && banners.length > 0
    ? banners.slice(0, 3).map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle || '',
        description: b.description || '',
        cta_text: b.cta_text || 'দেখুন',
        cta_url: b.cta_url || '/products',
        bg: `linear-gradient(135deg, ${b.background_color} 0%, ${b.background_color}cc 100%)`,
        type: 'custom',
      }))
    : DEFAULT_PROMO_TILES

  return (
    <section className="py-4" style={{ background: 'var(--color-background)' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {tiles.map((tile, i) => (
            <Link
              key={tile.id}
              href={tile.cta_url}
              className="group relative overflow-hidden rounded-[var(--radius-lg)] p-5 flex flex-col justify-between min-h-[120px] transition-all hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: tile.bg }}
            >
              {/* Flash sale countdown */}
              {tile.type === 'flash' && (
                <div
                  className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  ⏱ {countdown}
                </div>
              )}

              <div>
                <div className="text-lg font-black text-white mb-0.5">{tile.title}</div>
                <div className="text-[11px] font-bold text-white/70">{tile.subtitle}</div>
                <div className="text-xs text-white/80 mt-1">{tile.description}</div>
              </div>

              <div className="mt-3">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 group-hover:bg-white group-hover:text-black transition-colors">
                  {tile.cta_text} <ArrowRight size={11} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
