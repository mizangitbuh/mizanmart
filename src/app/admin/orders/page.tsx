import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { OrderFilters } from '@/components/admin/OrderFilters'
import { OrdersTable } from '@/components/admin/OrdersTable'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

interface Props {
  searchParams: Promise<{
    q?: string
    status?: string
    payment?: string
    range?: string
    page?: string
  }>
}

function getDateRange(range: string): Date | null {
  const now = new Date()
  const d = new Date(now)
  switch (range) {
    case 'today':
      d.setHours(0, 0, 0, 0)
      return d
    case '7d':
      d.setDate(d.getDate() - 7)
      return d
    case '30d':
      d.setDate(d.getDate() - 30)
      return d
    case '90d':
      d.setDate(d.getDate() - 90)
      return d
    default:
      return null
  }
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  const page = Math.max(1, parseInt(params.page || '1'))
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase
    .from('orders')
    .select('id, order_number, customer_name, customer_phone, total, status, payment_method, payment_status, created_at, order_items(id, product_name, quantity, subtotal)', { count: 'exact' })

  // Search
  if (params.q) {
    const term = `%${params.q}%`
    query = query.or(`order_number.ilike.${term},customer_name.ilike.${term},customer_phone.ilike.${term}`)
  }

  // Status filter
  if (params.status) {
    query = query.eq('status', params.status)
  }

  // Payment status filter
  if (params.payment) {
    query = query.eq('payment_status', params.payment)
  }

  // Date range filter
  const dateFrom = params.range ? getDateRange(params.range) : null
  if (dateFrom) {
    query = query.gte('created_at', dateFrom.toISOString())
  }

  // Sort + Pagination
  query = query.order('created_at', { ascending: false }).range(offset, offset + PAGE_SIZE - 1)

  const { data: orders, count } = await query
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  const buildPageUrl = (newPage: number) => {
    const sp = new URLSearchParams()
    if (params.q) sp.set('q', params.q)
    if (params.status) sp.set('status', params.status)
    if (params.payment) sp.set('payment', params.payment)
    if (params.range) sp.set('range', params.range)
    sp.set('page', String(newPage))
    return `/admin/orders?${sp.toString()}`
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black mb-1" style={{ color: 'var(--color-text)' }}>
            Orders
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {count || 0} order{(count || 0) !== 1 ? 's' : ''}
            {(params.q || params.status || params.payment || params.range) && ' (filtered)'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <OrderFilters />

      {/* Table */}
      <OrdersTable orders={orders || []} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {page > 1 && (
            <Link
              href={buildPageUrl(page - 1)}
              className="px-4 py-2 rounded-[var(--radius-md)] border text-sm font-semibold transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              ← Previous
            </Link>
          )}
          <span className="text-sm px-4 font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildPageUrl(page + 1)}
              className="px-4 py-2 rounded-[var(--radius-md)] border text-sm font-semibold transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
