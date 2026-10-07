import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import { Hero } from '@/components/shop/Hero'
import { PromoBanners } from '@/components/shop/PromoBanners'
import { TrustStrip } from '@/components/home/TrustStrip'
import { NewsletterCTA } from '@/components/home/NewsletterCTA'
import { CategoryStrip } from '@/components/home/CategoryStrip'
import { FlashDealsSection } from '@/components/home/FlashDealsSection'
import { RecentlyViewed } from '@/components/home/RecentlyViewed'
import { ArrowRight, Flame, Sparkles, Star, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

const categoryEmojis: Record<string, string> = {
  cosmetics: '💄',
  clothing: '👕',
  electronics: '📱',
  general: '🛒',
}

export default async function HomePage() {
  const supabase = await createClient()

  const [
    categoriesRes,
    trendingRes,
    newRes,
    saleRes,
    heroBannerRes,
    promoBannersRes,
    topRatedRes,
  ] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase
      .from('products')
      .select('id, name, slug, price, compare_price, images, stock_quantity')
      .eq('status', 'active')
      .limit(10),
    supabase
      .from('products')
      .select('id, name, slug, price, compare_price, images, stock_quantity')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('products')
      .select('id, name, slug, price, compare_price, images, stock_quantity')
      .eq('status', 'active')
      .not('compare_price', 'is', null)
      .order('compare_price', { ascending: false })
      .limit(10),
    supabase
      .from('banners')
      .select('*')
      .eq('position', 'hero')
      .eq('is_active', true)
      .order('sort_order')
      .limit(1),
    supabase
      .from('banners')
      .select('*')
      .eq('position', 'promo')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('products')
      .select('id, name, slug, price, compare_price, images, stock_quantity')
      .eq('status', 'active')
      .limit(8),
  ])

  const categories = categoriesRes.data || []
  const trending = trendingRes.data || []
  const newArrivals = newRes.data || []
  const flashSale = saleRes.data || []
  const heroBanner = heroBannerRes.data?.[0] || null
  const topRated = topRatedRes.data || []

  const now = new Date()
  const promoBanners = (promoBannersRes.data || []).filter((b: any) => {
    if (b.start_date && new Date(b.start_date) > now) return false
    if (b.end_date && new Date(b.end_date) < now) return false
    return true
  })

  return (
    <div>
      {/* 1. Hero Carousel */}
      <Hero banner={heroBanner} />

      {/* 2. Trust Strip (6-icon) */}
      <TrustStrip />

      {/* 3. Promo Tiles (3 tiles) */}
      <PromoBanners banners={promoBanners} />

      {/* 4. Category Icon Strip */}
      <CategoryStrip categories={categories} />

      {/* 5. Flash Deals Carousel */}
      <FlashDealsSection products={flashSale} />

      {/* 6. Shop by Category (grid) */}
      {categories.length > 0 && (
        <section className="py-6" style={{ background: 'var(--color-background)' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black" style={{ color: 'var(--color-text)' }}>
                ক্যাটাগরি অনুযায়ী কেনাকাটা
              </h2>
              <Link
                href="/products"
                className="flex items-center gap-1 text-xs font-bold hover:underline"
                style={{ color: 'var(--color-primary)' }}
              >
                সব দেখুন <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group block p-5 rounded-[var(--radius-lg)] border text-center transition-all hover:shadow-lg hover:-translate-y-1 hover:border-[var(--color-primary)]"
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                >
                  <div className="text-4xl mb-2">{categoryEmojis[cat.slug] || '🛍️'}</div>
                  <div className="font-bold text-sm group-hover:text-[var(--color-primary)] transition-colors" style={{ color: 'var(--color-text)' }}>
                    {cat.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Trending Products (5-6 per row) */}
      {trending.length > 0 && (
        <section className="py-6" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-lg font-black" style={{ color: 'var(--color-text)' }}>
                  ট্রেন্ডিং পণ্য
                </h2>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  এই সপ্তাহে সবচেয়ে বেশি বিক্রি
                </span>
              </div>
              <Link href="/products" className="flex items-center gap-1 text-xs font-bold hover:underline" style={{ color: 'var(--color-primary)' }}>
                সব দেখুন <ArrowRight size={13} />
              </Link>
            </div>
            {/* 5 per row on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {trending.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-6" style={{ background: 'var(--color-background)', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
                <h2 className="text-lg font-black" style={{ color: 'var(--color-text)' }}>
                  নতুন পণ্য
                </h2>
              </div>
              <Link href="/products?sort=newest" className="flex items-center gap-1 text-xs font-bold hover:underline" style={{ color: 'var(--color-primary)' }}>
                সব দেখুন <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {newArrivals.slice(0, 10).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 9. Customers Also Bought */}
      {topRated.length > 0 && (
        <section className="py-6" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star size={18} style={{ color: '#F59E0B' }} fill="#F59E0B" />
                <h2 className="text-lg font-black" style={{ color: 'var(--color-text)' }}>
                  কাস্টমাররা এটাও কিনেছেন
                </h2>
              </div>
              <Link href="/products" className="flex items-center gap-1 text-xs font-bold hover:underline" style={{ color: 'var(--color-primary)' }}>
                আরও দেখুন <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {topRated.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. Recently Viewed */}
      <RecentlyViewed />

      {/* 11. Newsletter CTA */}
      <NewsletterCTA />
    </div>
  )
}
