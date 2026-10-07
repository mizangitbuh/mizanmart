'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface Props {
  images: string[]
  productName: string
  discount?: number
}

export function ProductGallery({ images, productName, discount = 0 }: Props) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [wishlisted, setWishlisted] = useState(false)
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' })

  const allImages = images.length > 0 ? images : ['https://picsum.photos/seed/' + encodeURIComponent(productName) + '/800/800']
  const currentImage = allImages[activeIndex]

  const goPrev = () => {
    setActiveIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))
  }

  const goNext = () => {
    setActiveIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
    })
  }

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' })
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-3">
      {/* Vertical Thumbnails on desktop */}
      {allImages.length > 1 && (
        <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[500px] flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className="relative w-16 h-16 rounded-[var(--radius-md)] overflow-hidden transition-all flex-shrink-0"
              style={{
                border: idx === activeIndex
                  ? '2px solid var(--color-primary)'
                  : '1px solid var(--color-border)',
                opacity: idx === activeIndex ? 1 : 0.6,
              }}
              aria-label={`ছবি ${idx + 1}`}
            >
              <Image src={img} alt={`${productName} ${idx + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image with Zoom */}
      <div
        className="relative flex-1 aspect-square rounded-[var(--radius-lg)] overflow-hidden group cursor-crosshair"
        style={{ border: '1px solid var(--color-border)', background: 'var(--color-background)', minHeight: '350px' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={currentImage}
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 45vw"
          className="object-cover"
          priority
        />

        {/* Zoom Overlay Lens effect */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200 hidden md:block"
          style={{
            ...zoomStyle,
            backgroundImage: `url(${currentImage})`,
            backgroundSize: '200%',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'var(--color-surface)',
          }}
        />

        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className="text-xs font-black text-white px-2.5 py-1 rounded shadow-sm"
              style={{ background: 'var(--color-primary)' }}
            >
              -{discount}% ছাড়
            </span>
          </div>
        )}

        {/* Zoom Hint */}
        <div className="absolute bottom-3 left-3 z-10 hidden md:flex items-center gap-1 text-[11px] font-semibold bg-black/60 text-white px-2 py-1 rounded backdrop-blur-sm pointer-events-none opacity-70 group-hover:opacity-0 transition-opacity">
          <ZoomIn size={13} /> জুম করতে মাউস রাখুন
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setWishlisted(!wishlisted)
          }}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          style={{ background: 'rgba(255,255,255,0.95)' }}
          aria-label="Wishlist"
        >
          <Heart
            size={18}
            className={wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}
          />
        </button>

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                goPrev()
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.95)' }}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} className="text-gray-800" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                goNext()
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.95)' }}
              aria-label="Next image"
            >
              <ChevronRight size={20} className="text-gray-800" />
            </button>
          </>
        )}

        {/* Counter */}
        {allImages.length > 1 && (
          <div
            className="absolute bottom-3 right-3 z-10 px-2 py-0.5 rounded text-[10px] font-bold text-white"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            {activeIndex + 1} / {allImages.length}
          </div>
        )}
      </div>
    </div>
  )
}
