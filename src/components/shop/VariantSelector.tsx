'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

interface Props {
  sizes?: string[]
  selectedSize?: string
  onSelectSize?: (size: string) => void
}

export function VariantSelector({ sizes = [], selectedSize: controlledSize, onSelectSize }: Props) {
  const [internalSize, setInternalSize] = useState(sizes[0] || '')
  const activeSize = controlledSize !== undefined ? controlledSize : internalSize

  const handleSelect = (s: string) => {
    setInternalSize(s)
    onSelectSize?.(s)
  }

  // If no sizes are provided, do not render
  if (!sizes || sizes.length === 0) return null

  return (
    <div className="space-y-2.5 my-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-[var(--color-text)]">
          সাইজ (Available Size): <strong className="text-[var(--color-primary)] font-black text-sm">{activeSize}</strong>
        </span>
        <span className="text-[11px] text-[var(--color-text-muted)]">
          {sizes.length}টি সাইজ উপলব্ধ
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = activeSize === size
          return (
            <button
              key={size}
              type="button"
              onClick={() => handleSelect(size)}
              className="px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all min-w-[40px] flex items-center justify-center active:scale-95"
              style={{
                background: isSelected ? 'var(--color-primary)' : 'var(--color-surface)',
                color: isSelected ? 'white' : 'var(--color-text)',
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                boxShadow: isSelected ? '0 2px 4px rgba(217, 45, 63, 0.25)' : 'none',
              }}
            >
              {size}
            </button>
          )
        })}
      </div>
    </div>
  )
}
