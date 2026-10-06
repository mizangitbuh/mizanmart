import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, onAction }: Props) {
  return (
    <div className="text-center py-16 px-4">
      <div
        className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ background: 'var(--color-primary-light)' }}
      >
        <Icon size={36} style={{ color: 'var(--color-primary)' }} />
      </div>
      <h2 className="text-xl font-black mb-1" style={{ color: 'var(--color-text)' }}>{title}</h2>
      {description && (
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
      )}
      {(actionLabel && actionHref) && (
        <Link
          href={actionHref}
          className="inline-block px-6 py-3 rounded-full font-bold text-sm text-white transition"
          style={{ background: 'var(--color-primary)' }}
        >
          {actionLabel}
        </Link>
      )}
      {(actionLabel && onAction) && (
        <button
          onClick={onAction}
          className="inline-block px-6 py-3 rounded-full font-bold text-sm text-white transition"
          style={{ background: 'var(--color-primary)' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
