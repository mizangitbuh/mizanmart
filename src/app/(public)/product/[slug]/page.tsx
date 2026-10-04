import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { AddToCartButton } from '@/components/shop/AddToCartButton'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, category:categories(name, slug)')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!product) notFound()

  const image = product.images?.[0] || '/placeholder.png'
  const inStock = product.stock_quantity > 0
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${product.category?.slug}`} className="hover:text-blue-600">
          {product.category?.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-100">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Image src={image} alt={product.name} fill className="object-cover" sizes="50vw" priority />
          {discount > 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              -{discount}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}</span>
            {product.compare_price && (
              <span className="text-xl text-gray-400 line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>

          <div>
            {inStock ? (
              <Badge variant="success">✅ In Stock ({product.stock_quantity})</Badge>
            ) : (
              <Badge variant="danger">Out of Stock</Badge>
            )}
          </div>

          {product.description && (
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {product.description}
            </p>
          )}

          {product.sku && (
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          )}

          <div className="mt-4">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                image,
              }}
              disabled={!inStock}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
