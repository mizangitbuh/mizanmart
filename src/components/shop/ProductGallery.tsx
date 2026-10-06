'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface Props {
  images: string[]
  productName: string
  discount?: number
}

export function ProductGallery({ images, productName, discount = 0 }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [wishlisted, setWishlisted] = useState(false)

  const allImages = images.length > 0 ? images : ['https://picsum.photos/seed/' + encodeURIComponent(productName) + '/800/800']
  const currentImage = allImages[activeIndex]

  const goPrev = () => {
    setActiveIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))
  }

  const goNext = () => {
    setActiveIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div
        className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden group"
        style={{ border: '1px solid var(--color-border)', background: 'var(--color-background)' }}
      >
        <Image
          src={currentImage}
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-4 left-4">
            <Badge variant="sale" size="md">-{discount}% OFF</Badge>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={() => setWishlisted(!wishlisted)}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          style={{ background: 'rgba(255,255,255,0.95)' }}
          aria-label="Add to wishlist"
        >
          <Heart
            size={18}
            className={wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}
          />
        </button>

        {/* Prev/Next — multiple images হলে */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(255,255,255,0.95)' }}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(255,255,255,0.95)' }}
              aria-label="Next image"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          </>
        )}

        {/* Image counter */}
        {allImages.length > 1 && (
          <div
            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            {activeIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className="relative aspect-square rounded-[var(--radius-md)] overflow-hidden transition-all"
              style={{
                border: idx === activeIndex
                  ? '2px solid var(--color-primary)'
                  : '2px solid var(--color-border)',
                opacity: idx === activeIndex ? 1 : 0.7,
              }}
              aria-label={`View image ${idx + 1}`}
            >
              <Image src={img} alt={`${productName} ${idx + 1}`} fill className="object-cover" sizes="100px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
