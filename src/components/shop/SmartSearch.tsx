'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, TrendingUp, Clock, ArrowRight } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Props {
  placeholder?: string
  compact?: boolean
}

const RECENT_KEY = 'mizanmart_recent_searches'

export function SmartSearch({ placeholder = 'Search products...', compact = false }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ products: Product[]; categories: Category[] }>({
    products: [],
    categories: [],
  })
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Load recent searches
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY)
      if (saved) setRecent(JSON.parse(saved))
    } catch {}
  }, [])

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults({ products: [], categories: [] })
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data)
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Esc to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const saveRecent = (term: string) => {
    const updated = [term, ...recent.filter((r) => r !== term)].slice(0, 5)
    setRecent(updated)
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
    } catch {}
  }

  const handleSubmit = (term?: string) => {
    const searchTerm = term || query
    if (!searchTerm.trim()) return
    saveRecent(searchTerm)
    setOpen(false)
    setQuery(searchTerm)
    router.push(`/products?q=${encodeURIComponent(searchTerm)}`)
  }

  const clearQuery = () => {
    setQuery('')
    setResults({ products: [], categories: [] })
  }

  const clearRecent = () => {
    setRecent([])
    try {
      localStorage.removeItem(RECENT_KEY)
    } catch {}
  }

  const showRecent = open && query.length < 2 && recent.length > 0
  const showResults = open && query.length >= 2
  const hasResults = results.products.length > 0 || results.categories.length > 0

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
        className="relative"
      >
        <div className="relative flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className={`w-full pl-4 pr-20 text-sm rounded-l-full focus:outline-none ${compact ? 'py-2' : 'py-2.5'}`}
            style={{
              border: '2px solid var(--color-primary)',
              borderRight: 'none',
              background: 'var(--color-background)',
              color: 'var(--color-text)',
            }}
          />
          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="absolute right-16 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              aria-label="Clear"
            >
              <X size={16} />
            </button>
          )}
          {/* Submit button */}
          <button
            type="submit"
            className="px-5 rounded-r-full text-white transition-colors"
            style={{ background: 'var(--color-primary)' }}
            aria-label="Search"
          >
            <Search size={compact ? 16 : 18} />
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {(showRecent || showResults) && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-[var(--radius-lg)] shadow-lg border overflow-hidden z-50 bg-[var(--color-surface)]"
          style={{ borderColor: 'var(--color-border)', maxHeight: '70vh', overflowY: 'auto' }}
        >
          {/* Recent searches */}
          {showRecent && (
            <div className="p-3">
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                  <Clock size={12} />
                  Recent Searches
                </div>
                <button
                  onClick={clearRecent}
                  className="text-xs hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Clear
                </button>
              </div>
              {recent.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSubmit(term)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] text-left"
                >
                  <Clock size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--color-text)' }}>{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          {showResults && (
            <>
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Searching...</div>
                </div>
              ) : hasResults ? (
                <>
                  {/* Categories */}
                  {results.categories.length > 0 && (
                    <div className="p-2">
                      <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                        <TrendingUp size={12} />
                        Categories
                      </div>
                      {results.categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/products?category=${cat.slug}`}
                          onClick={() => {
                            saveRecent(cat.name)
                            setOpen(false)
                          }}
                          className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)]"
                        >
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                            {cat.name}
                          </span>
                          <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Products */}
                  {results.products.length > 0 && (
                    <div className="p-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="px-3 py-2 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                        Products
                      </div>
                      {results.products.map((p) => {
                        const img = p.images?.[0] || 'https://picsum.photos/seed/' + p.slug + '/100/100'
                        return (
                          <Link
                            key={p.id}
                            href={`/product/${p.slug}`}
                            onClick={() => {
                              saveRecent(p.name)
                              setOpen(false)
                            }}
                            className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)]"
                          >
                            <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0" style={{ background: 'var(--color-background)' }}>
                              <Image src={img} alt={p.name} fill className="object-cover" sizes="40px" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium line-clamp-1" style={{ color: 'var(--color-text)' }}>
                                {p.name}
                              </div>
                              <div className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                                ৳{Number(p.price).toLocaleString('en-BD')}
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}

                  {/* View all link */}
                  <button
                    onClick={() => handleSubmit()}
                    className="w-full py-3 text-center text-sm font-bold hover:bg-[var(--color-surface-hover)] border-t"
                    style={{ color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}
                  >
                    View all results for &quot;{query}&quot; →
                  </button>
                </>
              ) : (
                <div className="p-8 text-center">
                  <Search size={32} className="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                  <div className="text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                    No results found
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Try different keywords
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
