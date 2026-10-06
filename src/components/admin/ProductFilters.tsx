'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface Props {
  categories: Category[]
}

export function ProductFilters({ categories }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('q') || '')
  const category = searchParams.get('category') || ''
  const status = searchParams.get('status') || ''
  const stock = searchParams.get('stock') || ''

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (search.trim()) {
        params.set('q', search.trim())
      } else {
        params.delete('q')
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    }, 400)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const clearAll = () => {
    setSearch('')
    router.push(pathname)
  }

  const hasFilters = !!(search || category || status || stock)

  return (
    <div
      className="p-4 rounded-[var(--radius-lg)] border space-y-3"
      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-9 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)] transition-colors"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-background)',
              color: 'var(--color-text)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Clear"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="px-3 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)] cursor-pointer min-w-[140px]"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-background)',
            color: 'var(--color-text)',
          }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="px-3 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)] cursor-pointer min-w-[120px]"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-background)',
            color: 'var(--color-text)',
          }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>

        {/* Stock */}
        <select
          value={stock}
          onChange={(e) => updateFilter('stock', e.target.value)}
          className="px-3 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none focus:border-[var(--color-primary)] cursor-pointer min-w-[130px]"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-background)',
            color: 'var(--color-text)',
          }}
        >
          <option value="">All Stock</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock (≤5)</option>
          <option value="out">Out of Stock</option>
        </select>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold rounded-[var(--radius-md)] transition-colors"
            style={{
              background: 'var(--color-error-bg)',
              color: 'var(--color-error)',
            }}
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
