'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface DataPoint {
  date: string
  orders: number
  cancelled: number
}

interface Props {
  data: DataPoint[]
  title?: string
}

export function OrdersTrendChart({ data, title = 'Orders Trend' }: Props) {
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0)
  const totalCancelled = data.reduce((sum, d) => sum + d.cancelled, 0)

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
            <span className="text-xl font-black" style={{ color: 'var(--color-text)' }}>
              {totalOrders}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              orders
            </span>
            {totalCancelled > 0 && (
              <span className="text-xs" style={{ color: 'var(--color-error)' }}>
                • {totalCancelled} cancelled
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 260 }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
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
                allowDecimals={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'var(--color-text)', fontWeight: 700 }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px' }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#3B82F6"
                strokeWidth={2.5}
                dot={{ fill: '#3B82F6', r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="cancelled"
                name="Cancelled"
                stroke="#DC2626"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ fill: '#DC2626', r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No order data in this period
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
