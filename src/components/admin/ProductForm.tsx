'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { slugify } from '@/lib/utils'
import { Sparkles, Check, Plus, X } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface Props {
  categories: Category[]
  initial?: any
}

const COMMON_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size', '28', '30', '32', '34', '36', '38']

function parseInitialMetadata(desc?: string | null): { cleanDesc: string; initialSizes: string[]; initialGender: string } {
  if (!desc) return { cleanDesc: '', initialSizes: [], initialGender: '' }
  let cleanDesc = desc
  let initialSizes: string[] = []
  let initialGender = ''

  const sizeMatch = cleanDesc.match(/\[SIZES:\s*([^\]]+)\]/i)
  if (sizeMatch) {
    initialSizes = sizeMatch[1].split(',').map((s) => s.trim()).filter(Boolean)
    cleanDesc = cleanDesc.replace(/\[SIZES:\s*([^\]]+)\]/gi, '').trim()
  }

  const genderMatch = cleanDesc.match(/\[GENDER:\s*([^\]]+)\]/i)
  if (genderMatch) {
    initialGender = genderMatch[1].trim().toLowerCase()
    cleanDesc = cleanDesc.replace(/\[GENDER:\s*([^\]]+)\]/gi, '').trim()
  }

  return { cleanDesc, initialSizes, initialGender }
}

