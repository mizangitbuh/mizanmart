'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, Send, Loader2, Headphones, ArrowLeftRight } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { useChatStore } from '@/stores/chat'

interface ChatMessage {
  id: string
  customer_id: string
  order_id: string | null
  sender_role: 'customer' | 'admin'
  body: string
  read_at: string | null
  created_at: string
  thread_resolved_at?: string | null
}

interface ChatThread {
  order_id: string | null
  order_number: string | null
  last_body: string
  last_at: string
  unread: number
}

interface ChatWidgetProps {
  orderId?: string | null
}

function ChatBubble({ mine, body, createdAt }: { mine: boolean; body: string; createdAt: string }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${mine ? 'rounded-br-md text-white' : 'rounded-bl-md border'}`}
        style={
          mine
            ? { background: 'var(--color-primary)' }
            : { background: 'var(--color-background)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }
        }
      >
        <div className="whitespace-pre-wrap break-words">{body}</div>
        <div
          className={`text-[10px] mt-1 ${mine ? 'text-white/70 text-right' : ''}`}
          style={mine ? undefined : { color: 'var(--color-text-muted)' }}
          title={new Date(createdAt).toLocaleString()}
        >
          {formatTime(createdAt)}
        </div>
      </div>
    </div>
  )
}


function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

export function ChatWidget({ orderId: orderIdProp = null }: ChatWidgetProps) {
  const pathname = usePathname()
  const storeOpen = useChatStore((s) => s.isOpen)
  const storeOrderId = useChatStore((s) => s.activeOrderId)
  const storeOrderNumber = useChatStore((s) => s.activeOrderNumber)
  const closeChat = useChatStore((s) => s.closeChat)
  const setOrder = useChatStore((s) => s.setOrder)
  // Prop takes precedence when explicitly passed; otherwise follow global store
  const activeOrderId = orderIdProp ?? storeOrderId
  const [localOpen, setLocalOpen] = useState(false)
  const open = storeOpen || localOpen
  const setOpen = (v: boolean) => {
    if (v) {
      setLocalOpen(true)
    } else {
      setLocalOpen(false)
      closeChat()
    }
  }
  const [userId, setUserId] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [orderNumberMap, setOrderNumberMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: 'smooth',
      })
    })
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabaseRef.current = supabase
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null)
      setAuthChecked(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUserId(session?.user?.id ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  const fetchMessages = useCallback(async (uid: string) => {
    const supabase = supabaseRef.current
    if (!supabase) return
    setLoading(true)
    try {
      const currentOrderId = useChatStore.getState().activeOrderId ?? orderIdProp
      const cols = 'id, customer_id, order_id, sender_role, body, read_at, created_at, thread_resolved_at'
      const fallbackCols = 'id, customer_id, order_id, sender_role, body, read_at, created_at'
      const buildQuery = (columns: string) => {
        let q = supabase
          .from('messages')
          .select(columns)
          .eq('customer_id', uid)
          .order('created_at', { ascending: true })
          .limit(200)
        if (currentOrderId) q = q.eq('order_id', currentOrderId)
        else q = q.is('order_id', null)
        return q
      }
      let { data, error } = await buildQuery(cols)
      if (error && /thread_resolved_at|column/i.test(error.message)) {
        // Migration 008 not run yet — fall back to base columns
        const retry = await buildQuery(fallbackCols)
        data = retry.data as typeof data
        error = retry.error
      }
      if (error) throw error
      setMessages(((data ?? []) as unknown) as ChatMessage[])

      const { data: all } = await supabase
        .from('messages')
        .select('order_id, sender_role, body, read_at, created_at')
        .eq('customer_id', uid)
        .order('created_at', { ascending: false })
        .limit(300)
      const map = new Map<string, ChatThread>()
      for (const m of ((all ?? []) as Array<{ order_id: string | null; sender_role: 'customer' | 'admin'; body: string; read_at: string | null; created_at: string }>)) {
        const key = m.order_id ?? '__general__'
        const existing = map.get(key)
        if (!existing) {
          map.set(key, {
            order_id: m.order_id,
            order_number: null,
            last_body: m.body,
            last_at: m.created_at,
            unread: m.sender_role === 'admin' && !m.read_at ? 1 : 0,
          })
        } else if (m.sender_role === 'admin' && !m.read_at) {
          existing.unread += 1
        }
      }
      const threadList = Array.from(map.values())
      setThreads(threadList)
      setUnreadCount(threadList.reduce((s, t) => s + t.unread, 0))
      const orderIds = threadList.map((t) => t.order_id).filter((v): v is string => !!v)
      if (orderIds.length > 0) {
        const { data: orders } = await supabase.from('orders').select('id, order_number').in('id', orderIds)
        const numMap: Record<string, string> = {}
        for (const o of ((orders ?? []) as Array<{ id: string; order_number: string }>)) numMap[o.id] = o.order_number
        setOrderNumberMap(numMap)
        setThreads((prev) => prev.map((t) => (t.order_id && numMap[t.order_id] ? { ...t, order_number: numMap[t.order_id] } : t)))
      }
    } catch (err) {
      console.error('[chat] fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }, [orderIdProp])

  useEffect(() => {
    if (userId) fetchMessages(userId)
    else {
      setMessages([])
      setThreads([])
      setUnreadCount(0)
    }
  }, [userId, fetchMessages])

  useEffect(() => {
    if (userId) fetchMessages(userId)
  }, [storeOrderId, userId, fetchMessages])

  useEffect(() => {
    if (!userId) return
    const supabase = supabaseRef.current
    if (!supabase) return
    const channel = supabase
      .channel(`support-chat-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `customer_id=eq.${userId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage
          const currentOrderId = useChatStore.getState().activeOrderId ?? orderIdProp
          const belongsToView = currentOrderId ? msg.order_id === currentOrderId : msg.order_id === null
          if (belongsToView) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev
              return [...prev, msg]
            })
          }
          setThreads((prev) => {
            const key = msg.order_id ?? '__general__'
            const idx = prev.findIndex((t) => (t.order_id ?? '__general__') === key)
            const unreadInc = msg.sender_role === 'admin' && !msg.read_at ? 1 : 0
            if (idx === -1) {
              return [{ order_id: msg.order_id, order_number: null, last_body: msg.body, last_at: msg.created_at, unread: unreadInc }, ...prev]
            }
            const next = [...prev]
            next[idx] = { ...next[idx], last_body: msg.body, last_at: msg.created_at, unread: next[idx].unread + unreadInc }
            return next
          })
          if (msg.sender_role === 'admin' && !msg.read_at) {
            setUnreadCount((c) => c + 1)
          }
          scrollToBottom()
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, orderIdProp, scrollToBottom])

  useEffect(() => {
    if (open) scrollToBottom()
  }, [open, messages.length, scrollToBottom])

  const markAsRead = useCallback(async () => {
    const supabase = supabaseRef.current
    if (!supabase || !userId) return
    const unreadIds = messages
      .filter((m) => m.sender_role === 'admin' && !m.read_at)
      .map((m) => m.id)
    if (unreadIds.length === 0) return
    try {
      await supabase.from('messages').update({ read_at: new Date().toISOString() }).in('id', unreadIds)
      const now = new Date().toISOString()
      setMessages((prev) =>
        prev.map((m) => (unreadIds.includes(m.id) ? { ...m, read_at: now } : m))
      )
      const currentOrderId = useChatStore.getState().activeOrderId ?? orderIdProp
      setThreads((prev) =>
        prev.map((t) => ((t.order_id ?? '__general__') === (currentOrderId ?? '__general__') ? { ...t, unread: 0 } : t))
      )
      setUnreadCount((c) => Math.max(0, c - unreadIds.length))
    } catch (err) {
      console.error('[chat] mark-read failed:', err)
    }
  }, [messages, userId, orderIdProp])

  useEffect(() => {
    if (open) markAsRead()
  }, [open, markAsRead])

  const handleSend = async () => {
    const text = draft.trim()
    if (!text || !userId || sending) return
    if (text.length > 2000) {
      toast.error('মেসেজ অনেক বড় (সর্বোচ্চ ২০০০ অক্ষর)')
      return
    }
    const supabase = supabaseRef.current
    if (!supabase) return
    setSending(true)
    try {
      const currentOrderId = useChatStore.getState().activeOrderId ?? orderIdProp
      const { data, error } = await supabase
        .from('messages')
        .insert({ customer_id: userId, order_id: currentOrderId, sender_role: 'customer', body: text })
        .select('id, customer_id, order_id, sender_role, body, read_at, created_at')
        .single()
      if (error) throw error
      setMessages((prev) => {
        if (prev.some((m) => m.id === (data as ChatMessage).id)) return prev
        return [...prev, data as ChatMessage]
      })
      setDraft('')
      scrollToBottom()
      fetch('/api/support/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: (data as ChatMessage).id }),
      }).catch(() => {})
    } catch (err) {
      console.error('[chat] send failed:', err)
      toast.error('মেসেজ পাঠানো যায়নি — আবার চেষ্টা করুন')
    } finally {
      setSending(false)
    }
  }

  const switchThread = (oid: string | null, onum?: string | null) => {
    setOrder(oid, onum ?? (oid && orderNumberMap[oid] ? orderNumberMap[oid] : null))
  }

  const isAdminRoute = pathname?.startsWith('/admin') ?? false
  if (!authChecked || isAdminRoute) return null

  const activeLabel = activeOrderId
    ? (storeOrderNumber || (orderNumberMap[activeOrderId] ?? `#${activeOrderId.slice(0, 8)}`))
    : 'General সাপোর্ট'

  // Stacked above FloatingSupportWidget (which sits at bottom-20/bottom-6):
  // chat sits higher so the two round buttons never overlap.
  return (
    <div className="fixed bottom-36 sm:bottom-24 right-4 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border shadow-2xl w-[calc(100vw-2rem)] max-w-[400px] h-[70vh] max-h-[600px] min-h-[420px]"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-primary)' }}
          >
            <div className="flex items-center gap-2">
              <Headphones size={18} className="text-white" />
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-2">
                  Support Chat
                  {messages.length > 0 &&
                    messages[messages.length - 1]?.thread_resolved_at && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white">
                        ✓ Resolved
                      </span>
                    )}
                </div>
                <div className="text-[11px] text-white/80">
                  {activeOrderId ? `Order ${activeLabel} • সাপোর্ট টিম শীঘ্রই উত্তর দেবে` : 'সাপোর্ট টিম শীঘ্রই উত্তর দেবে'}
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white p-1" aria-label="Close chat">
              <X size={18} />
            </button>
          </div>

          {userId && threads.length > 1 && (
            <div className="flex items-center gap-2 px-3 py-2 border-b overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
              <ArrowLeftRight size={12} className="flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              <button
                onClick={() => switchThread(null)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                style={{
                  borderColor: !activeOrderId ? 'var(--color-primary)' : 'var(--color-border)',
                  background: !activeOrderId ? 'var(--color-primary)' : 'transparent',
                  color: !activeOrderId ? 'white' : 'var(--color-text)',
                }}
              >
                General
              </button>
              {threads.filter((t) => t.order_id).map((t) => (
                <button
                  key={t.order_id}
                  onClick={() => switchThread(t.order_id, t.order_number)}
                  className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                  style={{
                    borderColor: activeOrderId === t.order_id ? 'var(--color-primary)' : 'var(--color-border)',
                    background: activeOrderId === t.order_id ? 'var(--color-primary)' : 'transparent',
                    color: activeOrderId === t.order_id ? 'white' : 'var(--color-text)',
                  }}
                >
                  {t.order_number || `#${t.order_id?.slice(0, 8)}`}{t.unread > 0 ? ` (${t.unread})` : ''}
                </button>
              ))}
            </div>
          )}

          {!userId ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <MessageCircle size={36} style={{ color: 'var(--color-text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>চ্যাট করতে প্রথমে লগইন করুন</p>
              <Link href="/login" className="px-5 py-2.5 rounded-[var(--radius-md)] font-bold text-sm text-white" style={{ background: 'var(--color-primary)' }}>
                Login করুন
              </Link>
            </div>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            </div>
          ) : (
            <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>সালাম! কিভাবে সাহায্য করতে পারি?</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>নিচে আপনার প্রশ্ন লিখুন</p>
                </div>
              ) : (
                messages.map((m) => (
                  <ChatBubble key={m.id} mine={m.sender_role === 'customer'} body={m.body} createdAt={m.created_at} />
                ))
              )}
            </div>
          )}

          {userId && (
            <div className="flex items-center gap-2 px-3 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="আপনার মেসেজ লিখুন…"
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
                aria-label="Send message"
              >
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="relative">
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 z-10">
            <Badge variant="danger" size="sm" className="rounded-full min-w-[20px] h-5">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          </span>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="w-12 h-12 rounded-full shadow-xl flex items-center justify-center text-white"
          style={{ background: 'var(--color-primary)' }}
          title="সাপোর্ট চ্যাট"
          aria-label="Support Chat"
        >
          {open ? <X size={22} /> : <MessageCircle size={24} />}
        </button>
      </div>
    </div>
  )
}


