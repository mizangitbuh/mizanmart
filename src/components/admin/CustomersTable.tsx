'use client'

import Link from 'next/link'
import { User, Eye, Phone, Mail, TrendingUp, Crown, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'

interface Customer {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role: string
  created_at: string
  total_orders: number
  total_spent: number
  last_order_date: string | null
}

interface Props {
  customers: Customer[]
}

function getSegment(customer: Customer): { label: string; variant: 'success' | 'warning' | 'info' | 'default' } {
  const daysSinceLast = customer.last_order_date
    ? (Date.now() - new Date(customer.last_order_date).getTime()) / (1000 * 60 * 60 * 24)
    : Infinity

  if (customer.total_spent >= 10000) return { label: 'VIP', variant: 'success' }
  if (customer.total_orders >= 3) return { label: 'Returning', variant: 'info' }
  if (customer.total_orders === 0) return { label: 'New', variant: 'warning' }
  if (daysSinceLast > 90) return { label: 'Inactive', variant: 'default' }
  return { label: 'Active', variant: 'default' }
}

export function CustomersTable({ customers }: Props) {
  if (customers.length === 0) {
    return (
      <div
        className="p-12 rounded-[var(--radius-lg)] border text-center"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <User size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
        <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          No customers found
        </div>
        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Customers will appear here once they register
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-[var(--radius-lg)] border overflow-hidden"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--color-background)' }}>
              <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                Customer
              </th>
              <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide hidden md:table-cell" style={{ color: 'var(--color-text-muted)' }}>
                Contact
              </th>
              <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                Orders
              </th>
              <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                Total Spent
              </th>
              <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-wide hidden lg:table-cell" style={{ color: 'var(--color-text-muted)' }}>
                Segment
              </th>
              <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => {
              const segment = getSegment(customer)
              const initial = (customer.full_name || customer.email || 'U').charAt(0).toUpperCase()

              return (
                <tr
                  key={customer.id}
                  className="border-t transition-colors hover:bg-[var(--color-surface-hover)]"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: 'var(--color-primary)' }}
                      >
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--color-text)' }}>
                          {customer.full_name || 'Unnamed Customer'}
                        </div>
                        <div className="text-[10px] flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
                          <Clock size={9} />
                          Joined {new Date(customer.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="space-y-0.5">
                      {customer.email && (
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          <Mail size={11} />
                          <span className="truncate max-w-[200px]">{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          <Phone size={11} />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="font-black text-sm" style={{ color: 'var(--color-text)' }}>
                      {customer.total_orders}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="font-black text-sm" style={{ color: 'var(--color-primary)' }}>
                      {formatPrice(customer.total_spent)}
                    </div>
                    {customer.total_orders > 0 && (
                      <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        AOV {formatPrice(customer.total_spent / customer.total_orders)}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    {segment.label === 'VIP' ? (
                      <Badge variant="success" size="sm">
                        <Crown size={10} className="inline mr-1" />
                        VIP
                      </Badge>
                    ) : (
                      <Badge variant={segment.variant} size="sm">
                        {segment.label}
                      </Badge>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/customers/${customer.id}`}
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
  )
}
