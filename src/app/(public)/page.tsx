import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import { Hero } from '@/components/shop/Hero'
import { ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  const { data: featured } = await supabase
    .from('products')
    .select('id, name, slug, price, compare_price, images')
    .eq('status', 'active')
    .limit(8)

  const categoryEmojis: Record<string, string> = {
    cosmetics: '💄',
    clothing: '👕',
    electronics: '📱',
    general: '🛒',
  }

  return (
    <div>
      <Hero />

      <section className="section-pad">
        <div className="container-main">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-[var(--color-text)]">
                Shop by Category
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Explore our wide range of products
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="category-card block bg-[var(--color-surface)] border border-[var(--color-border)] p-6 text-center"
              >
                <div className="text-5xl mb-3">
                  {categoryEmojis[cat.slug] || '🛍️'}
                </div>
                <div className="font-bold text-[var(--color-text)]">
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-[var(--color-surface)]">
        <div className="container-main">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-[var(--color-text)]">
                Trending Products
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Most popular this week
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {featured?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-main">
          <div
            className="rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #C62828 0%, #8E0000 100%)' }}
          >
            <div className="relative z-10">
              <span className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3 bg-white/20">
                Limited Time Offer
              </span>
              <h3 className="text-3xl md:text-5xl font-black mb-3">
                Up to 50% OFF
              </h3>
              <p className="text-base md:text-lg opacity-90 mb-6">
                On selected items across all categories
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[var(--color-primary)] rounded-full font-bold text-sm hover:bg-yellow-300 transition-all"
              >
                Shop Now <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
