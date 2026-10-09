'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Send, Loader2, CheckCircle2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
export interface ThreadMsg {
  id: string
  customer_id: string
  order_id: string | null
  sender_role: 'customer' | 'admin'
  body: string
  read_at: string | null
  created_at: string
  /** Set on the LATEST message of a thread when admin marks it resolved (migration 008). */
  thread_resolved_at?: string | null
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export function ThreadView({
  customerId,
  initialMessages,
  focusOrderId = null,
  focusOrderNumber = null,
}: {
  customerId: string
  initialMessages: ThreadMsg[]
  focusOrderId?: string | null
  focusOrderNumber?: string | null
}) {
  const [messages, setMessages] = useState<ThreadMsg[]>(initialMessages)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [orderFilter, setOrderFilter] = useState<string | null>(focusOrderId)
  const listRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
    })
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabaseRef.current = supabase
    const unreadIds = initialMessages
      .filter((m) => m.sender_role === 'customer' && !m.read_at)
      .map((m) => m.id)
    if (unreadIds.length > 0) {
      const now = new Date().toISOString()
      supabase.from('messages').update({ read_at: now }).in('id', unreadIds).then()
      setMessages((prev) =>
        prev.map((m) => (unreadIds.includes(m.id) ? { ...m, read_at: now } : m))
      )
    }
    scrollToBottom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const supabase = supabaseRef.current ?? createClient()
    supabaseRef.current = supabase
    const channel = supabase
      .channel(`admin-thread-${customerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          const msg = payload.new as ThreadMsg
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev
            return [...prev, msg]
          })
          if (msg.sender_role === 'customer') {
            supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', msg.id).then()
          }
          scrollToBottom()
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [customerId, scrollToBottom])


  useEffect(() => {
    scrollToBottom()
  }, [messages.length, scrollToBottom])

  // Resolved state: latest message in the (filtered or whole) thread carries the flag
  const scopeMessages = orderFilter
    ? messages.filter((m) => m.order_id === orderFilter)
    : messages
  const latestInScope = scopeMessages[scopeMessages.length - 1]
  const isResolved = !!latestInScope?.thread_resolved_at

  const toggleResolve = async () => {
    const supabase = supabaseRef.current
    if (!supabase || !latestInScope || resolving) return
    setResolving(true)
    try {
      const value = isResolved ? null : new Date().toISOString()
      const { error } = await supabase
        .from('messages')
        .update({ thread_resolved_at: value })
        .eq('id', latestInScope.id)
      if (error) throw error
      setMessages((prev) =>
        prev.map((m) =>
          m.id === latestInScope.id ? { ...m, thread_resolved_at: value } : m
        )
      )
      toast.success(isResolved ? 'থ্রেড আবার খোলা হয়েছে' : 'থ্রেড সমাধান হিসেবে চিহ্নিত ✓')
    } catch (err) {
      console.error('[admin-thread] resolve failed:', err)
      toast.error('আপডেট করা যায়নি — migration 008 চালানো হয়েছে কি?')
    } finally {
      setResolving(false)
    }
  }

  const handleSend = async () => {
    const text = draft.trim()
    if (!text || sending) return
    if (text.length > 2000) {
      toast.error('মেসেজ অনেক বড় (সর্বোচ্চ ২০০০ অক্ষর)')
      return
    }
    const supabase = supabaseRef.current
    if (!supabase) return
    setSending(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({ customer_id: customerId, order_id: orderFilter, sender_role: 'admin', body: text })
        .select('id, customer_id, order_id, sender_role, body, read_at, created_at')
        .single()
      if (error) throw error
      setMessages((prev) => {
        if (prev.some((m) => m.id === (data as ThreadMsg).id)) return prev
        return [...prev, data as ThreadMsg]
      })
      setDraft('')
      scrollToBottom()
    } catch (err) {
      console.error('[admin-thread] send failed:', err)
      toast.error('রিপ্লাই পাঠানো যায়নি — আবার চেষ্টা করুন')
    } finally {
      setSending(false)
    }
  }

  const visibleMessages = orderFilter
    ? messages.filter((m) => m.order_id === orderFilter)
    : messages

  return (
    <div className="flex flex-col h-[60vh] min-h-[420px]">
      {/* Resolve toolbar */}
      <div
        className="flex items-center justify-between gap-2 px-4 py-2 border-b text-xs"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
      >
        <span className="font-bold" style={{ color: isResolved ? '#15803d' : 'var(--color-text-muted)' }}>
          {isResolved ? '✓ Resolved (সমাধান হয়েছে)' : '● Open (চলমান)'}
        </span>
        {latestInScope && (
          <button
            onClick={toggleResolve}
            disabled={resolving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] font-bold border transition hover:opacity-80 disabled:opacity-50"
            style={{
              borderColor: isResolved ? 'var(--color-border)' : '#16a34a',
              color: isResolved ? 'var(--color-text)' : '#16a34a',
              background: 'transparent',
            }}
          >
            {resolving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : isResolved ? (
              <RotateCcw size={12} />
            ) : (
              <CheckCircle2 size={12} />
            )}
            {isResolved ? 'Reopen' : 'Mark Resolved'}
          </button>
        )}
      </div>
      {orderFilter && (
        <div
          className="flex items-center justify-between gap-2 px-4 py-2 border-b text-xs"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)' }}
        >
          <span className="font-bold truncate" style={{ color: 'var(--color-text)' }}>
            Order: {focusOrderNumber && orderFilter === focusOrderId ? focusOrderNumber : orderFilter.slice(0, 8)} নিয়ে চ্যাট
          </span>
          <button
            onClick={() => setOrderFilter(null)}
            className="font-bold hover:underline flex-shrink-0"
            style={{ color: 'var(--color-primary)' }}
          >
            সব দেখুন
          </button>
        </div>
      )}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {visibleMessages.length === 0 ? (
          <p className="text-center text-sm py-8" style={{ color: 'var(--color-text-muted)' }}>
            {orderFilter ? 'এই অর্ডার নিয়ে এখনো কোনো মেসেজ নেই' : 'এখনো কোনো মেসেজ নেই'}
          </p>
        ) : (
          visibleMessages.map((m) => {
            const mine = m.sender_role === 'admin'
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${mine ? 'rounded-br-md text-white' : 'rounded-bl-md border'}`}
                  style={
                    mine
                      ? { background: 'var(--color-primary)' }
                      : { background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }
                  }
                >
                  <div className="whitespace-pre-wrap break-words">{m.body}</div>
                  <div className={`text-[10px] mt-1 ${mine ? 'text-white/70 text-right' : ''}`}
                    style={mine ? undefined : { color: 'var(--color-text-muted)' }}>
                    {formatTime(m.created_at)}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
      <div className="flex items-center gap-2 px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="রিপ্লাই লিখুন… (Enter = পাঠান)"
          maxLength={2000}
          disabled={sending}
          className="flex-1 px-3 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none disabled:opacity-60"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)' }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !draft.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-50"
          style={{ background: 'var(--color-primary)' }}
          aria-label="Send reply"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  )
}
