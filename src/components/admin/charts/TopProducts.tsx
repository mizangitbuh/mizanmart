'use client'

import { formatPrice } from '@/lib/utils'
import { Trophy } from 'lucide-react'

interface Product {
  product_id: string
  name: string
  quantity: number
  revenue: number
}

interface Props {
  data: Product[]
  title?: string
}

export function TopProducts({ data, title = 'Top Products' }: Props) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)

  return (
    <div
      className="p-5 rounded-[var(--radius-lg)] border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={16} style={{ color: 'var(--color-primary)' }} />
        <h3 className="font-black text-sm" style={{ color: 'var(--color-text)' }}>
          {title}
        </h3>
      </div>

      {data.length > 0 ? (
        <div className="space-y-3">
          {data.slice(0, 5).map((item, idx) => {
            const percent = (item.revenue / maxRevenue) * 100
            return (
              <div key={item.product_id}>
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black flex-shrink-0"
                    style={{
                      background: idx === 0 ? 'var(--color-primary)' : 'var(--color-surface-hover)',
                      color: idx === 0 ? 'white' : 'var(--color-text-muted)',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate" style={{ color: 'var(--color-text)' }}>
                      {item.name}
                    </div>
                    <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {item.quantity} sold
                    </div>
                  </div>
                  <div className="text-xs font-black flex-shrink-0" style={{ color: 'var(--color-primary)' }}>
                    {formatPrice(item.revenue)}
                  </div>
                </div>
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: 'var(--color-surface-hover)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percent}%`,
                      background: idx === 0 ? 'var(--color-primary)' : 'var(--color-primary-hover)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          No sales data yet
        </div>
      )}
    </div>
  )
}
