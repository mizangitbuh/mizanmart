'use client'

import { Minus, Plus } from 'lucide-react'

interface Props {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
}

export function QuantitySelector({ value, onChange, min = 1, max = 99, size = 'md' }: Props) {
  const handleDecrease = () => {
    if (value > min) onChange(value - 1)
  }

  const handleIncrease = () => {
    if (value < max) onChange(value + 1)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value) || min
    onChange(Math.min(max, Math.max(min, num)))
  }

  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  }[size]

  const btnSize = {
    sm: 'w-8',
    md: 'w-10',
    lg: 'w-12',
  }[size]

  return (
    <div
      className={`inline-flex items-center rounded-[var(--radius-md)] border overflow-hidden ${sizeClasses}`}
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
    >
      <button
        type="button"
        onClick={handleDecrease}
        disabled={value <= min}
        className={`${btnSize} h-full flex items-center justify-center transition-colors hover:bg-[var(--color-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed`}
        style={{ color: 'var(--color-text)' }}
        aria-label="Decrease quantity"
      >
        <Minus size={size === 'lg' ? 18 : 14} />
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInput}
        min={min}
        max={max}
        className="w-14 text-center font-bold focus:outline-none border-x"
        style={{
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          borderColor: 'var(--color-border)',
        }}
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={handleIncrease}
        disabled={value >= max}
        className={`${btnSize} h-full flex items-center justify-center transition-colors hover:bg-[var(--color-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed`}
        style={{ color: 'var(--color-text)' }}
        aria-label="Increase quantity"
      >
        <Plus size={size === 'lg' ? 18 : 14} />
      </button>
    </div>
  )
}
