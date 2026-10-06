'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Edit, Package, AlertTriangle, XCircle, CheckCircle, Settings2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { StockAdjustModal } from '@/components/admin/StockAdjustModal'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  stock_quantity: number
  sku: string | null
  status: string
  images: string[]
  updated_at: string | null
  category: { name: string } | { name: string }[] | null
}

interface Props {
  products: Product[]
}

export function InventoryTable({ products }: Props) {
  const router = useRouter()
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null)

  const handleSuccess = () => {
    router.refresh()
  }

  const getCategoryName = (category: Product['category']): string => {
    if (!category) return '—'
    if (Array.isArray(category)) return category[0]?.name || '—'
    return category.name || '—'
  }

  if (products.length === 0) {
    return (
      <div
        className="p-12 rounded-[var(--radius-lg)] border text-center"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <Package size={40} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
        <div className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          No products found
        </div>
        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Try changing filters or add new products
        </div>
      </div>
    )
  }

  return (
    <>
      <div
        className="rounded-[var(--radius-lg)] border overflow-hidden"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-background)' }}>
                <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Product
                </th>
                <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide hidden md:table-cell" style={{ color: 'var(--color-text-muted)' }}>
                  SKU
                </th>
                <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Stock
                </th>
                <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Status
                </th>
                <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-wide hidden lg:table-cell" style={{ color: 'var(--color-text-muted)' }}>
                  Value
                </th>
                <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const image = product.images?.[0] || 'https://picsum.photos/seed/' + product.slug + '/100/100'
                const lowStock = product.stock_quantity > 0 && product.stock_quantity <= 5
                const noStock = product.stock_quantity <= 0
                const stockValue = product.stock_quantity * Number(product.price)

                return (
                  <tr
                    key={product.id}
                    className="border-t transition-colors hover:bg-[var(--color-surface-hover)]"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="relative w-10 h-10 rounded-[var(--radius-md)] overflow-hidden flex-shrink-0"
                          style={{ background: 'var(--color-background)' }}
                        >
                          <Image src={image} alt={product.name} fill className="object-cover" sizes="40px" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--color-text)' }}>
                            {product.name}
                          </div>
                          <div className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                            {getCategoryName(product.category)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {product.sku || '—'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {noStock ? (
                          <XCircle size={16} style={{ color: 'var(--color-error)' }} />
                        ) : lowStock ? (
                          <AlertTriangle size={16} style={{ color: 'var(--color-warning)' }} />
                        ) : (
                          <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
                        )}
                        <span
                          className="font-black text-sm"
                          style={{
                            color: noStock
                              ? 'var(--color-error)'
                              : lowStock
                              ? 'var(--color-warning)'
                              : 'var(--color-text)',
                          }}
                        >
                          {product.stock_quantity}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {noStock ? (
                        <Badge variant="danger" size="sm">Out of Stock</Badge>
                      ) : lowStock ? (
                        <Badge variant="warning" size="sm">Low Stock</Badge>
                      ) : (
                        <Badge variant="success" size="sm">In Stock</Badge>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <div className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                        {formatPrice(stockValue)}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                        @{formatPrice(Number(product.price))}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setAdjustProduct(product)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-[var(--radius-md)] transition-colors"
                          style={{
                            background: 'var(--color-primary)',
                            color: 'white',
                          }}
                          aria-label="Adjust stock"
                        >
                          <Settings2 size={12} />
                          Adjust
                        </button>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold hover:underline"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          <Edit size={12} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <StockAdjustModal
        isOpen={!!adjustProduct}
        onClose={() => setAdjustProduct(null)}
        onSuccess={handleSuccess}
        product={adjustProduct}
      />
    </>
  )
}
