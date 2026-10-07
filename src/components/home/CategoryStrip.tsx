'use client'

import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  sort_order?: number
}

const CATEGORY_ICONS: Record<string, { emoji: string; color: string }> = {
  cosmetics: { emoji: '💄', color: '#FFE4E6' },
  clothing: { emoji: '👕', color: '#E0F2FE' },
  electronics: { emoji: '📱', color: '#F3E8FF' },
  general: { emoji: '🛒', color: '#FEF9C3' },
  beauty: { emoji: '✨', color: '#FCE7F3' },
  food: { emoji: '🍎', color: '#DCFCE7' },
  sports: { emoji: '⚽', color: '#FFF7ED' },
  books: { emoji: '📚', color: '#EFF6FF' },
}

// সব পেলে এক্সট্রা default icons
const EXTRA_ITEMS = [
  { id: 'x1', name: 'Flash Sale', slug: 'flash', emoji: '⚡', color: '#FEF2F2', href: '/products?discount=yes' },
  { id: 'x2', name: 'New Arrivals', slug: 'new', emoji: '🆕', color: '#F0FDF4', href: '/products?sort=newest' },
  { id: 'x3', name: 'Top Rated', slug: 'top', emoji: '⭐', color: '#FFFBEB', href: '/products?sort=rating' },
  { id: 'x4', name: 'Free Delivery', slug: 'free', emoji: '🚚', color: '#F0F9FF', href: '/products' },
]

interface Props {
  categories: Category[]
}

export function CategoryStrip({ categories }: Props) {
  const items = [
    ...categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      emoji: CATEGORY_ICONS[cat.slug]?.emoji || '🛍️',
      color: CATEGORY_ICONS[cat.slug]?.color || '#F5F5F5',
      href: `/products?category=${cat.slug}`,
    })),
    ...EXTRA_ITEMS,
  ]

  return (
    <section className="border-b" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
        {/* Scrollable strip */}
        <div
          className="flex items-center gap-4 py-4 overflow-x-auto"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center gap-2 flex-shrink-0 group"
              style={{ minWidth: '72px' }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all group-hover:scale-110 group-hover:shadow-md"
                style={{ background: item.color }}
              >
                {item.emoji}
              </div>
              <span
                className="text-[11px] font-semibold text-center leading-tight group-hover:text-[var(--color-primary)] transition-colors"
                style={{ color: 'var(--color-text)', maxWidth: '64px' }}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
