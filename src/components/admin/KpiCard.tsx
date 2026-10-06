import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props {
  label: string
  value: string | number
  icon: LucideIcon
  color?: string
  trend?: number // percentage change vs previous period
  trendLabel?: string
  subtitle?: string
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  color = 'var(--color-primary)',
  trend,
  trendLabel,
  subtitle,
}: Props) {
  const hasTrend = trend !== undefined && trend !== null && !isNaN(trend)
  const isUp = hasTrend && trend > 0
  const isDown = hasTrend && trend < 0
  const isFlat = hasTrend && trend === 0

  return (
    <div
      className="p-5 rounded-[var(--radius-lg)] border transition-shadow hover:shadow-md"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      {/* Icon + Label */}
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0"
          style={{ background: color + '15' }}
        >
          <Icon size={20} style={{ color }} />
        </div>

        {hasTrend && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
            style={{
              background: isUp
                ? 'var(--color-success-bg)'
                : isDown
                ? 'var(--color-error-bg)'
                : 'var(--color-surface-hover)',
              color: isUp
                ? 'var(--color-success)'
                : isDown
                ? 'var(--color-error)'
                : 'var(--color-text-muted)',
            }}
          >
            {isUp && <TrendingUp size={11} />}
            {isDown && <TrendingDown size={11} />}
            {isFlat && <Minus size={11} />}
            {isUp && '+'}
            {trend.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Value */}
      <div className="text-2xl font-black leading-tight mb-1" style={{ color: 'var(--color-text)' }}>
        {value}
      </div>

      {/* Label */}
      <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </div>

      {/* Trend label */}
      {hasTrend && trendLabel && (
        <div className="text-[10px] mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
          {trendLabel}
        </div>
      )}

      {subtitle && (
        <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {subtitle}
        </div>
      )}
    </div>
  )
}
