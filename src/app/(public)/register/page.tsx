'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, Lock, Phone, UserPlus } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Send welcome email (best-effort, non-blocking)
    try {
      await fetch('/api/auth/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (emailErr) {
      console.error('[register] Welcome email failed:', emailErr)
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-lg border border-[var(--color-border)] p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4"><Logo href="/" variant="stacked" height={48} /></div>
            <h1 className="text-2xl font-black text-[var(--color-text)]">Create Account</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Join martivo today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-2 uppercase tracking-wide">Full Name *</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-2 uppercase tracking-wide">Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="01XXXXXXXXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-2 uppercase tracking-wide">Email *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-2 uppercase tracking-wide">Password *</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-primary)]"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-full font-bold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-[var(--color-text-muted)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--color-primary)] hover:underline font-bold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
