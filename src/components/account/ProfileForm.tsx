'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Phone, Mail, Check } from 'lucide-react'

interface Props {
  initial: {
    full_name: string
    email: string
    phone: string
  }
}

export function ProfileForm({ initial }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    full_name: initial.full_name || '',
    phone: initial.phone || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Not logged in')
      setSaving(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone,
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Full Name
        </label>
        <div className="relative">
          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <Input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="Your full name"
            className="pl-11"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Phone
        </label>
        <div className="relative">
          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="01XXXXXXXXX"
            className="pl-11"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Email
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <Input
            value={initial.email}
            disabled
            className="pl-11 opacity-60 cursor-not-allowed"
          />
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Email cannot be changed
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-[var(--radius-md)]">
          {error}
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 text-sm p-3 rounded-[var(--radius-md)]"
             style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
          <Check size={16} />
          Profile updated successfully
        </div>
      )}

      <Button type="submit" disabled={saving} size="lg">
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}
