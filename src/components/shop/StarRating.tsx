'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

// ═══════════════════════════════════════════════
// Display mode — read-only stars
// ═══════════════════════════════════════════════
interface DisplayProps {
  rating: number // 0-5, can be decimal
  size?: number
  showValue?: boolean
  count?: number // review count
  mode?: 'display'
}

// ═══════════════════════════════════════════════
// Interactive mode — clickable
// ═══════════════════════════════════════════════
interface InteractiveProps {
  value: number // 0-5 integer
  onChange: (rating: number) => void
  size?: number
  mode: 'interactive'
}

type Props = DisplayProps | InteractiveProps

export function StarRating(props: Props) {
  if (props.mode === 'interactive') {
    return <InteractiveStars {...props} />
  }
  return <DisplayStars {...props} />
}

function DisplayStars({
  rating,
  size = 14,
  showValue = false,
  count,
}: DisplayProps) {
  const rounded = Math.round(rating)
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= rounded
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            }
          />
        ))}
      </div>
      {showValue && rating > 0 && (
        <span
          className="text-[11px] font-bold ml-0.5"
          style={{ color: 'var(--color-text)' }}
        >
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          ({count})
        </span>
      )}
    </div>
  )
}

function InteractiveStars({ value, onChange, size = 24 }: InteractiveProps) {
  const [hovered, setHovered] = useState(0)
  const display = hovered || value

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 p-0.5"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            className={
              star <= display
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300'
            }
          />
        </button>
      ))}
      {value > 0 && (
        <span
          className="text-sm font-bold ml-2"
          style={{ color: 'var(--color-text)' }}
        >
          {value}/5
        </span>
      )}
    </div>
  )
}
