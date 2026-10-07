import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { WishlistButton } from '@/components/shop/WishlistButton'
import { AddToCartButton } from '@/components/shop/AddToCartButton'

export const dynamic = 'force-dynamic'

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: items } = await supabase
    .from('wishlists')
    .select(
      'id, created_at, products(id, name, slug, price, compare_price, images, stock_quantity, status)'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Filter out products deleted or null
  const valid = (items || []).filter((it: any) => it.products)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <Heart size={22} className="fill-red-500 text-red-500" />
            Wishlist
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {valid.length} {valid.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </div>

      {valid.length === 0 ? (
        <div
          className="p-10 rounded-[var(--radius-lg)] border text-center"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <Heart size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>
            Your wishlist is empty
          </div>
          <div className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>
            Save your favorite items for later
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: 'var(--color-primary)' }}
          >
            <ShoppingBag size={14} />
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {valid.map((item: any) => {
            const p = item.products
            const image =
              p.images && Array.isArray(p.images) && p.images[0]?.trim()
                ? p.images[0]
                : 'https://picsum.photos/seed/' + p.slug + '/600/600'

            const outOfStock = p.stock_quantity !== undefined && p.stock_quantity <= 0
            const discount = p.compare_price
              ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100)
              : 0

            return (
              <div
                key={item.id}
                className="rounded-[var(--radius-lg)] border overflow-hidden flex flex-col"
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <Link href={`/product/${p.slug}`} className="block relative aspect-square overflow-hidden" style={{ background: 'var(--color-background)' }}>
                  <Image
                    src={image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                  {discount > 0 && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black text-white" style={{ background: 'var(--color-error)' }}>
                      -{discount}%
                    </div>
                  )}
                  {outOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-bold px-3 py-1.5 rounded" style={{ background: 'var(--color-error)' }}>
                        OUT OF STOCK
                      </span>
                    </div>
                  )}
                </Link>

                <div className="p-3 flex flex-col flex-1">
                  <Link
                    href={`/product/${p.slug}`}
                    className="text-sm font-medium line-clamp-2 mb-2 hover:text-[var(--color-primary)] transition"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {p.name}
                  </Link>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base font-black" style={{ color: 'var(--color-primary)' }}>
                      {formatPrice(Number(p.price))}
                    </span>
                    {p.compare_price && (
                      <span className="text-xs line-through" style={{ color: 'var(--color-text-muted)' }}>
                        {formatPrice(Number(p.compare_price))}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex items-center gap-2">
                    {!outOfStock ? (
                      <div className="flex-1">
                        <AddToCartButton
                          product={{
                            id: p.id,
                            name: p.name,
                            slug: p.slug,
                            price: Number(p.price),
                            image,
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 text-xs text-center py-2" style={{ color: 'var(--color-text-muted)' }}>
                        Unavailable
                      </div>
                    )}
                    <WishlistButton
                      productId={p.id}
                      initialWishlisted={true}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
