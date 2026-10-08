'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
  banner: Banner | null
}

// Default slides যখন DB-তে কোনো banner নেই
const DEFAULT_SLIDES = [
  {
    id: 'default-1',
    title: '💄 সৌন্দর্যের নতুন সংজ্ঞা',
    subtitle: 'Cosmetics Collection 2026',
    description: 'সেরা ব্র্যান্ডের প্রসাধনী — একটু ছাড়ে, একটু বেশি সুন্দর',
    cta_text: 'এখনই শপিং করুন',
    cta_url: '/products?category=cosmetics',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    accent: '#e94560',
    emoji: '💄',
  },
  {
    id: 'default-2',
    title: '⚡ Flash Sale — সীমিত সময়!',
    subtitle: 'Up to 50% Off',
    description: 'হাজারো পণ্যে অবিশ্বাস্য ছাড় — এখনই না কিনলে পস্তাবেন!',
    cta_text: 'ডিল দেখুন',
    cta_url: '/products?discount=yes',
    bg: 'linear-gradient(135deg, #991B1B 0%, #D92D3F 50%, #B91C2C 100%)',
    accent: '#FFD700',
    emoji: '⚡',
  },
  {
    id: 'default-3',
    title: '👕 ফ্যাশনের নতুন দিগন্ত',
    subtitle: 'New Arrivals — Clothing',
    description: 'ট্রেন্ডি পোশাক, সাশ্রয়ী দামে — আজই অর্ডার করুন',
    cta_text: 'পোশাক দেখুন',
    cta_url: '/products?category=clothing',
    bg: 'linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #115e59 100%)',
    accent: '#a7f3d0',
    emoji: '👕',
  },
  {
    id: 'default-4',
    title: '📱 টেক পণ্যে সেরা অফার',
    subtitle: 'Electronics Sale',
    description: 'স্মার্টফোন, হেডফোন, গ্যাজেট — সেরা দামে পাচ্ছেন MizanMart-এ',
    cta_text: 'ইলেকট্রনিক্স দেখুন',
    cta_url: '/products?category=electronics',
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)',
    accent: '#a5b4fc',
    emoji: '📱',
  },
]

export function Hero({ banner }: Props) {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Use default slides, integrating DB hero banner if present
  const slides = banner
    ? [
        {
          id: banner.id,
          title: banner.title,
          subtitle: banner.subtitle || 'Special Highlight',
          description: banner.description || '',
          cta_text: banner.cta_text || 'এখনই শপিং করুন',
          cta_url: banner.cta_url || '/products',
          bg: banner.background_color?.startsWith('#')
            ? `linear-gradient(135deg, ${banner.background_color} 0%, #111827 100%)`
            : banner.background_color || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          accent: banner.text_color || '#F59E0B',
          emoji: '✨',
        },
        ...DEFAULT_SLIDES,
      ]
    : DEFAULT_SLIDES

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length)
  }, [slides.length])

  const prev = () => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length)
  }

  // Auto-rotate every 5s
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [isPaused, next])

  const slide = slides[current]

  return (
    <section className="relative overflow-hidden" style={{ height: '420px' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${(current * 100) / slides.length}%)`, width: `${slides.length * 100}%` }}
      >
        {slides.map((s) => (
          <div
            key={s.id}
            className="flex-shrink-0 relative flex items-center"
            style={{ width: `${100 / slides.length}%`, background: s.bg }}
          >
            <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 32px', width: '100%' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                {/* Text */}
                <div>
                  <div
                    className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4"
                    style={{ background: s.accent, color: '#000', opacity: 0.9 }}
                  >
                    {s.subtitle}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">
                    {s.title}
                  </h1>
                  <p className="text-sm md:text-base text-white/80 mb-6 max-w-md">
                    {s.description}
                  </p>
                  <div className="flex gap-3">
                    <Link
                      href={s.cta_url}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-black transition-all hover:scale-105 hover:shadow-lg"
                      style={{ background: s.accent }}
                    >
                      {s.cta_text}
                    </Link>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm text-white border-2 border-white/50 hover:border-white transition-all"
                    >
                      সব পণ্য
                    </Link>
                  </div>

                  {/* Trust mini-badges */}
                  <div className="flex items-center gap-4 mt-6">
                    {['🚚 ফ্রি ডেলিভারি', '✅ ১০০% অরিজিনাল', '↩️ ৭ দিন রিটার্ন'].map((item) => (
                      <span key={item} className="text-xs font-medium text-white/70">{item}</span>
                    ))}
                  </div>
                </div>

                {/* Right emoji visual */}
                <div className="hidden md:flex items-center justify-center">
                  <div
                    className="text-[120px] md:text-[160px] leading-none"
                    style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }}
                  >
                    {s.emoji}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev/Next arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 z-10"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        aria-label="Previous"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 z-10"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        aria-label="Next"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all"
            style={{
              width: i === current ? '24px' : '8px',
              height: '8px',
              background: i === current ? 'white' : 'rgba(255,255,255,0.5)',
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
