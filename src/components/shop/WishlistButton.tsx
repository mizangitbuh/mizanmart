'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Props {
  productId: string
  initialWishlisted?: boolean
  variant?: 'icon' | 'inline'
  className?: string
}

export function WishlistButton({
  productId,
  initialWishlisted = false,
  variant = 'icon',
  className = '',
}: Props) {
  const router = useRouter()
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [busy, setBusy] = useState(false)

  // Sync when initialWishlisted changes (server refresh)
  useEffect(() => {
    setWishlisted(initialWishlisted)
  }, [initialWishlisted])

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return

    const prev = wishlisted
    setWishlisted(!prev) // optimistic
    setBusy(true)

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      })
      const data = await res.json()

      if (res.status === 401) {
        setWishlisted(prev)
        toast.error('Please sign in to save items')
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
        return
      }

      if (!res.ok) throw new Error(data.error || 'Failed')

      setWishlisted(Boolean(data.wishlisted))
      if (data.wishlisted) {
        toast.success('Added to wishlist')
      } else {
        toast.success('Removed from wishlist')
      }
      router.refresh()
    } catch (err) {
      setWishlisted(prev)
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] font-semibold text-sm border transition disabled:opacity-50 ${className}`}
        style={{
          borderColor: wishlisted ? 'var(--color-primary)' : 'var(--color-border)',
          color: wishlisted ? 'var(--color-primary)' : 'var(--color-text)',
          background: 'transparent',
        }}
      >
        <Heart
          size={16}
          className={wishlisted ? 'fill-current' : ''}
        />
        {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
      </button>
    )
  }

  // default: icon variant (for product cards)
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform disabled:opacity-50 ${className}`}
      style={{ background: 'rgba(255,255,255,0.95)' }}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={14}
        className={
          wishlisted
            ? 'fill-red-500 text-red-500'
            : 'text-gray-500'
        }
      />
    </button>
  )
}
