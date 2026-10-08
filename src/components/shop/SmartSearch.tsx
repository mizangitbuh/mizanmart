'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, TrendingUp, Clock, ArrowRight, Mic, MicOff, ChevronDown, Sparkles } from 'lucide-react'

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

const CATEGORIES = [
  { name: 'সকল ক্যাটাগরি', slug: '' },
  { name: 'কসমেটিক্স', slug: 'cosmetics' },
  { name: 'পোশাক', slug: 'clothing' },
  { name: 'ইলেকট্রনিক্স', slug: 'electronics' },
  { name: 'জেনারেল', slug: 'general' },
]

const POPULAR_SEARCHES = ['স্মার্ট গ্যাজেট', 'ইয়ারবাডস', 'স্মার্ট ওয়াচ', 'চার্জার', 'নতুন কালেকশন', 'অফার']
const RECENT_KEY = 'mizanmart_recent_searches'

export function SmartSearch({ placeholder = 'পণ্য, ব্র্যান্ড খুঁজুন...', compact = false }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedCat, setSelectedCat] = useState('')
  const [results, setResults] = useState<{ products: Product[]; categories: Category[] }>({
    products: [],
    categories: [],
  })
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const [isListening, setIsListening] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Check Web Speech API support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRec) {
        setSpeechSupported(true)
        const rec = new SpeechRec()
        rec.continuous = false
        rec.interimResults = false
        rec.lang = 'bn-BD' // Primary Bengali, fallback handles English nicely

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setQuery(transcript)
          setIsListening(false)
          handleSubmit(transcript)
        }

        rec.onerror = () => {
          setIsListening(false)
        }

        rec.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = rec
      }
    }
  }, [])

  const toggleVoiceSearch = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('আপনার ব্রাউজারে ভয়েস সার্চ সমর্থিত নয়। অনুগ্রহ করে Chrome বা Edge ব্যবহার করুন।')
      return
    }
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        setOpen(true)
      } catch (err) {
        console.error('Speech recognition error:', err)
      }
    }
  }

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
        const catParam = selectedCat ? `&category=${encodeURIComponent(selectedCat)}` : ''
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}${catParam}`)
        const data = await res.json()
        setResults(data)
      } catch (err) {
        console.error('Search failed:', err)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query, selectedCat])

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
    const updated = [term, ...recent.filter((r) => r !== term)].slice(0, 6)
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
    const catQuery = selectedCat ? `&category=${encodeURIComponent(selectedCat)}` : ''
    router.push(`/products?q=${encodeURIComponent(searchTerm)}${catQuery}`)
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

  const showRecentOrPopular = open && query.length < 2
  const showResults = open && query.length >= 2
  const hasResults = results.products.length > 0 || results.categories.length > 0

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Input Form with Amazon Category Dropdown & Voice Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
        className="relative"
      >
        <div
          className="relative flex items-center rounded-full border-2 transition-all focus-within:shadow-md"
          style={{
            borderColor: 'var(--color-primary)',
            background: 'var(--color-background)',
          }}
        >
          {/* Amazon-style Category Selector on Desktop */}
          {!compact && (
            <div className="hidden sm:flex items-center pl-3 pr-2 border-r" style={{ borderColor: 'var(--color-border)' }}>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer pr-1"
                style={{ color: 'var(--color-text)' }}
                aria-label="ক্যাটাগরি নির্বাচন"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug} style={{ background: 'var(--color-surface)', color: 'var(--color-text)' }}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Main text input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={isListening ? 'কথা বলুন... শুনছি...' : placeholder}
            className={`w-full pl-3.5 pr-20 text-xs sm:text-sm bg-transparent focus:outline-none ${compact ? 'py-2' : 'py-2.5'}`}
            style={{
              color: 'var(--color-text)',
            }}
          />

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={toggleVoiceSearch}
            className={`p-1.5 rounded-full mr-1 transition-all ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-[var(--color-primary)]'
            }`}
            title={isListening ? 'শুনছি...' : 'ভয়েস দিয়ে সার্চ করুন'}
            aria-label="ভয়েস সার্চ"
          >
            {isListening ? <Mic size={16} /> : <Mic size={16} />}
          </button>

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={clearQuery}
              className="p-1 mr-1 text-gray-400 hover:text-gray-600"
              aria-label="Clear"
            >
              <X size={15} />
            </button>
          )}

          {/* Submit Search Button */}
          <button
            type="submit"
            className="px-4 sm:px-5 h-full self-stretch rounded-r-full text-white flex items-center justify-center transition-colors hover:opacity-90"
            style={{ background: 'var(--color-primary)' }}
            aria-label="Search"
          >
            <Search size={compact ? 15 : 17} />
          </button>
        </div>
      </form>

      {/* Dropdown Suggestions */}
      {(showRecentOrPopular || showResults) && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-[var(--radius-lg)] shadow-xl border overflow-hidden z-50 bg-[var(--color-surface)]"
          style={{ borderColor: 'var(--color-border)', maxHeight: '72vh', overflowY: 'auto' }}
        >
          {/* Listening State Banner */}
          {isListening && (
            <div className="p-3 bg-red-50 border-b flex items-center gap-2 text-xs font-bold text-red-600 animate-pulse">
              <Mic size={16} />
              <span>কথা বলুন... আপনার কণ্ঠ রেকর্ড করা হচ্ছে...</span>
            </div>
          )}

          {/* Recent & Popular searches */}
          {showRecentOrPopular && (
            <div className="p-3 space-y-3">
              {recent.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5 px-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      <Clock size={12} />
                      সাম্প্রতিক অনুসন্ধান
                    </div>
                    <button
                      onClick={clearRecent}
                      className="text-[11px] hover:underline"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      ক্লিয়ার
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {recent.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSubmit(term)}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] text-left text-xs transition-colors"
                        style={{ color: 'var(--color-text)' }}
                      >
                        <Clock size={13} className="text-gray-400 flex-shrink-0" />
                        <span className="truncate">{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-2">
                  <TrendingUp size={12} />
                  জনপ্রিয় অনুসন্ধান
                </div>
                <div className="flex flex-wrap gap-1.5 px-2">
                  {POPULAR_SEARCHES.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleSubmit(tag)}
                      className="text-xs px-2.5 py-1 rounded-full border hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                      style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Search Results */}
          {showResults && (
            <>
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
                  <div className="text-xs text-gray-400">খোঁজা হচ্ছে...</div>
                </div>
              ) : hasResults ? (
                <>
                  {/* Matching Categories */}
                  {results.categories.length > 0 && (
                    <div className="p-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        <TrendingUp size={12} /> ক্যাটাগরি
                      </div>
                      {results.categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/products?category=${cat.slug}`}
                          onClick={() => {
                            saveRecent(cat.name)
                            setOpen(false)
                          }}
                          className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] transition-colors"
                        >
                          <span className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                            {cat.name}
                          </span>
                          <ArrowRight size={13} className="text-gray-400" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Matching Products */}
                  {results.products.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        পণ্যসমূহ
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
                            className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-hover)] transition-colors"
                          >
                            <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 border" style={{ borderColor: 'var(--color-border)' }}>
                              <Image src={img} alt={p.name} fill className="object-cover" sizes="40px" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium line-clamp-1" style={{ color: 'var(--color-text)' }}>
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

                  {/* View all results CTA */}
                  <button
                    onClick={() => handleSubmit()}
                    className="w-full py-2.5 text-center text-xs font-bold hover:bg-[var(--color-surface-hover)] border-t transition-colors"
                    style={{ color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}
                  >
                    &quot;{query}&quot; এর জন্য সকল ফলাফল দেখুন →
                  </button>
                </>
              ) : (
                <div className="p-8 text-center">
                  <Search size={28} className="mx-auto mb-2 text-gray-400" />
                  <div className="text-xs font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                    কোনো পণ্য পাওয়া যায়নি
                  </div>
                  <div className="text-[11px] text-gray-400">
                    বানান পরিবর্তন করে অথবা ভিন্ন কিওয়ার্ড দিয়ে চেষ্টা করুন
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
