'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, AlertTriangle, RotateCcw } from 'lucide-react'

type State = 'loading' | 'done' | 'error'

/**
 * Public unsubscribe page — token in URL.
 * Auto-unsubscribes on mount, shows Bengali confirmation.
 */
export function UnsubscribeClient({ token }: { token: string }) {
  const [state, setState] = useState<State>('loading')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch(`/api/newsletter/unsubscribe/${token}`, { method: 'POST' })
      .then(async (res) => {
        const json = (await res.json().catch(() => ({}))) as {
          success?: boolean
          email?: string
          error?: string
        }
        if (cancelled) return
        if (json.success) {
          setState('done')
          setEmail(json.email || '')
        } else {
          setState('error')
          setMessage(json.error || 'Link-টি valid নয়')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState('error')
          setMessage('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করুন')
        }
      })
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-16">
      <div
        className="w-full max-w-md p-8 rounded-[var(--radius-lg)] border text-center"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {state === 'loading' && (
          <>
            <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
            <h1 className="font-black text-lg" style={{ color: 'var(--color-text)' }}>
              প্রসেস হচ্ছে...
            </h1>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              আপনার request টি process করা হচ্ছে
            </p>
          </>
        )}

        {state === 'done' && (
          <>
            <CheckCircle2 size={44} className="mx-auto mb-4" style={{ color: '#16A34A' }} />
            <h1 className="font-black text-lg" style={{ color: 'var(--color-text)' }}>
              আপনি আনসাবস্ক্রাইব করেছেন
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
              {email ? (
                <>
                  <span className="font-bold" style={{ color: 'var(--color-text)' }}>{email}</span>
                  {' '}এই ঠিকানায় আর newsletter যাবে না।
                </>
              ) : (
                'আর newsletter পাঠানো হবে না।'
              )}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              You've been unsubscribed successfully.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-6">
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-bold border"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                🏠 হোমে ফিরুন
              </Link>
              <Link
                href="/#newsletter"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-bold text-white"
                style={{ background: 'var(--color-primary)' }}
              >
                <RotateCcw size={13} />
                আবার সাবস্ক্রাইব
              </Link>
            </div>
          </>
        )}

        {state === 'error' && (
          <>
            <AlertTriangle size={44} className="mx-auto mb-4" style={{ color: '#DC2626' }} />
            <h1 className="font-black text-lg" style={{ color: 'var(--color-text)' }}>
              Link-টি কাজ করছে না
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
              {message}
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-5 py-2.5 rounded-[var(--radius-md)] text-xs font-bold text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              🏠 হোমে ফিরুন
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
