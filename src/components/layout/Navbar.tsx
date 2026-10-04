'use client'

import Link from 'next/link'
import { ShoppingCart, Search, User } from 'lucide-react'
import { useCartStore } from '@/stores/cart'

export function Navbar() {
  const itemCount = useCartStore((state) => state.items.reduce((s, i) => s + i.quantity, 0))

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold">mizanmart</Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm hover:text-blue-600 transition">Home</Link>
          <Link href="/products" className="text-sm hover:text-blue-600 transition">Shop</Link>
          <Link href="/products?category=cosmetics" className="text-sm hover:text-blue-600 transition">Cosmetics</Link>
          <Link href="/products?category=clothing" className="text-sm hover:text-blue-600 transition">Clothing</Link>
          <Link href="/products?category=electronics" className="text-sm hover:text-blue-600 transition">Electronics</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/products" aria-label="Search"><Search size={20} /></Link>
          <Link href="/account" aria-label="Account"><User size={20} /></Link>
          <Link href="/cart" className="relative" aria-label="Cart">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  )
}
