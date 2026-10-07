'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatPrice } from '@/lib/utils'

interface DataPoint {
  date: string
  revenue: number
  orders: number
}

interface Props {
  data: DataPoint[]
  title?: string
}

export function RevenueChart({ data, title = 'Revenue Overview' }: Props) {
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0)

  return (
    <div
      className="p-5 rounded-[var(--radius-lg)] border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-black text-sm mb-1" style={{ color: 'var(--color-text)' }}>
            {title}
          </h3>
          <div className="flex items-baseline gap-3">
            <span className="text-xl font-black" style={{ color: 'var(--color-primary)' }}>
              {formatPrice(totalRevenue)}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {totalOrders} order{totalOrders !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 260 }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D92D3F" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#D92D3F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `৳${(v / 1000).toFixed(0)}k` : `৳${v}`}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [formatPrice(Number(value) || 0), 'Revenue']}
                labelStyle={{ color: 'var(--color-text)', fontWeight: 700 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#D92D3F"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={{ fill: '#D92D3F', r: 3 }}
                activeDot={{ r: 5, fill: '#D92D3F' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                No revenue data in this period
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
