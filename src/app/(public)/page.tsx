import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import { Hero } from '@/components/shop/Hero'
import { PromoBanners } from '@/components/shop/PromoBanners'
import { TrustStrip } from '@/components/home/TrustStrip'
import { WhyMizanMart } from '@/components/home/WhyMizanMart'
import { NewsletterCTA } from '@/components/home/NewsletterCTA'
import { ArrowRight, Flame, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

const categoryEmojis: Record<string, string> = {
  cosmetics: '💄',
  clothing: '👕',
  electronics: '📱',
  general: '🛒',
}

export default async function HomePage() {
  const supabase = await createClient()

  const [categoriesRes, trendingRes, newRes, saleRes, heroBannerRes, promoBannersRes] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('products').select('id, name, slug, price, compare_price, images, stock_quantity').eq('status', 'active').limit(8),
    supabase.from('products').select('id, name, slug, price, compare_price, images, stock_quantity').eq('status', 'active').order('created_at', { ascending: false }).limit(4),
    supabase.from('products').select('id, name, slug, price, compare_price, images, stock_quantity').eq('status', 'active').not('compare_price', 'is', null).order('compare_price', { ascending: false }).limit(4),
    supabase.from('banners').select('*').eq('position', 'hero').eq('is_active', true).order('sort_order').limit(1),
    supabase.from('banners').select('*').eq('position', 'promo').eq('is_active', true).order('sort_order'),
  ])

  const categories = categoriesRes.data || []
  const trending = trendingRes.data || []
  const newArrivals = newRes.data || []
  const flashSale = saleRes.data || []
  const heroBanner = heroBannerRes.data?.[0] || null

  const now = new Date()
  const promoBanners = (promoBannersRes.data || []).filter((b: any) => {
    if (b.start_date && new Date(b.start_date) > now) return false
    if (b.end_date && new Date(b.end_date) < now) return false
    return true
  })

  return (
    <div>
      <Hero banner={heroBanner} />

      <TrustStrip />

      <PromoBanners banners={promoBanners} />

      <section className="section-pad">
        <div className="container-main">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--color-text)' }}>Shop by Category</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Explore our wide range of products</p>
            </div>
            <Link href="/products" className="text-sm font-semibold hover:underline flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}
                className="group block p-6 rounded-[var(--radius-lg)] border text-center transition-all hover:shadow-lg hover:-translate-y-1"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="text-5xl mb-3">{categoryEmojis[cat.slug] || '🛍️'}</div>
                <div className="font-bold group-hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--color-text)' }}>
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {flashSale.length > 0 && (
        <section className="section-pad" style={{ background: 'var(--color-surface)' }}>
          <div className="container-main">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={20} style={{ color: 'var(--color-primary)' }} />
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>Limited Time</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--color-text)' }}>Flash Sale</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>সেরা ডিসকাউন্ট — হাতছাড়া করবেন না!</p>
              </div>
              <Link href="/products?discount=yes" className="text-sm font-semibold hover:underline flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                Shop All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {flashSale.map((product) => (<ProductCard key={product.id} product={product} />))}
            </div>
          </div>
        </section>
      )}

      <section className="section-pad">
        <div className="container-main">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={20} style={{ color: 'var(--color-primary)' }} />
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>Popular</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--color-text)' }}>Trending Products</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Most popular this week</p>
            </div>
            <Link href="/products" className="text-sm font-semibold hover:underline flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {trending.map((product) => (<ProductCard key={product.id} product={product} />))}
          </div>
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="section-pad" style={{ background: 'var(--color-surface)' }}>
          <div className="container-main">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black" style={{ color: 'var(--color-text)' }}>New Arrivals</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>সদ্য যোগ হওয়া পণ্য</p>
              </div>
              <Link href="/products?sort=newest" className="text-sm font-semibold hover:underline flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {newArrivals.map((product) => (<ProductCard key={product.id} product={product} />))}
            </div>
          </div>
        </section>
      )}

      <WhyMizanMart />
      <NewsletterCTA />
    </div>
  )
}
