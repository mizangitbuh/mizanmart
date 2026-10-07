'use client'

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface WishlistContextValue {
  isWishlisted: (productId: string) => boolean
  toggle: (productId: string) => Promise<void>
  ready: boolean
  count: number
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ids, setIds] = useState<Set<string>>(new Set())
  const [ready, setReady] = useState(false)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const hasFetched = useRef(false)

  // Initial fetch — one time on mount
  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/wishlist', { cache: 'no-store' })
        if (res.status === 401) {
          // Not logged in — empty set, still ready
          if (!cancelled) setReady(true)
          return
        }
        if (!res.ok) throw new Error('Failed to load wishlist')
        const data = await res.json()
        const productIds = (data.items || [])
          .map((it: any) => it.product_id)
          .filter(Boolean)
        if (!cancelled) {
          setIds(new Set(productIds))
          setReady(true)
        }
      } catch (err) {
        console.error('Wishlist provider fetch failed:', err)
        if (!cancelled) setReady(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const isWishlisted = useCallback(
    (productId: string) => ids.has(productId),
    [ids]
  )

  const toggle = useCallback(
    async (productId: string) => {
      if (busyIds.has(productId)) return

      const wasWishlisted = ids.has(productId)

      // Optimistic update
      setIds((prev) => {
        const next = new Set(prev)
        if (wasWishlisted) next.delete(productId)
        else next.add(productId)
        return next
      })
      setBusyIds((prev) => new Set(prev).add(productId))

      try {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId }),
        })
        const data = await res.json()

        if (res.status === 401) {
          // Revert
          setIds((prev) => {
            const next = new Set(prev)
            if (wasWishlisted) next.add(productId)
            else next.delete(productId)
            return next
          })
          toast.error('Please sign in to save items')
          router.push(
            '/login?redirect=' + encodeURIComponent(window.location.pathname)
          )
          return
        }

        if (!res.ok) throw new Error(data.error || 'Failed')

        // Sync with server response (source of truth)
        const serverWishlisted = Boolean(data.wishlisted)
        setIds((prev) => {
          const next = new Set(prev)
          if (serverWishlisted) next.add(productId)
          else next.delete(productId)
          return next
        })

        toast.success(
          serverWishlisted ? 'Added to wishlist' : 'Removed from wishlist'
        )
        router.refresh()
      } catch (err) {
        // Revert on error
        setIds((prev) => {
          const next = new Set(prev)
          if (wasWishlisted) next.add(productId)
          else next.delete(productId)
          return next
        })
        toast.error(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setBusyIds((prev) => {
          const next = new Set(prev)
          next.delete(productId)
          return next
        })
      }
    },
    [ids, busyIds, router]
  )

  return (
    <WishlistContext.Provider
      value={{
        isWishlisted,
        toggle,
        ready,
        count: ids.size,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext)
  if (!ctx) {
    throw new Error('useWishlist must be used within WishlistProvider')
  }
  return ctx
}
