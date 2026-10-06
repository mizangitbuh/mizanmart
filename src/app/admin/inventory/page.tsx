import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { InventoryTable } from '@/components/admin/InventoryTable'
import { KpiCard } from '@/components/admin/KpiCard'
import { formatPrice } from '@/lib/utils'
import { Package, DollarSign, AlertTriangle, XCircle, Search, X } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    q?: string
    stock?: string
  }>
}

export default async function InventoryPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch all products (no pagination for inventory overview)
  let query = supabase
    .from('products')
    .select('id, name, slug, price, stock_quantity, sku, status, images, updated_at, category:categories(name)')

  if (params.q) {
    const term = `%${params.q}%`
    query = query.or(`name.ilike.${term},sku.ilike.${term}`)
  }

  if (params.stock === 'in') {
    query = query.gt('stock_quantity', 5)
  } else if (params.stock === 'low') {
    query = query.gt('stock_quantity', 0).lte('stock_quantity', 5)
  } else if (params.stock === 'out') {
    query = query.lte('stock_quantity', 0)
  }

  query = query.order('stock_quantity', { ascending: true })

  const { data: products } = await query
  const allProducts = products || []

  // Fetch all products for stats (unfiltered)
  const { data: allForStats } = await supabase
    .from('products')
    .select('stock_quantity, price')

  const stats = allForStats || []

  // Calculate KPIs
  const totalUnits = stats.reduce((sum, p) => sum + (p.stock_quantity || 0), 0)
  const inventoryValue = stats.reduce(
    (sum, p) => sum + (p.stock_quantity || 0) * Number(p.price || 0),
    0
  )
  const lowStockCount = stats.filter((p) => p.stock_quantity > 0 && p.stock_quantity <= 5).length
  const outOfStockCount = stats.filter((p) => p.stock_quantity <= 0).length

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const sp = new URLSearchParams()
    const merged = { ...params, ...updates }
    Object.entries(merged).forEach(([k, v]) => {
      if (v) sp.set(k, v)
    })
    return `/admin/inventory${sp.toString() ? '?' + sp.toString() : ''}`
  }

  const stockFilters = [
    { value: '', label: 'All Products' },
    { value: 'in', label: 'In Stock' },
    { value: 'low', label: 'Low Stock (≤5)' },
    { value: 'out', label: 'Out of Stock' },
  ]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black mb-1" style={{ color: 'var(--color-text)' }}>
            Inventory
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Manage stock levels across all products
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Units"
          value={totalUnits.toLocaleString()}
          icon={Package}
          color="#3B82F6"
          subtitle="Across all products"
        />
        <KpiCard
          label="Inventory Value"
          value={formatPrice(inventoryValue)}
          icon={DollarSign}
          color="#10B981"
          subtitle="Total stock worth"
        />
        <Link href={buildUrl({ stock: 'low' })} className="block">
          <KpiCard
            label="Low Stock"
            value={lowStockCount}
            icon={AlertTriangle}
            color="#F59E0B"
            subtitle="Need restocking soon"
          />
        </Link>
        <Link href={buildUrl({ stock: 'out' })} className="block">
          <KpiCard
            label="Out of Stock"
            value={outOfStockCount}
            icon={XCircle}
            color="#DC2626"
            subtitle="Unavailable for sale"
          />
        </Link>
      </div>

      {/* Alert Banner */}
      {lowStockCount > 0 && (
        <div
          className="p-4 rounded-[var(--radius-lg)] border flex items-start gap-3"
          style={{
            background: 'var(--color-warning-bg)',
            borderColor: 'var(--color-warning)',
          }}
        >
          <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-sm" style={{ color: 'var(--color-warning)' }}>
              {lowStockCount} product{lowStockCount > 1 ? 's' : ''} need restocking
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-warning)' }}>
              Review stock levels and place new orders to avoid running out.
            </div>
          </div>
          <Link
            href={buildUrl({ stock: 'low' })}
            className="text-xs font-bold hover:underline flex-shrink-0"
            style={{ color: 'var(--color-warning)' }}
          >
            View →
          </Link>
        </div>
      )}

      {/* Filters */}
      <div
        className="p-4 rounded-[var(--radius-lg)] border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search — client component style with form */}
          <form action="/admin/inventory" method="GET" className="relative flex-1 min-w-[240px]">
            {params.stock && <input type="hidden" name="stock" value={params.stock} />}
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              name="q"
              defaultValue={params.q || ''}
              placeholder="Search by name or SKU..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)]"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-background)',
                color: 'var(--color-text)',
              }}
            />
          </form>

          {/* Stock Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {stockFilters.map((filter) => {
              const isActive = (params.stock || '') === filter.value
              return (
                <Link
                  key={filter.value}
                  href={buildUrl({ stock: filter.value || undefined })}
                  className="px-3 py-2 text-xs font-bold rounded-[var(--radius-md)] transition-colors whitespace-nowrap"
                  style={{
                    background: isActive ? 'var(--color-primary)' : 'var(--color-background)',
                    color: isActive ? 'white' : 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {filter.label}
                </Link>
              )
            })}
          </div>

          {params.q && (
            <Link
              href={buildUrl({ q: undefined })}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-[var(--radius-md)] transition-colors"
              style={{
                background: 'var(--color-error-bg)',
                color: 'var(--color-error)',
              }}
            >
              <X size={12} />
              Clear
            </Link>
          )}
        </div>
      </div>

      {/* Results Counter */}
      <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Showing {allProducts.length} of {stats.length} product{stats.length !== 1 ? 's' : ''}
      </div>

      {/* Table */}
      <InventoryTable products={allProducts} />
    </div>
  )
}
