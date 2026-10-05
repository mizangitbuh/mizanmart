'use client'

import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/stores/cart'

interface Props {
  product: {
    id: string
    name: string
    slug: string
    price: number
    image: string
  }
  disabled?: boolean
}

export function AddToCartButton({ product, disabled }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const handleClick = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Button
      size="lg"
      onClick={handleClick}
      disabled={disabled}
      className="w-full md:w-auto"
      style={{
        backgroundColor: disabled ? '#9E9E9E' : 'var(--color-primary)',
        color: 'white',
      }}
    >
      {added ? (
        <>
          <Check size={18} className="mr-2" />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart size={18} className="mr-2" />
          {disabled ? 'Out of Stock' : 'Add to Cart'}
        </>
      )}
    </Button>
  )
}
