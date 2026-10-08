'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ShoppingCart, User, Heart, Menu, X, Phone, ChevronDown, ChevronRight, Grid3X3, Tag } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { SmartSearch } from '@/components/shop/SmartSearch'
import { Logo } from '@/components/shared/Logo'

// ক্যাটাগরি ডেটা
const MEGA_MENU_DATA = [
  {
    name: 'Electronics',
    nameBn: 'ইলেকট্রনিক্স ও গ্যাজেট',
    slug: 'electronics',
    icon: '📱',
    sub: ['হেডফোন ও ইয়ারবাডস', 'স্মার্ট ওয়াচ', 'ফাস্ট চার্জার ও কেবল', 'পাওয়ার ব্যাংক', 'ব্লুটুথ স্পিকার', 'মোবাইল এক্সেসরিজ'],
  },
  {
    name: 'General',
    nameBn: 'স্মার্ট হোম ও টুলস',
    slug: 'general',
    icon: '🛒',
    sub: ['হোম অ্যাপ্লায়েন্স', 'স্মার্ট কিচেন টুলস', 'লাইফস্টাইল গ্যাজেট', 'কার এক্সেসরিজ', 'টর্চ ও লাইটিং', 'দৈনন্দিন টুলস'],
  },
  {
    name: 'Clothing',
    nameBn: 'পোশাক ও ফ্যাশন',
    slug: 'clothing',
    icon: '👕',
    sub: ['টি-শার্ট ও পোলো', 'জ্যাকেট ও হুডি', 'উইন্টার কালেকশন', 'ক্যাজুয়াল ওয়্যার', 'ফ্যাশন এক্সেসরিজ'],
  },
  {
    name: 'Cosmetics',
    nameBn: 'বিউটি ও কেয়ার',
    slug: 'cosmetics',
    icon: '💄',
    sub: ['স্কিনকেয়ার টুলস', 'ফেসিয়াল ম্যাসাজার', 'হেয়ার ড্রায়ার ও ট্রিমার', 'পার্সোনাল কেয়ার'],
  },
]

