'use client'

import { useEffect } from 'react'
import { trackProductView } from '@/components/home/RecentlyViewed'

interface Props {
  product: {
    id: string
    name: string
    slug: string
    price: number
    compare_price: number | null
    images: string[]
  }
}

export function ProductViewTracker({ product }: Props) {
  useEffect(() => {
    trackProductView(product)
  }, [product])

  return null
}
