import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { ProductGallery } from '@/components/shop/ProductGallery'
import { ProductDetailTabs } from '@/components/shop/ProductDetailTabs'
import { RelatedProducts } from '@/components/shop/RelatedProducts'
import { ProductBuyPanel } from '@/components/shop/ProductBuyPanel'
import { Star, Truck, Shield, RotateCcw } from 'lucide-react'
import { StarRating } from '@/components/shop/StarRating'
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
  // Note: no profiles join here — reviews.user_id → auth.users.id,
  // not profiles.id, so PostgREST can't auto-resolve the FK.
  // Fetch profiles separately and merge.
  const { data: reviewsData, error: reviewsError } = await supabase
    .from('reviews')
    .select('id, rating, title, body, order_id, created_at, user_id, updated_at, admin_note, status, product_id')
    .eq('product_id', product.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50)

  if (reviewsError) {
    console.error('[product page] reviews query failed:', reviewsError)
  }

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
    : 0

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

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background)' }}>
      {/* Breadcrumb */}
      <div className="border-b" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="container-main py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
          <span className="mx-2">/</span>
          {categoryData && (
            <>
              <Link href={`/products?category=${categoryData.slug}`} className="hover:text-[var(--color-primary)]">
                {categoryData.name}
              </Link>
              <span className="mx-2">/</span>
            </>
          )}
          <span style={{ color: 'var(--color-text)' }}>{product.name}</span>
        </div>
      </div>

      <div className="container-main py-6 md:py-8">
        {/* Main Product Section */}
        <div
          className="grid md:grid-cols-2 gap-6 md:gap-10 bg-[var(--color-surface)] rounded-[var(--radius-lg)] p-4 md:p-6 border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {/* Gallery */}
          <ProductGallery images={images} productName={product.name} discount={discount} />

          {/* Info */}
          <div className="flex flex-col">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-black mb-3" style={{ color: 'var(--color-text)' }}>
              {product.name}
            </h1>

            {/* Rating + Stock */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {reviewCount > 0 ? (
                <StarRating
                  rating={rating}
                  size={16}
                  showValue
                  count={reviewCount}
                />
              ) : (
                <span className="text-sm italic" style={{ color: 'var(--color-text-muted)' }}>
                  No reviews yet
                </span>
              )}
              {inStock ? (
                <span className="text-sm font-semibold" style={{ color: 'var(--color-success)' }}>
                  ✓ In Stock
                </span>
              ) : (
                <span className="text-sm font-semibold" style={{ color: 'var(--color-error)' }}>
                  Out of Stock
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-3xl md:text-4xl font-black" style={{ color: 'var(--color-primary)' }}>
                {formatPrice(Number(product.price))}
              </span>
              {product.compare_price && (
                <>
                  <span className="text-lg line-through" style={{ color: 'var(--color-text-muted)' }}>
                    {formatPrice(Number(product.compare_price))}
                  </span>
                  <span
                    className="text-sm font-bold px-2 py-1 rounded"
                    style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}
                  >
                    Save {formatPrice(Number(product.compare_price) - Number(product.price))}
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            {product.description && (
              <p className="text-sm mb-6 leading-relaxed line-clamp-3" style={{ color: 'var(--color-text-secondary)' }}>
                {product.description}
              </p>
            )}

            {/* SKU */}
            {product.sku && (
              <div className="text-xs mb-6" style={{ color: 'var(--color-text-muted)' }}>
                SKU: <span className="font-mono">{product.sku}</span>
              </div>
            )}

            {/* Buy Panel (quantity + add to cart + buy now) */}
            <ProductBuyPanel
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: Number(product.price),
                image: images[0],
              }}
              disabled={!inStock}
              maxQuantity={product.stock_quantity}
            />

            {/* Trust badges */}
            <div
              className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="text-center">
                <Truck size={20} className="mx-auto mb-1" style={{ color: 'var(--color-primary)' }} />
                <div className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>Free Delivery</div>
                <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Over ৳1000</div>
              </div>
              <div className="text-center">
                <RotateCcw size={20} className="mx-auto mb-1" style={{ color: 'var(--color-primary)' }} />
                <div className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>7-Day Return</div>
                <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Easy return</div>
              </div>
              <div className="text-center">
                <Shield size={20} className="mx-auto mb-1" style={{ color: 'var(--color-primary)' }} />
                <div className="text-xs font-bold" style={{ color: 'var(--color-text)' }}>Warranty</div>
                <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>100% Genuine</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8">
          <ProductDetailTabs
            productId={product.id}
            description={product.description}
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

        {/* Related Products */}
        <RelatedProducts
          categoryId={product.category_id}
          currentProductId={product.id}
          limit={4}
        />
      </div>
    </div>
  )
}
