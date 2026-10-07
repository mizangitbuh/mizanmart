'use client'

import { Heart } from 'lucide-react'
import { useWishlist } from '@/components/providers/WishlistProvider'

interface Props {
  productId: string
  variant?: 'icon' | 'inline'
  className?: string
  /** @deprecated No longer needed — provider handles state */
  initialWishlisted?: boolean
}

export function WishlistButton({
  productId,
  variant = 'icon',
  className = '',
}: Props) {
  const { isWishlisted, toggle, ready } = useWishlist()
  const wishlisted = isWishlisted(productId)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!ready) return
    toggle(productId)
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={!ready}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] font-semibold text-sm border transition disabled:opacity-50 ${className}`}
        style={{
          borderColor: wishlisted ? 'var(--color-primary)' : 'var(--color-border)',
          color: wishlisted ? 'var(--color-primary)' : 'var(--color-text)',
          background: 'transparent',
        }}
      >
        <Heart size={16} className={wishlisted ? 'fill-current' : ''} />
        {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!ready}
      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform disabled:opacity-60 ${className}`}
      style={{ background: 'rgba(255,255,255,0.95)' }}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={14}
        className={
          wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'
        }
      />
    </button>
  )
}
