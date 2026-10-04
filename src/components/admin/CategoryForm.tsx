'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { slugify } from '@/lib/utils'

interface Props { initial?: any }

export function CategoryForm({ initial }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: initial?.name || '',
    slug: initial?.slug || '',
    description: initial?.description || '',
    sort_order: initial?.sort_order ?? 0,
  })

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: f.slug || slugify(name) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      sort_order: Number(form.sort_order),
    }

    const result = initial?.id
      ? await supabase.from('categories').update(payload).eq('id', initial.id)
      : await supabase.from('categories').insert(payload)

    if (result.error) {
      setError(result.error.message)
      setLoading(false)
      return
    }

    router.push('/admin/categories')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium mb-2">Category Name *</label>
        <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Slug *</label>
        <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Sort Order</label>
        <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
      </div>

      {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">{error}</div>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : initial?.id ? 'Update' : 'Create'}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  )
}
