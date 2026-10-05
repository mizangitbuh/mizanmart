'use client'

import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #C62828 0%, #8E0000 100%)' }}
      />

      <div className="container-main relative py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-white fade-in-up">
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              ✨ New Collection 2026
            </span>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight">
              Shop the
              <br />
              <span className="text-yellow-300">Latest Trends</span>
            </h1>

            <p className="text-base md:text-lg opacity-90 mb-8 max-w-lg">
              Cosmetics · Clothing · Electronics · General
              <br />
              বাংলাদেশের সেরা অনলাইন শপ
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[var(--color-primary)] rounded-full font-bold text-sm hover:bg-yellow-300 transition-all shadow-lg"
              >
                <ShoppingBag size={18} />
                Shop Now
              </Link>
              <Link
                href="/products?category=cosmetics"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white rounded-full font-bold text-sm hover:bg-white hover:text-[var(--color-primary)] transition-all"
              >
                Cosmetics
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="flex gap-6 mt-8 text-sm">
              <div>
                <div className="text-2xl font-black">500+</div>
                <div className="opacity-80 text-xs">Products</div>
              </div>
              <div className="border-l border-white/20 pl-6">
                <div className="text-2xl font-black">1000+</div>
                <div className="opacity-80 text-xs">Customers</div>
              </div>
              <div className="border-l border-white/20 pl-6">
                <div className="text-2xl font-black">24/7</div>
                <div className="opacity-80 text-xs">Support</div>
              </div>
            </div>
          </div>

          <div className="hidden md:grid grid-cols-2 gap-4 relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl transform rotate-3">
              <div className="w-full h-full flex items-center justify-center text-7xl" style={{ background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)' }}>💄</div>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl transform -rotate-3 mt-8">
              <div className="w-full h-full flex items-center justify-center text-7xl" style={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' }}>📱</div>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl transform rotate-3 -mt-8">
              <div className="w-full h-full flex items-center justify-center text-7xl" style={{ background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)' }}>👕</div>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl transform -rotate-3">
              <div className="w-full h-full flex items-center justify-center text-7xl" style={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' }}>🛒</div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 leading-[0]">
        <svg viewBox="0 0 1440 60" className="w-full h-auto" preserveAspectRatio="none">
          <path fill="var(--color-background)" d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>
    </section>
  )
}
