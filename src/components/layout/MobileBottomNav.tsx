'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingCart, User } from 'lucide-react'
import { useCartStore } from '@/stores/cart'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/products', label: 'Shop', icon: Search },
  { href: '/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/account', label: 'Account', icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const itemCount = useCartStore((state) =>
    state.items.reduce((s, i) => s + i.quantity, 0)
  )

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const isCart = item.href === '/cart'

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 py-2.5 transition-colors relative"
              style={{
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                {isCart && itemCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] font-semibold"
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
