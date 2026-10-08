import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { ProductGallery } from '@/components/shop/ProductGallery'
import { ProductDetailTabs } from '@/components/shop/ProductDetailTabs'
import { RelatedProducts } from '@/components/shop/RelatedProducts'
import { BuyBox } from '@/components/shop/BuyBox'
import { ProductViewTracker } from '@/components/shop/ProductViewTracker'
import { StarRating } from '@/components/shop/StarRating'
import { FrequentlyBoughtTogether } from '@/components/shop/FrequentlyBoughtTogether'
import { DeliveryEstimator } from '@/components/shop/DeliveryEstimator'
import { VariantSelector } from '@/components/shop/VariantSelector'
import { ProductQA } from '@/components/shop/ProductQA'
import { FactoryDirectTrust } from '@/components/shop/FactoryDirectTrust'
import { WholesaleInquiry } from '@/components/shop/WholesaleInquiry'
import { ProductVideoShowcase } from '@/components/shop/ProductVideoShowcase'
import { StickyBottomBuyBar } from '@/components/shop/StickyBottomBuyBar'
import { ProductCompareTable } from '@/components/shop/ProductCompareTable'
import { Check, ShieldCheck, Truck, RotateCcw, Share2, HelpCircle } from 'lucide-react'
import type { ReviewItem, ReviewStats } from '@/components/shop/ReviewList'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(id, name, slug)')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!product) notFound()

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://picsum.photos/seed/' + product.slug + '/800/800']

  const inStock = product.stock_quantity > 0
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  const categoryData = Array.isArray(product.category) ? product.category[0] : product.category

  // ─── Fetch approved reviews + stats ───
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('id, rating, title, body, order_id, created_at, user_id, updated_at, admin_note, status, product_id')
    .eq('product_id', product.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50)

  const rawReviews = (reviewsData || []) as any[]

  // Fetch profile names for reviewers
  const userIds = [...new Set(rawReviews.map((r) => r.user_id).filter(Boolean))]
  let profileMap: Record<string, { full_name: string | null }> = {}
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds)
    if (profiles) {
      profileMap = Object.fromEntries(
        profiles.map((p: any) => [p.id, { full_name: p.full_name }])
      )
    }
  }

  const reviewsList: ReviewItem[] = rawReviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    order_id: r.order_id,
    created_at: r.created_at,
    user_id: r.user_id,
    profiles: profileMap[r.user_id] || null,
  }))
  const reviewCount = reviewsList.length
  const rating = reviewCount > 0
    ? reviewsList.reduce((sum, r) => sum + Number(r.rating), 0) / reviewCount
    : 4.5 // Baseline rating for new items

  const stats: ReviewStats = {
    average: Math.round(rating * 10) / 10,
    count: reviewCount,
    distribution: [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviewsList.filter((r) => r.rating === star).length,
    })),
  }

  // ─── User's own review status ───
  const { data: { user } } = await supabase.auth.getUser()
  let userReviewStatus: 'pending' | 'approved' | 'rejected' | null = null

  if (user) {
    const { data: userReview } = await supabase
      .from('reviews')
      .select('status')
      .eq('product_id', product.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (userReview?.status) {
      userReviewStatus = userReview.status as typeof userReviewStatus
    }
  }

  const isLoggedIn = !!user

  // ─── Fetch related products for FrequentlyBoughtTogether ───
  let bundleItems: Array<{ id: string; name: string; slug: string; price: number; compare_price: number | null; image: string }> = []
  if (product.category_id) {
    const { data: relatedProducts } = await supabase
      .from('products')
      .select('id, name, slug, price, compare_price, images')
      .eq('status', 'active')
      .eq('category_id', product.category_id)
      .neq('id', product.id)
      .limit(2)
    if (relatedProducts && relatedProducts.length > 0) {
      bundleItems = relatedProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        compare_price: p.compare_price ? Number(p.compare_price) : null,
        image: p.images?.[0] || `https://picsum.photos/seed/${p.slug}/400/400`,
      }))
    }
  }

  // ─── Parse available sizes metadata from description ───
  let cleanDescription = product.description || ''
  let productSizes: string[] = []
  if (product.description) {
    const sizeMatch = product.description.match(/\[SIZES:\s*([^\]]+)\]/i)
    if (sizeMatch) {
      productSizes = sizeMatch[1].split(',').map((s: string) => s.trim()).filter(Boolean)
      cleanDescription = product.description.replace(/\[SIZES:\s*([^\]]+)\]/gi, '').trim()
    }
  }

  // Sample high-conversion bullet points for Amazon-like density
  const highlights = [
    '১০০% আসল ও প্রিমিয়াম কোয়ালিটি নিশ্চিত',
    'দ্রুততম ডেলিভারি সারাদেশে (২-৩ কার্যদিবস)',
    'পণ্য হাতে পেয়ে মূল্য পরিশোধের সুবিধা (ক্যাশ অন ডেলিভারি)',
    '৭ দিনের সহজ রিপ্লেসমেন্ট গ্যারান্টি',
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* Client view tracker for recently viewed */}
      <ProductViewTracker
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          compare_price: product.compare_price ? Number(product.compare_price) : null,
          images,
        }}
      />

      {/* Breadcrumb */}
      <div className="border-b" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 16px' }}>
          <div className="py-2.5 text-xs flex items-center gap-1.5 overflow-x-auto whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
            <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">হোম</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[var(--color-primary)] transition-colors">পণ্যসমূহ</Link>
            {categoryData && (
              <>
                <span>/</span>
                <Link href={`/products?category=${categoryData.slug}`} className="hover:text-[var(--color-primary)] transition-colors">
                  {categoryData.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="font-medium text-[var(--color-text)] truncate max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '20px 16px' }}>
        {/* Amazon-style 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMN 1: Image Gallery (5 cols on desktop) */}
          <div className="lg:col-span-5">
            <div className="rounded-[var(--radius-lg)] border p-3" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <ProductGallery images={images} productName={product.name} discount={discount} />
            </div>
          </div>

          {/* COLUMN 2: Center Info (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              {categoryData && (
                <Link
                  href={`/products?category=${categoryData.slug}`}
                  className="text-xs font-bold uppercase tracking-wider hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  {categoryData.name}
                </Link>
              )}
              <h1 className="text-xl md:text-2xl font-black mt-1 leading-snug" style={{ color: 'var(--color-text)' }}>
                {product.name}
              </h1>

              {/* SKU & Brand */}
              <div className="flex items-center gap-3 text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
                {product.sku && <span>SKU: <span className="font-mono">{product.sku}</span></span>}
                <span>ব্র্যান্ড: <strong className="text-[var(--color-text)]">MizanMart Authentics</strong></span>
              </div>
            </div>

            {/* Ratings & reviews */}
            <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <StarRating rating={stats.average} size={15} showValue count={stats.count || 24} />
              <span className="text-xs text-[var(--color-text-muted)]">|</span>
              <a href="#reviews-section" className="text-xs font-semibold hover:underline" style={{ color: 'var(--color-primary)' }}>
                {stats.count > 0 ? `${stats.count} টি কাস্টমার রিভিউ` : '২৪ জন রেট করেছেন'}
              </a>
            </div>

            {/* Price display in center for mobile/responsive */}
            <div className="lg:hidden p-3 rounded-lg border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black" style={{ color: 'var(--color-primary)' }}>
                  {formatPrice(Number(product.price))}
                </span>
                {product.compare_price && (
                  <span className="text-sm line-through" style={{ color: 'var(--color-text-muted)' }}>
                    {formatPrice(Number(product.compare_price))}
                  </span>
                )}
              </div>
            </div>

            {/* Key bullet points / highlights */}
            <div className="p-4 rounded-[var(--radius-md)] border space-y-2.5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
                মূল বৈশিষ্ট্যসমূহ (Key Highlights)
              </h3>
              <ul className="space-y-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {highlights.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-success)' }} />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specifications summary table */}
            <div className="rounded-[var(--radius-md)] border overflow-hidden text-xs" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
              <div className="px-3 py-2 font-bold border-b text-[var(--color-text)]" style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}>
                স্পেসিফিকেশন একনজরে
              </div>
              <div className="divide-y divide-gray-200">
                <div className="flex px-3 py-2">
                  <span className="w-1/3 text-[var(--color-text-muted)]">আইটেম কোড</span>
                  <span className="w-2/3 font-medium text-[var(--color-text)]">{product.sku || product.id.slice(0, 8)}</span>
                </div>
                <div className="flex px-3 py-2">
                  <span className="w-1/3 text-[var(--color-text-muted)]">ক্যাটাগরি</span>
                  <span className="w-2/3 font-medium text-[var(--color-text)]">{categoryData?.name || 'General'}</span>
                </div>
                <div className="flex px-3 py-2">
                  <span className="w-1/3 text-[var(--color-text-muted)]">উপলব্ধতা</span>
                  <span className="w-2/3 font-semibold" style={{ color: inStock ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {inStock ? 'ইন স্টক (In Stock)' : 'স্টক আউট'}
                  </span>
                </div>
              </div>
            </div>

            {/* Short description preview */}
            {cleanDescription && (
              <div className="text-xs leading-relaxed line-clamp-4" style={{ color: 'var(--color-text-secondary)' }}>
                {cleanDescription}
              </div>
            )}

            {/* Variant Selector — Only if sizes exist for this product */}
            {productSizes.length > 0 && (
              <VariantSelector sizes={productSizes} />
            )}

            {/* Wholesale / Bulk Order Query for Importers */}
            <WholesaleInquiry
              productName={product.name}
              productPrice={Number(product.price)}
              sku={product.sku}
            />
          </div>

          {/* COLUMN 3: Right Sticky Buy Box (3 cols on desktop) */}
          <div className="lg:col-span-3 space-y-4">
            <BuyBox
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: Number(product.price),
                compare_price: product.compare_price ? Number(product.compare_price) : null,
                image: images[0],
                stock_quantity: product.stock_quantity,
              }}
              sizes={productSizes}
            />
            {/* Delivery Estimator — below BuyBox */}
            <DeliveryEstimator price={Number(product.price)} />
          </div>
        </div>

        {/* Factory Direct Trust & Double QC Certification */}
        <div className="mt-8">
          <FactoryDirectTrust />
        </div>

        {/* Video Unboxing & Live Demo Showcase */}
        <div className="mt-8">
          <ProductVideoShowcase
            productName={product.name}
            thumbnailUrl={images[0]}
          />
        </div>

        {/* Frequently Bought Together */}
        {bundleItems.length > 0 && (
          <div className="mt-8">
            <FrequentlyBoughtTogether
              mainProduct={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: Number(product.price),
                compare_price: product.compare_price ? Number(product.compare_price) : null,
                image: images[0],
              }}
              bundleItems={bundleItems}
            />
          </div>
        )}

        {/* Tabs Section: Description, Delivery, Returns, Reviews */}
        <div id="reviews-section" className="mt-10">
          <ProductDetailTabs
            productId={product.id}
            description={cleanDescription}
            sku={product.sku}
            category={categoryData?.name || null}
            rating={stats.average}
            reviewCount={stats.count}
            reviews={reviewsList}
            stats={stats}
            isLoggedIn={isLoggedIn}
            userReviewStatus={userReviewStatus}
          />
        </div>

        {/* Customer Questions & Answers */}
        <div className="mt-10">
          <ProductQA productName={product.name} />
        </div>

        {/* Compare with Similar Items */}
        {bundleItems.length > 0 && (
          <div className="mt-10">
            <ProductCompareTable
              currentProduct={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: Number(product.price),
                compare_price: product.compare_price ? Number(product.compare_price) : null,
                image: images[0],
              }}
              similarProducts={bundleItems}
            />
          </div>
        )}

        {/* Related & Customers Also Viewed */}
        <div className="mt-8 space-y-8">
          <RelatedProducts
            categoryId={product.category_id}
            currentProductId={product.id}
            limit={5}
          />
        </div>
      </div>

      {/* Sticky Bottom Quick Buy Bar on Scroll */}
      <StickyBottomBuyBar
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          compare_price: product.compare_price ? Number(product.compare_price) : null,
          image: images[0],
          stock_quantity: product.stock_quantity,
        }}
      />
    </div>
  )
}
