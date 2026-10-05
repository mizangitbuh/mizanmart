import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'sale'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variants: Record<Variant, string> = {
  primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white',
  secondary: 'bg-[var(--color-text)] hover:bg-black text-white',
  ghost: 'hover:bg-[var(--color-surface-hover)] text-[var(--color-text)]',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  outline: 'border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white',
  sale: 'bg-[var(--color-text)] hover:bg-[var(--color-primary)] text-white',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition-all',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
)
Button.displayName = 'Button'
