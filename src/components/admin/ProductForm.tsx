'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { slugify } from '@/lib/utils'

interface Category {
  id: string
  name: string
}

interface Props {
  categories: Category[]
  initial?: any
}

export function ProductForm({ categories, initial }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: initial?.name || '',
    slug: initial?.slug || '',
    description: initial?.description || '',
    price: initial?.price || '',
    compare_price: initial?.compare_price || '',
    stock_quantity: initial?.stock_quantity ?? 0,
    category_id: initial?.category_id || '',
    status: initial?.status || 'active',
    featured: initial?.featured ?? false,
    sku: initial?.sku || '',
  })

  const [images, setImages] = useState<string[]>(initial?.images || [])

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: f.slug || slugify(name) }))
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
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      price: Number(form.price),
      compare_price: form.compare_price ? Number(form.compare_price) : null,
      stock_quantity: Number(form.stock_quantity),
      category_id: form.category_id || null,
      images,
      status: form.status,
      featured: form.featured,
      sku: form.sku || null,
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
      <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] space-y-4">
        <h2 className="font-bold text-[var(--color-text)]">Basic Info</h2>
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Product Name *</label>
          <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Slug (URL) *</label>
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border bg-[var(--color-background)] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
            style={{ borderColor: 'var(--color-border)' }}
          />
        </div>
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] space-y-4">
        <h2 className="font-bold text-[var(--color-text)]">Pricing & Stock</h2>
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
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">SKU</label>
          <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="MZ-001" />
        </div>
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] space-y-4">
        <h2 className="font-bold text-[var(--color-text)]">Product Images *</h2>
        <p className="text-xs text-[var(--color-text-muted)]">প্রথম image = main image (product card-এ দেখাবে)</p>
        <ImageUpload images={images} onChange={setImages} maxImages={5} />
      </div>

      <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] space-y-4">
        <h2 className="font-bold text-[var(--color-text)]">Category & Status</h2>
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">Category</label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border bg-[var(--color-background)] text-[var(--color-text)]"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <option value="">— Select Category —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
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
          Featured Product (home page-এ দেখাবে)
        </label>
      </div>

      {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">{error}</div>}

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? 'Saving...' : initial?.id ? 'Update Product' : 'Create Product'}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