export function ProductForm({ categories, initial }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatingSku, setGeneratingSku] = useState(false)

  // Parse initial sizes & gender from description if present
  const { cleanDesc, initialSizes, initialGender } = parseInitialMetadata(initial?.description)
  const [hasSizes, setHasSizes] = useState(initialSizes.length > 0)
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initialSizes)
  const [customSizeInput, setCustomSizeInput] = useState('')
  const [gender, setGender] = useState<string>(initialGender || '')

  const [form, setForm] = useState({
    name: initial?.name || '',
    slug: initial?.slug || '',
    description: cleanDesc || initial?.description || '',
    price: initial?.price || '',
    compare_price: initial?.compare_price || '',
    stock_quantity: initial?.stock_quantity ?? 0,
    category_id: initial?.category_id || '',
    status: initial?.status || 'active',
    featured: initial?.featured ?? false,
    sku: initial?.sku || '',
  })

  const [images, setImages] = useState<string[]>(initial?.images || [])

  // Auto-generate next sequential SKU from database
  const generateNextSku = async () => {
    setGeneratingSku(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('sku')
        .not('sku', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100)

      let maxNum = 1000
      let prefix = 'MZ'

      if (data && data.length > 0) {
        for (const item of data) {
          if (!item.sku) continue
          const match = item.sku.match(/\d+/g)
          if (match) {
            const num = parseInt(match[match.length - 1], 10)
            if (!isNaN(num) && num > maxNum) {
              maxNum = num
            }
          }
        }
      }

      const nextSku = `${prefix}${maxNum + 1}`
      setForm((f) => ({ ...f, sku: nextSku }))
    } catch (err) {
      console.error('Failed to generate SKU:', err)
    } finally {
      setGeneratingSku(false)
    }
  }

  // Auto-generate SKU on load if creating a new product and SKU is empty
  useEffect(() => {
    if (!initial?.id && !form.sku) {
      generateNextSku()
    }
  }, [initial?.id])

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: f.slug || slugify(name) }))
  }

  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size))
    } else {
      setSelectedSizes([...selectedSizes, size])
    }
  }

  const addCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase()
    if (!trimmed) return
    if (!selectedSizes.includes(trimmed)) {
      setSelectedSizes([...selectedSizes, trimmed])
    }
    setCustomSizeInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (images.length === 0) {
      setError('কমপক্ষে একটা image দিতে হবে')
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Ensure SKU is present (auto-generate fallback if empty)
    let finalSku = form.sku?.trim()
    if (!finalSku) {
      const { data } = await supabase.from('products').select('sku').limit(100)
      let maxNum = 1000
      if (data) {
        for (const item of data) {
          const match = item.sku?.match(/\d+/g)
          if (match) {
            const num = parseInt(match[match.length - 1], 10)
            if (!isNaN(num) && num > maxNum) maxNum = num
          }
        }
      }
      finalSku = `MZ${maxNum + 1}`
    }

    // Build final description with sizes & gender metadata if enabled
    let finalDescription = form.description ? form.description.trim() : ''
    if (gender) {
      finalDescription = finalDescription
        ? `${finalDescription}\n\n[GENDER: ${gender}]`
        : `[GENDER: ${gender}]`
    }
    if (hasSizes && selectedSizes.length > 0) {
      finalDescription = finalDescription
        ? `${finalDescription}\n\n[SIZES: ${selectedSizes.join(', ')}]`
        : `[SIZES: ${selectedSizes.join(', ')}]`
    }

    const payload = {
      name: form.name,
      slug: form.slug,
      description: finalDescription || null,
      price: Number(form.price),
      compare_price: form.compare_price ? Number(form.compare_price) : null,
      stock_quantity: Number(form.stock_quantity),
      category_id: form.category_id || null,
      images,
      status: form.status,
      featured: form.featured,
      sku: finalSku || null,
      updated_at: new Date().toISOString(),
    }

    let result
    if (initial?.id) {
      result = await supabase.from('products').update(payload).eq('id', initial.id)
    } else {
      result = await supabase.from('products').insert(payload)
    }

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* 1. Basic Info */}
      <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] space-y-4">
        <h2 className="font-bold text-[var(--color-text)]">মূল তথ্য (Basic Info)</h2>
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Product Name *</label>
          <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="যেমন: Men's Cotton T-Shirt" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Slug (URL) *</label>
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Description (বিবরণ)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            placeholder="পণ্য সম্পর্কে বিস্তারিত বিবরণ লিখুন..."
            className="w-full px-3 py-2 rounded-lg border bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
            style={{ borderColor: 'var(--color-border)' }}
          />
        </div>
      </div>

      {/* 2. Clothing Sizes Selection (NEW) */}
      <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[var(--color-text)] flex items-center gap-2">
              <span>👕</span> কাপড়ের সাইজ ভ্যারিয়েন্ট (Clothing Sizes)
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              যদি পণ্যটির বিভিন্ন সাইজ থাকে (পোশাক/জুতা), তবে নিচের সাইজগুলো নির্বাচন করুন
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasSizes}
              onChange={(e) => {
                setHasSizes(e.target.checked)
                if (!e.target.checked) setSelectedSizes([])
              }}
              className="w-4 h-4 rounded text-[var(--color-primary)] cursor-pointer"
            />
            <span style={{ color: 'var(--color-text)' }}>সাইজ অপশন চালু করুন</span>
          </label>
        </div>

        {hasSizes && (
          <div className="space-y-3 pt-3 border-t border-[var(--color-border)]">
            <div>
              <label className="block text-xs font-bold mb-2 text-[var(--color-text)]">
                কমন সাইজ নির্বাচন করুন (ক্লিক করে সিলেক্ট করুন):
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SIZES.map((size) => {
                  const isSelected = selectedSizes.includes(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 active:scale-95"
                      style={{
                        background: isSelected ? 'var(--color-primary)' : 'var(--color-background)',
                        color: isSelected ? 'white' : 'var(--color-text)',
                        borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                      }}
                    >
                      {isSelected && <Check size={12} />}
                      <span>{size}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Custom size input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomSize()
                  }
                }}
                placeholder="অন্য কোনো সাইজ লিখুন (যেমন: 28, 30, 32...)"
                className="px-3 py-2 rounded-lg border text-xs bg-[var(--color-background)] text-[var(--color-text)] flex-1 max-w-xs focus:outline-none focus:border-[var(--color-primary)]"
                style={{ borderColor: 'var(--color-border)' }}
              />
              <button
                type="button"
                onClick={addCustomSize}
                className="px-3.5 py-2 rounded-lg text-xs font-bold border transition-colors hover:bg-[var(--color-surface-hover)]"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  background: 'var(--color-surface)',
                }}
              >
                + সাইজ যোগ করুন
              </button>
            </div>

            {/* Current selected sizes chips */}
            {selectedSizes.length > 0 && (
              <div className="p-3 rounded-lg border text-xs space-y-1.5" style={{ background: 'var(--color-background)', borderColor: 'var(--color-border)' }}>
                <span className="font-bold text-[var(--color-text)]">
                  নির্বাচিত সাইজসমূহ ({selectedSizes.length}টি):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSizes.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-white text-[11px]"
                      style={{ background: 'var(--color-primary)' }}
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => toggleSize(s)}
                        className="hover:opacity-75 ml-0.5"
                        title="রিমুভ করুন"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Pricing, Stock & Automatic SKU */}
      <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] space-y-4">
        <h2 className="font-bold text-[var(--color-text)]">মূল্য, স্টক ও SKU</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Price (৳) *</label>
            <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Compare Price (৳)</label>
            <Input type="number" step="0.01" value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Stock *</label>
            <Input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} required />
          </div>
        </div>

        {/* Automatic Sequential SKU */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-[var(--color-text)]">
              SKU (প্রোডাক্ট কোড) *
            </label>
            <button
              type="button"
              onClick={generateNextSku}
              disabled={generatingSku}
              className="text-xs font-bold px-3 py-1 rounded-md transition-all flex items-center gap-1.5 active:scale-95"
              style={{
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
              }}
            >
              <Sparkles size={12} />
              {generatingSku ? 'সিরিয়াল জেনারেট হচ্ছে...' : '⚡ পরবর্তী অটো-সিরিয়াল SKU তৈরি করুন'}
            </button>
          </div>
          <div className="relative">
            <Input
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="MZ10011"
              required
            />
            {form.sku && (
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-2 py-0.5 rounded border"
                style={{
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  borderColor: 'var(--color-primary)',
                }}
              >
                সিরিয়াল: {form.sku}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5">
            নতুন পণ্য যোগ করার সময় SKU স্বয়ংক্রিয়ভাবে সিরিয়াল অনুযায়ী বসে যায়। আপনি চাইলে ম্যানুয়ালি পরিবর্তনও করতে পারেন।
          </p>
        </div>
      </div>

      {/* 4. Product Images */}
      <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] space-y-4">
        <h2 className="font-bold text-[var(--color-text)]">পণ্যের ছবি *</h2>
        <p className="text-xs text-[var(--color-text-muted)]">প্রথম ছবি = মূল ছবি (product card-এ দেখাবে)</p>
        <ImageUpload images={images} onChange={setImages} maxImages={5} />
      </div>

      {/* 5. Category & Status */}
      <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] space-y-4">
        <h2 className="font-bold text-[var(--color-text)]">ক্যাটাগরি, জেন্ডার ও স্ট্যাটাস</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* Main Category */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
              Category (মূল ক্যাটাগরি) *
            </label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <option value="">— Select Category —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Gender / Target Category (Male / Female) */}
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
              জেন্ডার ক্যাটাগরি (Gender: Male, Female)
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <option value="">— প্রযোজ্য নয় / সবার জন্য (Any / All) —</option>
              <option value="male">👨 পুরুষ (Male / Men)</option>
              <option value="female">👩 মহিলা (Female / Women)</option>
              <option value="unisex">👫 ইউনিসেক্স (Unisex / Both)</option>
              <option value="kids">👶 বাচ্চাদের (Kids)</option>
            </select>
          </div>
        </div>

        {/* Quick Gender Select Buttons */}
        <div className="flex items-center gap-2 pt-0.5 flex-wrap">
          <span className="text-xs text-gray-500 font-semibold">কুইক জেন্ডার সিলেক্ট:</span>
          {[
            { id: 'male', label: '👨 Male (পুরুষ)' },
            { id: 'female', label: '👩 Female (মহিলা)' },
            { id: 'unisex', label: '👫 Unisex' },
            { id: '', label: 'মুছে ফেলুন (None)' },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGender(g.id)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                gender === g.id
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold'
                  : 'border-[var(--color-border)] text-gray-600 hover:border-gray-400'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text)]">
            <input type="radio" checked={form.status === 'active'} onChange={() => setForm({ ...form, status: 'active' })} />
            Active
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text)]">
            <input type="radio" checked={form.status === 'draft'} onChange={() => setForm({ ...form, status: 'draft' })} />
            Draft
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text)]">
            <input type="radio" checked={form.status === 'out_of_stock'} onChange={() => setForm({ ...form, status: 'out_of_stock' })} />
            Out of Stock
          </label>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text)]">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          Featured Product (হোমপেজে বিশেষ প্রদর্শন)
        </label>
      </div>

      {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">{error}</div>}

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? 'সংরক্ষণ হচ্ছে...' : initial?.id ? 'Update Product' : 'Create Product'}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