const FEATURED_PROMO = {
  title: '⚡ Flash Sale!',
  subtitle: 'সর্বোচ্চ ৫০% ছাড়',
  cta: 'এখনই দেখুন',
  href: '/products?discount=yes',
  bg: 'linear-gradient(135deg, #D92D3F 0%, #991B1B 100%)',
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [hoveredCat, setHoveredCat] = useState(MEGA_MENU_DATA[0])
  const megaRef = useRef<HTMLDivElement>(null)
  const megaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const itemCount = useCartStore((state) => state.items.reduce((s, i) => s + i.quantity, 0))
  const openDrawer = useCartStore((state) => state.openDrawer)
  const [storeSettings, setStoreSettings] = useState<any>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setStoreSettings(d))
      .catch(() => {})
  }, [])

  // Click outside mega menu
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const openMega = () => {
    if (megaTimerRef.current) clearTimeout(megaTimerRef.current)
    megaTimerRef.current = setTimeout(() => setMegaOpen(true), 150)
  }
  const closeMega = () => {
    if (megaTimerRef.current) clearTimeout(megaTimerRef.current)
    megaTimerRef.current = setTimeout(() => setMegaOpen(false), 150)
  }

  const navLinks = [
    { name: 'Home', nameBn: 'হোম', href: '/' },
    { name: 'New Arrivals', nameBn: 'নতুন পণ্য', href: '/products?sort=newest' },
    { name: '⚡ Deals', nameBn: '⚡ অফার', href: '/products?discount=yes' },
    { name: 'Cosmetics', nameBn: 'কসমেটিক্স', href: '/products?category=cosmetics' },
    { name: 'Clothing', nameBn: 'পোশাক', href: '/products?category=clothing' },
    { name: 'Electronics', nameBn: 'ইলেকট্রনিক্স', href: '/products?category=electronics' },
  ]

  return (
    <>
      {/* Announcement Bar */}
      {storeSettings?.announcement_enabled !== false && (
        <div className="announce-bar" style={{ padding: '7px 0', textAlign: 'center', fontSize: '12px', fontWeight: 600 }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Phone size={11} />
            <span>
              {storeSettings?.announcement_text || '🎉 FREE DELIVERY on orders over ৳1000 | ৳1000-এর বেশি অর্ডারে বিনামূল্যে ডেলিভারি'} &nbsp;|&nbsp; Hotline: {storeSettings?.support_phone || '01871418973'}
            </span>
          </div>
        </div>
      )}

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--color-surface)',
          boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.1)' : '0 1px 0 var(--color-border)',
        }}
      >
        {/* Main navbar row */}
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
          <div className="flex items-center gap-2 md:gap-4 py-2.5 md:py-3">
            {/* Mobile: hamburger */}
            <button
              className="md:hidden p-2 rounded"
              style={{ color: 'var(--color-text)' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="মেনু"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Logo href={null} variant="inline" height={44} />
            </Link>

            {/* Desktop: All Categories button + Mega Menu */}
            <div className="hidden md:block relative" ref={megaRef}>
              <button
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
                onClick={() => setMegaOpen(!megaOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'var(--color-primary)', whiteSpace: 'nowrap' }}
              >
                <Grid3X3 size={16} />
                সব ক্যাটাগরি
                <ChevronDown size={14} className={`transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega Menu Dropdown */}
              {megaOpen && (
                <div
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                  className="absolute top-full left-0 mt-1 rounded-[var(--radius-lg)] shadow-xl border overflow-hidden z-50"
                  style={{
                    width: '720px',
                    background: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    animation: 'fadeInDown 0.15s ease',
                  }}
                >
                  <div className="flex h-[340px]">
                    {/* Col 1: Categories list */}
                    <div className="w-[200px] border-r flex-shrink-0 overflow-y-auto" style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}>
                      {MEGA_MENU_DATA.map((cat) => (
                        <button
                          key={cat.slug}
                          onMouseEnter={() => setHoveredCat(cat)}
                          onClick={() => setMegaOpen(false)}
                          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-colors text-left hover:bg-[var(--color-surface)]"
                          style={{
                            color: hoveredCat.slug === cat.slug ? 'var(--color-primary)' : 'var(--color-text)',
                            borderLeft: hoveredCat.slug === cat.slug ? '3px solid var(--color-primary)' : '3px solid transparent',
                            background: hoveredCat.slug === cat.slug ? 'var(--color-surface)' : 'transparent',
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span>{cat.nameBn}</span>
                          </span>
                          <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                        </button>
                      ))}
                    </div>

                    {/* Col 2: Sub-categories */}
                    <div className="w-[280px] p-4 flex-shrink-0">
                      <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
                        {hoveredCat.nameBn} — সাব ক্যাটাগরি
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {hoveredCat.sub.map((sub) => (
                          <Link
                            key={sub}
                            href={`/products?category=${hoveredCat.slug}&q=${encodeURIComponent(sub)}`}
                            onClick={() => setMegaOpen(false)}
                            className="flex items-center gap-1.5 px-2 py-2 rounded text-sm transition-colors hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            <ChevronRight size={12} />
                            {sub}
                          </Link>
                        ))}
                      </div>
                      <Link
                        href={`/products?category=${hoveredCat.slug}`}
                        onClick={() => setMegaOpen(false)}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-bold hover:underline"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        সব {hoveredCat.nameBn} দেখুন →
                      </Link>
                    </div>

                    {/* Col 3: Featured Promo */}
                    <div className="flex-1 p-4">
                      <div className="h-full rounded-[var(--radius-lg)] overflow-hidden flex flex-col justify-end p-4 text-white relative"
                        style={{ background: FEATURED_PROMO.bg }}>
                        <Tag size={24} className="mb-2 opacity-80" />
                        <div className="text-lg font-black mb-1">{FEATURED_PROMO.title}</div>
                        <div className="text-sm opacity-90 mb-3">{FEATURED_PROMO.subtitle}</div>
                        <Link
                          href={FEATURED_PROMO.href}
                          onClick={() => setMegaOpen(false)}
                          className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold text-white border-2 border-white hover:bg-white hover:text-red-700 transition-colors"
                        >
                          {FEATURED_PROMO.cta}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <SmartSearch placeholder="পণ্য, ব্র্যান্ড খুঁজুন..." />
            </div>

            {/* Icons */}
            <div className="ml-auto flex items-center gap-1 md:gap-2">
              <Link
                href="/login"
                className="hidden md:flex flex-col items-center gap-0.5 px-2 py-1.5 rounded hover:bg-[var(--color-surface-hover)] transition-colors"
                style={{ color: 'var(--color-text)' }}
              >
                <User size={20} />
                <span className="text-[10px] font-semibold hidden lg:block">অ্যাকাউন্ট</span>
              </Link>

              <Link
                href="/account/wishlist"
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded hover:bg-[var(--color-surface-hover)] transition-colors relative"
                style={{ color: 'var(--color-text)' }}
                aria-label="Wishlist"
              >
                <Heart size={20} />
                <span className="text-[10px] font-semibold hidden lg:block">পছন্দের তালিকা</span>
              </Link>

              <button
                type="button"
                onClick={() => openDrawer?.()}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded hover:bg-[var(--color-surface-hover)] transition-colors relative cursor-pointer"
                style={{ color: 'var(--color-text)' }}
                aria-label="Cart"
              >
                <div className="relative">
                  <ShoppingCart size={20} />
                  {itemCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: 'var(--color-primary)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold hidden lg:block">কার্ট</span>
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-2.5">
            <SmartSearch placeholder="পণ্য খুঁজুন..." compact />
          </div>

          {/* Desktop Bottom Nav Strip */}
          <nav
            className="hidden md:flex items-center gap-0 border-t"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-3 py-2.5 text-xs font-semibold transition-colors hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] rounded whitespace-nowrap"
                style={{ color: 'var(--color-text)' }}
              >
                {link.nameBn}
              </Link>
            ))}
            <Link
              href="/products"
              className="ml-auto px-3 py-2.5 text-xs font-bold transition-colors"
              style={{ color: 'var(--color-primary)' }}
            >
              সব পণ্য দেখুন →
            </Link>
          </nav>
        </div>

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-[280px] overflow-y-auto"
              style={{ background: 'var(--color-surface)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-primary)' }}>
                <span className="text-white font-black text-lg">MizanMart মেনু</span>
                <button onClick={() => setMobileMenuOpen(false)} className="text-white p-1">
                  <X size={20} />
                </button>
              </div>

              {/* Categories */}
              <div className="p-3">
                <div className="text-xs font-bold uppercase tracking-wider mb-2 px-2" style={{ color: 'var(--color-text-muted)' }}>
                  ক্যাটাগরি
                </div>
                {MEGA_MENU_DATA.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/products?category=${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-[var(--radius-md)] font-semibold text-sm transition-colors hover:bg-[var(--color-primary-light)]"
                    style={{ color: 'var(--color-text)' }}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span>{cat.nameBn}</span>
                    <ChevronRight size={16} className="ml-auto" style={{ color: 'var(--color-text-muted)' }} />
                  </Link>
                ))}
              </div>

              <div className="border-t p-3" style={{ borderColor: 'var(--color-border)' }}>
                <div className="text-xs font-bold uppercase tracking-wider mb-2 px-2" style={{ color: 'var(--color-text-muted)' }}>
                  কুইক লিংক
                </div>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-3 py-2.5 text-sm font-medium rounded transition-colors hover:bg-[var(--color-surface-hover)]"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {link.nameBn}
                  </Link>
                ))}
              </div>

              <div className="border-t p-3" style={{ borderColor: 'var(--color-border)' }}>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded transition-colors hover:bg-[var(--color-surface-hover)]"
                  style={{ color: 'var(--color-text)' }}
                >
                  <User size={16} /> আমার অ্যাকাউন্ট
                </Link>
                <Link
                  href="/account/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded transition-colors hover:bg-[var(--color-surface-hover)]"
                  style={{ color: 'var(--color-text)' }}
                >
                  <Heart size={16} /> পছন্দের তালিকা
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded transition-colors hover:bg-[var(--color-surface-hover)]"
                  style={{ color: 'var(--color-text)' }}
                >
                  <ShoppingCart size={16} /> কার্ট {itemCount > 0 && `(${itemCount})`}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
