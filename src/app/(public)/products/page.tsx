import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {params.category
          ? categories?.find((c) => c.slug === params.category)?.name || 'Products'
          : 'All Products'}
      </h1>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/products"
          className={`px-4 py-2 rounded-full text-sm border transition ${
            !params.category
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-500'
          }`}
        >
          All
        </Link>
        {categories?.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm border transition ${
              params.category === cat.slug
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-500'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl mb-2">No products found</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            View all products
          </Link>
        </div>
      )}
    </div>
  )
}
