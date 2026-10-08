import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { SortSelect } from '@/components/shop/SortSelect'
import { Package, Search as SearchIcon, SlidersHorizontal, LayoutGrid, List, X, ChevronDown } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    category?: string
    gender?: string
    q?: string
    sort?: string
    min?: string
    max?: string
    available?: string
    discount?: string
    rating?: string
    page?: string
  }>
}

const PAGE_SIZE = 20

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

  if (params.gender) {
    query = query.ilike('description', `%[GENDER: ${params.gender}]%`)
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

  // Active filters for chips
  const activeFilters: { label: string; remove: string }[] = []
  if (params.category) activeFilters.push({ label: `ক্যাটাগরি: ${currentCategory?.name || params.category}`, remove: buildUrl({ category: undefined }) })
  if (params.gender) {
    const genderLabels: Record<string, string> = {
      male: '👨 পুরুষ (Men)',
      female: '👩 মহিলা (Women)',
      unisex: '👫 ইউনিসেক্স (Unisex)',
      kids: '👶 বাচ্চাদের (Kids)',
    }
    activeFilters.push({ label: `জেন্ডার: ${genderLabels[params.gender] || params.gender}`, remove: buildUrl({ gender: undefined }) })
  }
  if (params.q) activeFilters.push({ label: `খোঁজা: "${params.q}"`, remove: buildUrl({ q: undefined }) })
  if (params.min || params.max) activeFilters.push({ label: `দাম: ৳${params.min || '০'} - ৳${params.max || '∞'}`, remove: buildUrl({ min: undefined, max: undefined }) })
  if (params.available) activeFilters.push({ label: 'স্টকে আছে', remove: buildUrl({ available: undefined }) })
  if (params.discount) activeFilters.push({ label: 'ডিসকাউন্ট', remove: buildUrl({ discount: undefined }) })

  const ratingOptions = [
    { label: '৪★ ও উপরে', value: '4' },
    { label: '৩★ ও উপরে', value: '3' },
    { label: '২★ ও উপরে', value: '2' },
  ]
  const discountOptions = [
    { label: '১০%+ ছাড়', value: '10' },
    { label: '২৫%+ ছাড়', value: '25' },
    { label: '৫০%+ ছাড়', value: '50' },
  ]

  const startItem = offset + 1
  const endItem = Math.min(offset + PAGE_SIZE, count || 0)

  return (
    <div style={{ background: 'var(--color-background)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>

        {/* Page header */}
        <div className="py-4 border-b flex items-center gap-2 text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          <Link href="/" className="hover:text-[var(--color-primary)]">হোম</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text)' }}>
            {params.q ? `"${params.q}" খোঁজার ফলাফল` : params.category ? (currentCategory?.name || 'পণ্য') : 'সব পণ্য'}
          </span>
        </div>

        <div className="flex gap-5 py-5">
          {/* ===== LEFT SIDEBAR ===== */}
          <aside
            className="hidden lg:block flex-shrink-0"
            style={{ width: '240px', position: 'sticky', top: '80px', height: 'fit-content' }}
          >
            <div
              className="rounded-[var(--radius-lg)] border overflow-hidden"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              {/* Filter header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div className="flex items-center gap-2 font-black text-sm" style={{ color: 'var(--color-text)' }}>
                  <SlidersHorizontal size={16} style={{ color: 'var(--color-primary)' }} />
                  ফিল্টার
                </div>
                {activeFilters.length > 0 && (
                  <Link
                    href="/products"
                    className="text-[11px] font-bold hover:underline"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    সব ক্লিয়ার
                  </Link>
                )}
              </div>

              {/* Category filter */}
              <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="font-bold text-xs mb-3 uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
                  ক্যাটাগরি
                </h3>
                <div className="space-y-1.5">
                  <Link
                    href={buildUrl({ category: undefined })}
                    className={`flex items-center gap-2 text-xs py-1 px-2 rounded transition-colors ${!params.category ? 'font-bold text-white' : 'hover:bg-[var(--color-surface-hover)]'}`}
                    style={!params.category ? { background: 'var(--color-primary)', color: 'white' } : { color: 'var(--color-text)' }}
                  >
                    সব পণ্য
                  </Link>
                  {categories?.map((cat) => (
                    <Link
                      key={cat.id}
                      href={buildUrl({ category: cat.slug })}
                      className={`flex items-center gap-2 text-xs py-1.5 px-2 rounded transition-colors ${params.category === cat.slug ? 'font-bold' : 'hover:bg-[var(--color-surface-hover)]'}`}
                      style={params.category === cat.slug ? { color: 'var(--color-primary)', background: 'var(--color-primary-light)' } : { color: 'var(--color-text)' }}
                    >
                      <input
                        type="checkbox"
                        checked={params.category === cat.slug}
                        readOnly
                        className="accent-[var(--color-primary)]"
                      />
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Gender filter */}
              <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="font-bold text-xs mb-3 uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
                  জেন্ডার (Gender)
                </h3>
                <div className="space-y-1.5">
                  {[
                    { id: 'male', label: '👨 পুরুষ (Men)' },
                    { id: 'female', label: '👩 মহিলা (Women)' },
                    { id: 'unisex', label: '👫 ইউনিসেক্স (Unisex)' },
                    { id: 'kids', label: '👶 বাচ্চাদের (Kids)' },
                  ].map((g) => (
                    <Link
                      key={g.id}
                      href={buildUrl({ gender: params.gender === g.id ? undefined : g.id })}
                      className={`flex items-center gap-2 text-xs py-1.5 px-2 rounded transition-colors ${params.gender === g.id ? 'font-bold' : 'hover:bg-[var(--color-surface-hover)]'}`}
                      style={params.gender === g.id ? { color: 'var(--color-primary)', background: 'var(--color-primary-light)' } : { color: 'var(--color-text)' }}
                    >
                      <input
                        type="checkbox"
                        checked={params.gender === g.id}
                        readOnly
                        className="accent-[var(--color-primary)]"
                      />
                      {g.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="font-bold text-xs mb-3 uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
                  মূল্য সীমা
                </h3>
                <form action="/products" method="GET" className="space-y-2">
                  {params.category && <input type="hidden" name="category" value={params.category} />}
                  {params.q && <input type="hidden" name="q" value={params.q} />}
                  {params.sort && <input type="hidden" name="sort" value={params.sort} />}
                  {params.available && <input type="hidden" name="available" value={params.available} />}
                  {params.discount && <input type="hidden" name="discount" value={params.discount} />}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>সর্বনিম্ন</label>
                      <input
                        type="number"
                        name="min"
                        placeholder="৳ Min"
                        defaultValue={params.min}
                        className="w-full px-2 py-1.5 text-xs rounded border focus:outline-none focus:border-[var(--color-primary)]"
                        style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>সর্বোচ্চ</label>
                      <input
                        type="number"
                        name="max"
                        placeholder="৳ Max"
                        defaultValue={params.max}
                        className="w-full px-2 py-1.5 text-xs rounded border focus:outline-none focus:border-[var(--color-primary)]"
                        style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 text-xs font-bold rounded text-white transition"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    প্রয়োগ করুন
                  </button>
                </form>
                {/* Quick price chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    { label: 'আন্ডার ৳500', min: undefined, max: '500' },
                    { label: '৳500-২০০০', min: '500', max: '2000' },
                    { label: '৳২০০০+', min: '2000', max: undefined },
                  ].map((r) => (
                    <Link
                      key={r.label}
                      href={buildUrl({ min: r.min, max: r.max })}
                      className="text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                    >
                      {r.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="font-bold text-xs mb-3 uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
                  রেটিং
                </h3>
                <div className="space-y-1.5">
                  {ratingOptions.map((opt) => (
                    <Link
                      key={opt.value}
                      href={buildUrl({ rating: params.rating === opt.value ? undefined : opt.value })}
                      className="flex items-center gap-2 text-xs py-1 px-2 rounded transition-colors hover:bg-[var(--color-surface-hover)]"
                      style={{ color: 'var(--color-text)' }}
                    >
                      <input type="checkbox" checked={params.rating === opt.value} readOnly className="accent-[var(--color-primary)]" />
                      <span className="text-yellow-500">{'★'.repeat(parseInt(opt.value))}{'☆'.repeat(5 - parseInt(opt.value))}</span>
                      <span style={{ color: 'var(--color-text-secondary)' }}>{opt.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <h3 className="font-bold text-xs mb-3 uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
                  পাওয়া যাচ্ছে
                </h3>
                <Link
                  href={buildUrl({ available: params.available === 'in' ? undefined : 'in' })}
                  className="flex items-center gap-2 text-xs py-1 px-2 rounded transition-colors hover:bg-[var(--color-surface-hover)]"
                  style={{ color: 'var(--color-text)' }}
                >
                  <input type="checkbox" checked={params.available === 'in'} readOnly className="accent-[var(--color-primary)]" />
                  শুধু স্টকে আছে
                </Link>
              </div>

              {/* Discount */}
              <div className="p-4">
                <h3 className="font-bold text-xs mb-3 uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
                  ডিসকাউন্ট
                </h3>
                <div className="space-y-1.5">
                  <Link
                    href={buildUrl({ discount: params.discount === 'yes' ? undefined : 'yes' })}
                    className="flex items-center gap-2 text-xs py-1 px-2 rounded transition-colors hover:bg-[var(--color-surface-hover)]"
                    style={{ color: 'var(--color-text)' }}
                  >
                    <input type="checkbox" checked={params.discount === 'yes'} readOnly className="accent-[var(--color-primary)]" />
                    যেকোনো ডিসকাউন্ট
                  </Link>
                  {discountOptions.map((opt) => (
                    <div key={opt.value} className="flex items-center gap-2 text-xs py-1 px-2 rounded" style={{ color: 'var(--color-text-secondary)' }}>
                      <input type="checkbox" readOnly className="accent-[var(--color-primary)]" />
                      {opt.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ===== MAIN CONTENT ===== */}
          <div className="flex-1 min-w-0">
            {/* Top bar: count + sort + active filters */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                {count !== null && count > 0
                  ? `${startItem}–${endItem} / ${count} টি পণ্য দেখাচ্ছে`
                  : `${count || 0} টি পণ্য পাওয়া গেছে`
                }
              </div>

              {/* Mobile filter button */}
              <Link
                href="#"
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-semibold"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                <SlidersHorizontal size={14} /> ফিল্টার
              </Link>

              <div className="ml-auto">
                <SortSelect currentSort={sort} />
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activeFilters.map((f, i) => (
                  <Link
                    key={i}
                    href={f.remove}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition hover:opacity-80"
                    style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                  >
                    {f.label}
                    <X size={12} />
                  </Link>
                ))}
                <Link href="/products" className="text-xs hover:underline" style={{ color: 'var(--color-text-muted)' }}>
                  সব ক্লিয়ার করুন
                </Link>
              </div>
            )}

            {/* Category & Gender chips on mobile */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
              <Link
                href={buildUrl({ category: undefined, gender: undefined })}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${!params.category && !params.gender ? 'bg-[var(--color-primary)] text-white' : 'border'}`}
                style={!params.category && !params.gender ? {} : { borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                সব
              </Link>
              {[
                { id: 'male', label: '👨 পুরুষ' },
                { id: 'female', label: '👩 মহিলা' },
              ].map((g) => (
                <Link
                  key={g.id}
                  href={buildUrl({ gender: params.gender === g.id ? undefined : g.id })}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${params.gender === g.id ? 'bg-[var(--color-primary)] text-white' : 'border'}`}
                  style={params.gender === g.id ? {} : { borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  {g.label}
                </Link>
              ))}
              {categories?.map((cat) => (
                <Link
                  key={cat.id}
                  href={buildUrl({ category: cat.slug })}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${params.category === cat.slug ? 'bg-[var(--color-primary)] text-white' : 'border'}`}
                  style={params.category === cat.slug ? {} : { borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Product grid — 5 per row on desktop */}
            {products && products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 md:gap-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-8">
                    {page > 1 && (
                      <Link
                        href={`${buildUrl({})}${buildUrl({}).includes('?') ? '&' : '?'}page=${page - 1}`}
                        className="px-3 py-2 rounded border text-xs font-medium transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      >
                        ← আগে
                      </Link>
                    )}

                    {/* Page numbers */}
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      const p = i + 1
                      if (totalPages <= 7 || p === page || p <= 2 || p >= totalPages - 1 || Math.abs(p - page) <= 1) {
                        return (
                          <Link
                            key={p}
                            href={`${buildUrl({})}${buildUrl({}).includes('?') ? '&' : '?'}page=${p}`}
                            className="w-8 h-8 flex items-center justify-center rounded text-xs font-semibold transition"
                            style={p === page
                              ? { background: 'var(--color-primary)', color: 'white' }
                              : { borderColor: 'var(--color-border)', color: 'var(--color-text)' }
                            }
                          >
                            {p}
                          </Link>
                        )
                      }
                      if (p === 3 && page > 4) return <span key="ellipsis-start" className="text-xs" style={{ color: 'var(--color-text-muted)' }}>…</span>
                      return null
                    })}

                    {page < totalPages && (
                      <Link
                        href={`${buildUrl({})}${buildUrl({}).includes('?') ? '&' : '?'}page=${page + 1}`}
                        className="px-3 py-2 rounded border text-xs font-medium transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      >
                        পরে →
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={params.q ? SearchIcon : Package}
                title={params.q ? `"${params.q}" এর জন্য কোনো পণ্য পাওয়া যায়নি` : 'কোনো পণ্য পাওয়া যায়নি'}
                description="ভিন্ন কিওয়ার্ড দিয়ে খোঁজুন অথবা ফিল্টার সরিয়ে দেখুন"
                actionLabel="সব পণ্য দেখুন"
                actionHref="/products"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
