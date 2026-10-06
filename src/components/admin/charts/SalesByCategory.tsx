'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { formatPrice } from '@/lib/utils'
import { Tag } from 'lucide-react'

interface CategoryData {
  category: string
  revenue: number
  units: number
}

interface Props {
  data: CategoryData[]
  title?: string
}

const COLORS = ['#D92D3F', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899']

export function SalesByCategory({ data, title = 'Sales by Category' }: Props) {
  return (
    <div
      className="p-5 rounded-[var(--radius-lg)] border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Tag size={16} style={{ color: 'var(--color-primary)' }} />
        <h3 className="font-black text-sm" style={{ color: 'var(--color-text)' }}>
          {title}
        </h3>
      </div>

      {data.length > 0 ? (
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [formatPrice(value), 'Revenue']}
                cursor={{ fill: 'var(--color-surface-hover)' }}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-[220px] flex items-center justify-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          No category sales yet
        </div>
      )}
    </div>
  )
}
