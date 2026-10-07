'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface StatusData {
  status: string
  count: number
}

interface Props {
  data: StatusData[]
  title?: string
}

const statusColors: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  shipped: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#DC2626',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function OrderStatusChart({ data, title = 'Order Status' }: Props) {
  const filtered = data.filter((d) => d.count > 0)
  const total = filtered.reduce((sum, d) => sum + d.count, 0)

  return (
    <div
      className="p-5 rounded-[var(--radius-lg)] border"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="mb-4">
        <h3 className="font-black text-sm mb-1" style={{ color: 'var(--color-text)' }}>
          {title}
        </h3>
        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {total} order{total !== 1 ? 's' : ''} this period
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="flex items-center gap-4">
          {/* Donut */}
          <div style={{ width: 140, height: 140, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filtered}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={2}
                  stroke="none"
                >
                  {filtered.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={statusColors[entry.status] || '#9CA3AF'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any) => [
                    `${value} orders`,
                    statusLabels[name as string] || name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {filtered.map((entry) => {
              const percent = total > 0 ? (entry.count / total) * 100 : 0
              return (
                <div key={entry.status} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: statusColors[entry.status] }}
                  />
                  <span className="flex-1 font-medium" style={{ color: 'var(--color-text)' }}>
                    {statusLabels[entry.status] || entry.status}
                  </span>
                  <span className="font-bold" style={{ color: 'var(--color-text)' }}>
                    {entry.count}
                  </span>
                  <span className="text-[10px] w-10 text-right" style={{ color: 'var(--color-text-muted)' }}>
                    {percent.toFixed(0)}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="h-[140px] flex items-center justify-center">
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            No orders in this period
          </div>
        </div>
      )}
    </div>
  )
}
