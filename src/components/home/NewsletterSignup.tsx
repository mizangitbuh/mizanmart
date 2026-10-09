'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Real newsletter signup — dark-theme compatible (footer bg is dark).
 * POSTs to /api/newsletter/subscribe.
 */
export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!EMAIL_RE.test(trimmed)) {
      toast.error('সঠিক ইমেইল দিন (valid email required)')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, name: name.trim() || undefined }),
      })
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean
        alreadySubscribed?: boolean
        error?: string
      }
      if (!res.ok || !json.success) {
        toast.error(json.error || 'সাবস্ক্রাইব করা যায়নি — আবার চেষ্টা করুন')
        return
      }
      setDone(true)
      if (json.alreadySubscribed) {
        toast.success('আপনি ইতিমধ্যে সাবস্ক্রাইবড আছেন ✓')
      } else {
        toast.success('সাবস্ক্রাইব সম্পন্ন! অফার পাবেন ইনবক্সে 🎉')
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-5">
        <CheckCircle2 size={15} />
        <span>ধন্যবাদ! আপনি সাবস্ক্রাইবড ✓</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mb-5">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="আপনার ইমেইল দিন"
          maxLength={254}
          disabled={loading}
          aria-label="Email address"
          className="flex-1 min-w-0 px-3 py-2 rounded-l text-xs focus:outline-none disabled:opacity-60"
          style={{ background: '#f3f4f6', color: '#171717' }}
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          aria-label="Subscribe"
          className="px-3 py-2 rounded-r text-white flex items-center gap-1 text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--color-primary)' }}
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          <span className="hidden sm:inline">সাবস্ক্রাইব</span>
        </button>
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="আপনার নাম (ঐচ্ছিক)"
        maxLength={100}
        disabled={loading}
        aria-label="Your name (optional)"
        className="w-full mt-2 px-3 py-1.5 rounded text-xs focus:outline-none disabled:opacity-60"
        style={{ background: '#2a2a2a', color: '#e5e5e5' }}
      />
    </form>
  )
}
