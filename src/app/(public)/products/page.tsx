import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import { Filter, SlidersHorizontal } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  let query = supabase
    .from('products')
    .select('id, name, slug, price, compare_price, images, category:categories(slug)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (params.category) {
    const cat = categories?.find((c) => c.slug === params.category)
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (params.q) {
    query = query.ilike('name', `%${params.q}%`)
  }

  const { data: products } = await query

  const currentCategory = params.category
    ? categories?.find((c) => c.slug === params.category)?.name
    : 'All Products'

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
        <div className="container-main py-6">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-2">
            <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
            <span>/</span>
            <span className="text-[var(--color-text)] font-medium">{currentCategory}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text)]">
            {params.q ? `Search: "${params.q}"` : currentCategory}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {products?.length || 0} products found
          </p>
        </div>
      </div>

      <div className="container-main py-6">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <SlidersHorizontal size={16} className="text-[var(--color-text-muted)] flex-shrink-0" />
          <Link
            href="/products"
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              !params.category
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
            }`}
          >
            All
          </Link>
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                params.category === cat.slug
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Products Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Filter size={48} className="mx-auto text-[var(--color-text-light)] mb-4" />
            <p className="text-lg font-semibold text-[var(--color-text)] mb-2">No products found</p>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              Try a different category or search term
            </p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white rounded-full font-semibold text-sm hover:bg-[var(--color-primary-hover)] transition"
            >
              View All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
