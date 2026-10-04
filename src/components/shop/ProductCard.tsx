'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'

export interface ProductCardData {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  images: string[]
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const addItem = useCartStore((s) => s.addItem)
  const image = product.images?.[0] || '/placeholder.png'

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image,
    })
  }

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  return (
    <Link href={`/product/${product.slug}`}>
      <Card className="group h-full overflow-hidden">
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
        </div>
        <CardBody className="flex flex-col gap-2">
          <h3 className="font-medium text-sm line-clamp-2 min-h-10">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
            {product.compare_price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
          <Button size="sm" onClick={handleAdd} className="mt-2 w-full">
            <ShoppingCart size={14} className="mr-1" />
            Add to Cart
          </Button>
        </CardBody>
      </Card>
    </Link>
  )
}
