import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'

interface Props {
  categoryId: string | null
  currentProductId: string
  limit?: number
}

export async function RelatedProducts({ categoryId, currentProductId, limit = 4 }: Props) {
  if (!categoryId) return null

  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, price, compare_price, images, stock_quantity')
    .eq('status', 'active')
    .eq('category_id', categoryId)
    .neq('id', currentProductId)
    .limit(limit)

  if (!products || products.length === 0) return null

  return (
    <section className="mt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Package size={20} style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-xl md:text-2xl font-black" style={{ color: 'var(--color-text)' }}>
            You May Also Like
          </h2>
        </div>
        <Link
          href={`/products?category=${products[0].id}`}
          className="text-sm font-semibold hover:underline flex items-center gap-1"
          style={{ color: 'var(--color-primary)' }}
        >
          View More <ArrowRight size={14} />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
