'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid3X3, ShoppingCart, Heart, User } from 'lucide-react'
import { useCartStore } from '@/stores/cart'

const navItems = [
  { href: '/', label: 'হোম', icon: Home },
  { href: '/products', label: 'ক্যাটাগরি', icon: Grid3X3 },
  { href: '/cart', label: 'কার্ট', icon: ShoppingCart, isCart: true },
  { href: '/account/wishlist', label: 'পছন্দ', icon: Heart },
  { href: '/account', label: 'প্রোফাইল', icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const itemCount = useCartStore((state) =>
    state.items.reduce((s, i) => s + i.quantity, 0)
  )
  const openDrawer = useCartStore((state) => state.openDrawer)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
      style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="grid grid-cols-5 h-14">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          if (item.isCart) {
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => openDrawer?.()}
                className="flex flex-col items-center justify-center gap-0.5 transition-colors relative min-h-[44px] min-w-[44px] cursor-pointer"
                style={{
                  color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                  {itemCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ background: 'var(--color-primary)' }}
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
                <span
                  className="text-[10px] font-semibold leading-none"
                  style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                >
                  {item.label}
                </span>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 transition-colors relative min-h-[44px] min-w-[44px]"
              style={{
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              <span
                className="text-[10px] font-semibold leading-none"
                style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
