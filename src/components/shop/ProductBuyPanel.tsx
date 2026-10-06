'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Zap } from 'lucide-react'
import { useCartStore } from '@/stores/cart'
import { Button } from '@/components/ui/Button'
import { QuantitySelector } from '@/components/shop/QuantitySelector'

interface Props {
  product: {
    id: string
    name: string
    slug: string
    price: number
    image: string
  }
  disabled?: boolean
  maxQuantity?: number
}

export function ProductBuyPanel({ product, disabled, maxQuantity = 99 }: Props) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    if (disabled) return
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    if (disabled) return
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.image,
      })
    }
    router.push('/checkout')
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Quantity
        </label>
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={disabled ? 1 : Math.min(maxQuantity, 99)}
          size="lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          size="lg"
          onClick={handleAdd}
          disabled={disabled}
          className="w-full"
        >
          <ShoppingCart size={18} />
          {added ? 'Added!' : disabled ? 'Out of Stock' : 'Add to Cart'}
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={handleBuyNow}
          disabled={disabled}
          className="w-full"
        >
          <Zap size={18} />
          Buy Now
        </Button>
      </div>
    </div>
  )
}
