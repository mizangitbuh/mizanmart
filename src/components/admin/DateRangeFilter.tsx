'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'

const ranges = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'year', label: 'This Year' },
]

interface Props {
  currentRange: string
}

export function DateRangeFilter({ currentRange }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (range: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('range', range)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-[var(--radius-md)] border"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="pl-3 pr-1" style={{ color: 'var(--color-text-muted)' }}>
        <Calendar size={14} />
      </div>
      {ranges.map((range) => {
        const active = currentRange === range.value
        return (
          <button
            key={range.value}
            onClick={() => handleChange(range.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-[var(--radius-sm)] transition-colors whitespace-nowrap"
            style={{
              background: active ? 'var(--color-primary)' : 'transparent',
              color: active ? 'white' : 'var(--color-text-muted)',
            }}
          >
            {range.label}
          </button>
        )
      })}
    </div>
  )
}
