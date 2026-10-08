import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductFilters } from '@/components/admin/ProductFilters'
import { ProductsTable } from '@/components/admin/ProductsTable'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

interface Props {
  searchParams: Promise<{
    q?: string
    category?: string
    status?: string
    stock?: string
    page?: string
  }>
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  const page = Math.max(1, parseInt(params.page || '1'))
  const offset = (page - 1) * PAGE_SIZE

  // Fetch categories for filters
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  // Build query
  let query = supabase
    .from('products')
    .select('id, name, slug, price, compare_price, stock_quantity, sku, status, featured, images, created_at, updated_at, category:categories(name)', { count: 'exact' })

  // Search (name + SKU)
  if (params.q) {
    const term = `%${params.q}%`
    query = query.or(`name.ilike.${term},sku.ilike.${term},slug.ilike.${term}`)
  }

  // Category filter
  if (params.category) {
    query = query.eq('category_id', params.category)
  }

  // Status filter
  if (params.status) {
    query = query.eq('status', params.status)
  }

  // Stock filter
  if (params.stock === 'in') {
    query = query.gt('stock_quantity', 0)
  } else if (params.stock === 'low') {
    query = query.gt('stock_quantity', 0).lte('stock_quantity', 5)
  } else if (params.stock === 'out') {
    query = query.lte('stock_quantity', 0)
  }

  // Sort + Pagination
  query = query.order('created_at', { ascending: false }).range(offset, offset + PAGE_SIZE - 1)

  const { data: products, count } = await query
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  const buildPageUrl = (newPage: number) => {
    const sp = new URLSearchParams()
    if (params.q) sp.set('q', params.q)
    if (params.category) sp.set('category', params.category)
    if (params.status) sp.set('status', params.status)
    if (params.stock) sp.set('stock', params.stock)
    sp.set('page', String(newPage))
    return `/admin/products?${sp.toString()}`
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black mb-1" style={{ color: 'var(--color-text)' }}>
            Products
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {count || 0} product{(count || 0) !== 1 ? 's' : ''} {params.q || params.category || params.status || params.stock ? '(filtered)' : ''}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] font-bold text-sm text-white transition hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <ProductFilters categories={categories || []} />

      {/* Table */}
      <ProductsTable products={products || []} categories={categories || []} />

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
