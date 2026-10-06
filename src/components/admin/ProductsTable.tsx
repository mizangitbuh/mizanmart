'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Package, Loader2, CheckSquare, Square, X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  stock_quantity: number
  sku: string | null
  status: string
  images: string[]
  created_at: string
  updated_at: string | null
  category: { name: string } | { name: string }[] | null
}

interface Props {
  products: Product[]
  categories: { id: string; name: string }[]
}

export function ProductsTable({ products, categories }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)

  const allSelected = products.length > 0 && selected.size === products.length
  const someSelected = selected.size > 0 && !allSelected

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(products.map((p) => p.id)))
    }
  }

  const toggleOne = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  const clearSelection = () => {
    setSelected(new Set())
    setShowCategoryPicker(false)
  }

  const runBulkAction = async (action: string, categoryId?: string) => {
    if (selected.size === 0) return
    if (action === 'delete' && !confirm(`Delete ${selected.size} product(s)? This cannot be undone.`)) {
      return
    }

    setBusy(true)
    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          productIds: Array.from(selected),
          categoryId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Bulk action failed')

      clearSelection()
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  const getCategoryName = (category: Product['category']): string => {
    if (!category) return '—'
    if (Array.isArray(category)) return category[0]?.name || '—'
    return category.name || '—'
  }

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'default' => {
    if (status === 'active') return 'success'
    if (status === 'draft') return 'warning'
    if (status === 'out_of_stock') return 'danger'
    return 'default'
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
        <div className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Try changing filters or add a new product
        </div>
        <Link
          href="/admin/products/new"
          className="inline-block px-5 py-2.5 rounded-[var(--radius-md)] font-bold text-sm text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          + Add Product
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div
          className="flex flex-wrap items-center gap-2 p-3 rounded-[var(--radius-lg)] border"
          style={{ background: 'var(--color-primary-light)', borderColor: 'var(--color-primary)' }}
        >
          <div className="flex items-center gap-2 font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
            <CheckSquare size={16} />
            {selected.size} selected
          </div>

          <div className="h-5 w-px mx-1" style={{ background: 'var(--color-primary)', opacity: 0.3 }} />

          <Button size="sm" variant="outline" onClick={() => runBulkAction('activate')} disabled={busy}>
            Activate
          </Button>
          <Button size="sm" variant="outline" onClick={() => runBulkAction('deactivate')} disabled={busy}>
            Deactivate
          </Button>

          {!showCategoryPicker ? (
            <Button size="sm" variant="outline" onClick={() => setShowCategoryPicker(true)} disabled={busy}>
              Set Category
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) runBulkAction('set_category', e.target.value)
                }}
                className="px-3 py-1.5 text-sm rounded-[var(--radius-md)] border"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                }}
                defaultValue=""
              >
                <option value="" disabled>Select category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                onClick={() => setShowCategoryPicker(false)}
                className="p-1.5 rounded hover:bg-[var(--color-surface-hover)]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          <Button size="sm" variant="danger" onClick={() => runBulkAction('delete')} disabled={busy}>
            <Trash2 size={14} />
            Delete
          </Button>

          {busy && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-primary)' }} />}

          <button
            onClick={clearSelection}
            className="ml-auto text-xs font-semibold hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div
        className="rounded-[var(--radius-lg)] border overflow-hidden"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-background)' }}>
                <th className="w-12 px-4 py-3">
                  <button
                    onClick={toggleAll}
                    className="flex items-center justify-center"
                    aria-label="Select all"
                    style={{ color: 'var(--color-primary)' }}
                  >
                    {allSelected ? (
                      <CheckSquare size={16} />
                    ) : someSelected ? (
                      <div className="w-4 h-4 rounded border-2 flex items-center justify-center"
                           style={{ borderColor: 'var(--color-primary)' }}>
                        <div className="w-2 h-0.5" style={{ background: 'var(--color-primary)' }} />
                      </div>
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Product
                </th>
                <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide hidden md:table-cell" style={{ color: 'var(--color-text-muted)' }}>
                  SKU
                </th>
                <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wide hidden lg:table-cell" style={{ color: 'var(--color-text-muted)' }}>
                  Category
                </th>
                <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Price
                </th>
                <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Stock
                </th>
                <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Status
                </th>
                <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isSelected = selected.has(product.id)
                const image = product.images?.[0] || 'https://picsum.photos/seed/' + product.slug + '/100/100'
                const lowStock = product.stock_quantity > 0 && product.stock_quantity <= 5
                const noStock = product.stock_quantity <= 0

                return (
                  <tr
                    key={product.id}
                    className="border-t transition-colors"
                    style={{
                      borderColor: 'var(--color-border)',
                      background: isSelected ? 'var(--color-primary-light)' : 'transparent',
                    }}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleOne(product.id)}
                        className="flex items-center justify-center"
                        style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                        aria-label={isSelected ? 'Deselect' : 'Select'}
                      >
                        {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>
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
                            {product.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {product.sku || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {getCategoryName(product.category)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold" style={{ color: 'var(--color-primary)' }}>
                        {formatPrice(Number(product.price))}
                      </div>
                      {product.compare_price && (
                        <div className="text-[10px] line-through" style={{ color: 'var(--color-text-muted)' }}>
                          {formatPrice(Number(product.compare_price))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {noStock ? (
                        <Badge variant="danger" size="sm">Out</Badge>
                      ) : lowStock ? (
                        <Badge variant="warning" size="sm">{product.stock_quantity} left</Badge>
                      ) : (
                        <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                          {product.stock_quantity}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={getStatusVariant(product.status)} size="sm">
                        {product.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold hover:underline"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        <Edit size={12} />
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
