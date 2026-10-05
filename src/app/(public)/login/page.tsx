'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-surface)] rounded-2xl shadow-lg border border-[var(--color-border)] p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-4">
              <span className="text-3xl font-black" style={{ color: 'var(--color-primary)' }}>
                mizan<span style={{ color: 'var(--color-text)' }}>mart</span>
              </span>
            </Link>
            <h1 className="text-2xl font-black text-[var(--color-text)]">Welcome Back</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Login to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-2 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text)] mb-2 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  placeholder="••••••••"
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
              <LogIn size={16} />
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-[var(--color-text-muted)]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[var(--color-primary)] hover:underline font-bold">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
