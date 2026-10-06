'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, User, Heart, Menu, X, Phone } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { SmartSearch } from '@/components/shop/SmartSearch'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const itemCount = useCartStore((state) => state.items.reduce((s, i) => s + i.quantity, 0))

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/products' },
    { name: 'Cosmetics', href: '/products?category=cosmetics' },
    { name: 'Clothing', href: '/products?category=clothing' },
    { name: 'Electronics', href: '/products?category=electronics' },
    { name: 'General', href: '/products?category=general' },
  ]

  return (
    <>
      {/* Announcement Bar */}
      <div
        style={{
          background: 'linear-gradient(90deg, #B91C2C 0%, #D92D3F 50%, #B91C2C 100%)',
          color: '#FFFFFF',
          padding: '8px 0',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: 500,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Phone size={12} />
          <span>FREE DELIVERY on orders over ৳1000 | Hotline: 01871418973</span>
        </div>
      </div>

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--color-surface)',
          boxShadow: scrolled ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div className="flex items-center gap-3 md:gap-6 py-3 md:py-4">
            {/* Mobile menu button */}
            <button
              className="md:hidden"
              style={{ color: 'var(--color-text)' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span
                className="text-2xl md:text-3xl font-black tracking-tight"
                style={{ color: 'var(--color-primary)' }}
              >
                mizan<span style={{ color: 'var(--color-text)' }}>mart</span>
              </span>
            </Link>

            {/* Desktop Search — SmartSearch */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-4">
              <SmartSearch placeholder="Search for products, brands and more..." />
            </div>

            {/* Icons */}
            <div className="ml-auto flex items-center gap-1 md:gap-3">
              <Link href="/login" className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg">
                <User size={18} style={{ color: 'var(--color-text)' }} />
                <span className="text-sm font-medium hidden lg:inline" style={{ color: 'var(--color-text)' }}>
                  Account
                </span>
              </Link>

              <Link href="/products" className="relative p-2 rounded-full" aria-label="Wishlist">
                <Heart size={20} style={{ color: 'var(--color-text)' }} />
              </Link>

              <Link href="/cart" className="relative p-2 rounded-full" aria-label="Cart">
                <ShoppingCart size={20} style={{ color: 'var(--color-text)' }} />
                {itemCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: 'var(--color-primary)',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search — SmartSearch */}
          <div className="md:hidden pb-3">
            <SmartSearch placeholder="Search products..." compact />
          </div>

          {/* Category Menu */}
          <nav
            className="hidden md:flex items-center gap-1"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="px-4 py-3 text-sm font-semibold transition-colors hover:text-[var(--color-primary)]"
                style={{ color: 'var(--color-text)' }}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden slide-down"
            style={{
              borderTop: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
            }}
          >
            <nav className="flex flex-col" style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 16px' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-2 text-sm font-medium"
                  style={{
                    color: 'var(--color-text)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 px-2 text-sm font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                My Account
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
