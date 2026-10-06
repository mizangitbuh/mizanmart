'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, CheckSquare, Square, Package, Loader2, Printer } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  subtotal: number
}

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  total: number
  status: string
  payment_method: string
  payment_status: string
  created_at: string
  order_items: OrderItem[]
}

interface Props {
  orders: Order[]
}

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  confirmed: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
}

const statusEmoji: Record<string, string> = {
  pending: '⏳',
  confirmed: '✅',
  shipped: '🚚',
  delivered: '📦',
  cancelled: '❌',
}

export function OrdersTable({ orders }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)

  const allSelected = orders.length > 0 && selected.size === orders.length
  const someSelected = selected.size > 0 && !allSelected

  const toggleAll = () => {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(orders.map((o) => o.id)))
  }

  const toggleOne = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const clearSelection = () => setSelected(new Set())

  const runBulkStatusUpdate = async (newStatus: string) => {
    if (selected.size === 0) return
    if (!confirm(`Update ${selected.size} order(s) to "${newStatus}"?`)) return

    setBusy(true)
    try {
      const res = await fetch('/api/admin/orders/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: Array.from(selected),
          status: newStatus,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')

      clearSelection()
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  if (orders.length === 0) {
    return (
      <div
        className="p-12 rounded-[var(--radius-lg)] border text-center"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <Package size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
        <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          No orders found
        </div>
        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Try changing filters or wait for new orders
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div
          className="flex flex-wrap items-center gap-2 p-3 rounded-[var(--radius-lg)] border"
          style={{ background: 'var(--color-primary-light)', borderColor: 'var(--color-primary)' }}
        >
          <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
            <CheckSquare size={16} />
            {selected.size} selected
          </div>

          <div className="h-5 w-px mx-1" style={{ background: 'var(--color-primary)', opacity: 0.3 }} />

          <Button size="sm" variant="outline" onClick={() => runBulkStatusUpdate('confirmed')} disabled={busy}>
            ✅ Confirmed
          </Button>
          <Button size="sm" variant="outline" onClick={() => runBulkStatusUpdate('shipped')} disabled={busy}>
            🚚 Shipped
          </Button>
          <Button size="sm" variant="outline" onClick={() => runBulkStatusUpdate('delivered')} disabled={busy}>
            📦 Delivered
          </Button>

          {busy && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-primary)' }} />}

          <button
            onClick={clearSelection}
            className="ml-auto text-xs font-semibold hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-[var(--radius-lg)] border overflow-hidden"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-background)' }}>
                <th className="w-12 px-4 py-3">
                  <button
                    onClick={toggleAll}
                    className="flex items-center justify-center"
                    aria-label="Select all"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {allSelected ? <CheckSquare size={16} /> :
                     someSelected ? (
                       <div className="w-4 h-4 rounded border-2 flex items-center justify-center" style={{ borderColor: 'var(--color-primary)' }}>
                         <div className="w-2 h-0.5" style={{ background: 'var(--color-primary)' }} />
                       </div>
                     ) : <Square size={16} />}
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Order
                </th>
                <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Customer
                </th>
                <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide hidden lg:table-cell" style={{ color: 'var(--color-text-muted)' }}>
                  Items
                </th>
                <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Total
                </th>
                <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-wide hidden md:table-cell" style={{ color: 'var(--color-text-muted)' }}>
                  Payment
                </th>
                <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Status
                </th>
                <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isSelected = selected.has(order.id)
                const itemCount = order.order_items?.reduce((s, i) => s + i.quantity, 0) || 0

                return (
                  <tr
                    key={order.id}
                    className="border-t transition-colors"
                    style={{
                      borderColor: 'var(--color-border)',
                      background: isSelected ? 'var(--color-primary-light)' : 'transparent',
                    }}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleOne(order.id)}
                        style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                        aria-label={isSelected ? 'Deselect' : 'Select'}
                      >
                        {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-xs" style={{ color: 'var(--color-text)' }}>
                        {order.order_number}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {new Date(order.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {order.customer_name}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        {order.customer_phone}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </div>
                      <div className="text-[10px] truncate max-w-[180px]" style={{ color: 'var(--color-text-muted)' }}>
                        {order.order_items?.[0]?.product_name}
                        {order.order_items && order.order_items.length > 1 && ` +${order.order_items.length - 1}`}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-black" style={{ color: 'var(--color-primary)' }}>
                        {formatPrice(Number(order.total))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
                        {order.payment_method}
                      </div>
                      <Badge
                        variant={order.payment_status === 'paid' ? 'success' : order.payment_status === 'pending' ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {order.payment_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={statusVariants[order.status] || 'default'} size="sm">
                        {statusEmoji[order.status]} {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold hover:underline"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        <Eye size={12} />
                        View
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
