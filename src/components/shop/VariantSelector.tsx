'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

const DEFAULT_COLORS = [
  { name: 'Classic Black', hex: '#111827' },
  { name: 'Royal Crimson', hex: '#991B1B' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Pearl White', hex: '#F3F4F6' },
]

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'Free Size']

export function VariantSelector() {
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0])
  const [selectedSize, setSelectedSize] = useState(DEFAULT_SIZES[1])

  return (
    <div className="space-y-3.5 my-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
      {/* Color Selection */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-[var(--color-text)]">
            রং (Color): <strong className="text-[var(--color-primary)]">{selectedColor.name}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {DEFAULT_COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setSelectedColor(c)}
              className="relative w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center hover:scale-110"
              style={{
                backgroundColor: c.hex,
                borderColor: selectedColor.name === c.name ? 'var(--color-primary)' : '#e5e7eb',
                boxShadow: selectedColor.name === c.name ? '0 0 0 2px var(--color-primary-light)' : 'none',
              }}
              title={c.name}
              aria-label={c.name}
            >
              {selectedColor.name === c.name && (
                <Check size={12} className={c.hex === '#F3F4F6' ? 'text-black' : 'text-white'} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-[var(--color-text)]">
            সাইজ (Size): <strong className="text-[var(--color-primary)]">{selectedSize}</strong>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className="px-3 py-1.5 rounded-[var(--radius-sm)] border text-xs font-bold transition-all"
              style={{
                background: selectedSize === size ? 'var(--color-primary)' : 'var(--color-surface)',
                color: selectedSize === size ? 'white' : 'var(--color-text)',
                borderColor: selectedSize === size ? 'var(--color-primary)' : 'var(--color-border)',
              }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
