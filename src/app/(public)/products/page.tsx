import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { SortSelect } from '@/components/shop/SortSelect'
import { Package, Search as SearchIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    category?: string
    q?: string
    sort?: string
    min?: string
    max?: string
    available?: string
    discount?: string
    page?: string
  }>
}

const PAGE_SIZE = 12

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  const page = Math.max(1, parseInt(params.page || '1'))
  const offset = (page - 1) * PAGE_SIZE

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('sort_order')

  const currentCategory = params.category
    ? categories?.find((c) => c.slug === params.category)
    : null

  let query = supabase
    .from('products')
    .select('id, name, slug, price, compare_price, images, stock_quantity, category:categories(slug)', { count: 'exact' })
    .eq('status', 'active')

  if (currentCategory) {
    query = query.eq('category_id', currentCategory.id)
  }

  if (params.q) {
    const searchTerm = `%${params.q}%`
    query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},slug.ilike.${searchTerm}`)
  }

  if (params.min) query = query.gte('price', Number(params.min))
  if (params.max) query = query.lte('price', Number(params.max))
  if (params.available === 'in') query = query.gt('stock_quantity', 0)
  if (params.discount === 'yes') query = query.not('compare_price', 'is', null)

  const sort = params.sort || 'newest'
  switch (sort) {
    case 'price-asc':  query = query.order('price', { ascending: true }); break
    case 'price-desc': query = query.order('price', { ascending: false }); break
    case 'name-asc':   query = query.order('name', { ascending: true }); break
    case 'oldest':     query = query.order('created_at', { ascending: true }); break
    default:           query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + PAGE_SIZE - 1)

  const { data: products, count } = await query
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const sp = new URLSearchParams()
    const merged = { ...params, ...updates }
    Object.entries(merged).forEach(([k, v]) => {
      if (v && k !== 'page') sp.set(k, v)
    })
    return `/products${sp.toString() ? '?' + sp.toString() : ''}`
  }

  const activeFilters = []
  if (params.q) activeFilters.push({ label: `Search: "${params.q}"`, remove: buildUrl({ q: undefined }) })
  if (params.category) activeFilters.push({ label: currentCategory?.name || params.category, remove: buildUrl({ category: undefined }) })
  if (params.min || params.max) activeFilters.push({ label: `৳${params.min || 0} - ৳${params.max || '∞'}`, remove: buildUrl({ min: undefined, max: undefined }) })
  if (params.available) activeFilters.push({ label: 'In Stock', remove: buildUrl({ available: undefined }) })
  if (params.discount) activeFilters.push({ label: 'On Sale', remove: buildUrl({ discount: undefined }) })

  return (
    <div className="min-h-screen">
      <div className="border-b" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="container-main py-5">
          <div className="flex items-center gap-2 text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
            <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
            <span>/</span>
            <span style={{ color: 'var(--color-text)' }}>
              {params.q ? `Search: "${params.q}"` : currentCategory?.name || 'All Products'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--color-text)' }}>
            {params.q ? `Search: "${params.q}"` : currentCategory?.name || 'All Products'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {count || 0} products found
          </p>
        </div>
      </div>

      <div className="container-main py-6">
        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          <aside className="hidden lg:block space-y-5">
            <div className="p-4 rounded-[var(--radius-lg)] border bg-[var(--color-surface)]" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text)' }}>Categories</h3>
              <div className="space-y-1">
                <Link
                  href={buildUrl({ category: undefined })}
                  className={`block px-3 py-1.5 rounded text-sm ${!params.category ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold' : 'hover:bg-[var(--color-surface-hover)]'}`}
                  style={!params.category ? {} : { color: 'var(--color-text)' }}
                >
                  All Products
                </Link>
                {categories?.map((cat) => (
                  <Link
                    key={cat.id}
                    href={buildUrl({ category: cat.slug })}
                    className={`block px-3 py-1.5 rounded text-sm ${params.category === cat.slug ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold' : 'hover:bg-[var(--color-surface-hover)]'}`}
                    style={params.category === cat.slug ? {} : { color: 'var(--color-text)' }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-[var(--radius-lg)] border bg-[var(--color-surface)]" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text)' }}>Price Range</h3>
              <form action="/products" method="GET" className="space-y-2">
                {params.category && <input type="hidden" name="category" value={params.category} />}
                {params.q && <input type="hidden" name="q" value={params.q} />}
                {params.sort && <input type="hidden" name="sort" value={params.sort} />}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    name="min"
                    placeholder="Min"
                    defaultValue={params.min}
                    className="w-full px-2 py-1.5 text-xs rounded border focus:outline-none focus:border-[var(--color-primary)]"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  />
                  <input
                    type="number"
                    name="max"
                    placeholder="Max"
                    defaultValue={params.max}
                    className="w-full px-2 py-1.5 text-xs rounded border focus:outline-none focus:border-[var(--color-primary)]"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 text-xs font-bold rounded text-white transition"
                  style={{ background: 'var(--color-primary)' }}
                >
                  Apply
                </button>
              </form>
            </div>

            <div className="p-4 rounded-[var(--radius-lg)] border bg-[var(--color-surface)]" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text)' }}>Availability</h3>
              <Link
                href={buildUrl({ available: params.available === 'in' ? undefined : 'in' })}
                className="flex items-center gap-2 text-sm"
                style={{ color: 'var(--color-text)' }}
              >
                <input type="checkbox" checked={params.available === 'in'} readOnly />
                In Stock only
              </Link>
            </div>

            <div className="p-4 rounded-[var(--radius-lg)] border bg-[var(--color-surface)]" style={{ borderColor: 'var(--color-border)' }}>
              <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text)' }}>Offers</h3>
              <Link
                href={buildUrl({ discount: params.discount === 'yes' ? undefined : 'yes' })}
                className="flex items-center gap-2 text-sm"
                style={{ color: 'var(--color-text)' }}
              >
                <input type="checkbox" checked={params.discount === 'yes'} readOnly />
                On Sale
              </Link>
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex-1 flex flex-wrap gap-2">
                <Link
                  href={buildUrl({ category: undefined })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${!params.category ? 'bg-[var(--color-primary)] text-white' : 'border'}`}
                  style={!params.category ? {} : { borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  All
                </Link>
                {categories?.map((cat) => (
                  <Link
                    key={cat.id}
                    href={buildUrl({ category: cat.slug })}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${params.category === cat.slug ? 'bg-[var(--color-primary)] text-white' : 'border'}`}
                    style={params.category === cat.slug ? {} : { borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              <SortSelect currentSort={sort} />
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Filters:</span>
                {activeFilters.map((f, i) => (
                  <Link
                    key={i}
                    href={f.remove}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition"
                    style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                  >
                    {f.label}
                    <span>×</span>
                  </Link>
                ))}
                <Link
                  href="/products"
                  className="text-xs hover:underline"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Clear all
                </Link>
              </div>
            )}

            {products && products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {page > 1 && (
                      <Link
                        href={`${buildUrl({})}${buildUrl({}).includes('?') ? '&' : '?'}page=${page - 1}`}
                        className="px-4 py-2 rounded-lg border text-sm font-medium transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      >
                        ← Previous
                      </Link>
                    )}
                    <span className="text-sm px-4" style={{ color: 'var(--color-text-muted)' }}>
                      Page {page} of {totalPages}
                    </span>
                    {page < totalPages && (
                      <Link
                        href={`${buildUrl({})}${buildUrl({}).includes('?') ? '&' : '?'}page=${page + 1}`}
                        className="px-4 py-2 rounded-lg border text-sm font-medium transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      >
                        Next →
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={params.q ? SearchIcon : Package}
                title={params.q ? `No results for "${params.q}"` : 'No products found'}
                description="Try a different search term or clear filters"
                actionLabel="View All Products"
                actionHref="/products"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
