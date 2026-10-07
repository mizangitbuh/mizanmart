'use client'

import { formatPrice } from '@/lib/utils'
import { TrendingUp, TrendingDown, Trophy, User, Package } from 'lucide-react'

interface Row {
  id: string
  name: string
  subtitle?: string
  value: number
  secondaryValue?: number
  secondaryLabel?: string
  trend?: number
}

interface Props {
  title: string
  icon?: 'product' | 'customer' | 'trend'
  rows: Row[]
  primaryLabel: string
  isCurrency?: boolean
  emptyMessage?: string
}

export function AnalyticsTable({
  title,
  icon = 'trend',
  rows,
  primaryLabel,
  isCurrency = true,
  emptyMessage = 'No data yet',
}: Props) {
  const maxValue = Math.max(...rows.map((r) => r.value), 1)

  const IconComponent = icon === 'product' ? Package : icon === 'customer' ? User : Trophy

  return (
    <div
      className="rounded-[var(--radius-lg)] border overflow-hidden"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <IconComponent size={16} style={{ color: 'var(--color-primary)' }} />
        <h3 className="font-black text-sm" style={{ color: 'var(--color-text)' }}>
          {title}
        </h3>
      </div>

      {/* Rows */}
      {rows.length > 0 ? (
        <div className="p-3 space-y-1">
          {rows.map((row, idx) => {
            const percent = (row.value / maxValue) * 100
            const isTop3 = idx < 3

            return (
              <div
                key={row.id}
                className="p-3 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  {/* Rank badge */}
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-black flex-shrink-0"
                    style={{
                      background: isTop3 ? 'var(--color-primary)' : 'var(--color-surface-hover)',
                      color: isTop3 ? 'white' : 'var(--color-text-muted)',
                    }}
                  >
                    {idx + 1}
                  </div>

                  {/* Name + subtitle */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate" style={{ color: 'var(--color-text)' }}>
                      {row.name}
                    </div>
                    {row.subtitle && (
                      <div className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {row.subtitle}
                      </div>
                    )}
                  </div>

                  {/* Trend indicator */}
                  {row.trend !== undefined && (
                    <div
                      className="flex items-center gap-1 text-[10px] font-bold flex-shrink-0"
                      style={{
                        color: row.trend > 0 ? 'var(--color-success)' : row.trend < 0 ? 'var(--color-error)' : 'var(--color-text-muted)',
                      }}
                    >
                      {row.trend > 0 && <TrendingUp size={10} />}
                      {row.trend < 0 && <TrendingDown size={10} />}
                      {row.trend > 0 && '+'}
                      {row.trend.toFixed(0)}%
                    </div>
                  )}

                  {/* Value */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-black" style={{ color: 'var(--color-primary)' }}>
                      {isCurrency ? formatPrice(row.value) : row.value.toLocaleString()}
                    </div>
                    {row.secondaryValue !== undefined && row.secondaryLabel && (
                      <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {row.secondaryValue.toLocaleString()} {row.secondaryLabel}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: 'var(--color-surface-hover)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      background: isTop3 ? 'var(--color-primary)' : 'var(--color-primary-hover)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-12 text-center">
          <IconComponent size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {emptyMessage}
          </div>
        </div>
      )}
    </div>
  )
}
