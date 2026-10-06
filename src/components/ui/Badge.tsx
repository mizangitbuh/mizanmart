import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'sale' | 'new'
type Size = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  danger:  'bg-[var(--color-error-bg)] text-[var(--color-error)]',
  info:    'bg-[var(--color-info-bg)] text-[var(--color-info)]',
  sale:    'bg-[var(--color-text)] text-white dark:bg-white dark:text-black',
  new:     'bg-[var(--color-success)] text-white',
}

const sizes: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
}

export function Badge({ className, variant = 'default', size = 'md', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-bold uppercase tracking-wide rounded',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}
