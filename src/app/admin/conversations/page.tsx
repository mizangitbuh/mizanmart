import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ConversationsList } from '@/components/admin/ConversationsList'
import { MessageSquare } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ filter?: string; q?: string }>
}

interface ThreadRow {
  customer_id: string
  full_name: string | null
  email: string | null
  phone: string | null
  last_body: string
  last_at: string
  last_role: 'customer' | 'admin'
  unread: number
  resolved: boolean
}

export default async function ConversationsPage({ searchParams }: Props) {
  const params = await searchParams
  const filter = params.filter === 'unread' ? 'unread' : params.filter === 'resolved' ? 'resolved' : 'all'
  const q = (params.q || '').trim().toLowerCase()
  const supabase = await createClient()

  // Fetch recent messages (cap 500, enough to derive threads)
  // Graceful fallback: thread_resolved_at needs migration 008
  const FULL_COLS = 'customer_id, sender_role, body, read_at, created_at, thread_resolved_at'
  const BASE_COLS = 'customer_id, sender_role, body, read_at, created_at'
  interface MsgRow {
    customer_id: string
    sender_role: 'customer' | 'admin'
    body: string
    read_at: string | null
    created_at: string
    thread_resolved_at?: string | null
  }
  let list: MsgRow[] = []
  {
    const attempt = await supabase
      .from('messages')
      .select(FULL_COLS)
      .order('created_at', { ascending: false })
      .limit(500)
    if (attempt.error && /thread_resolved_at|column/i.test(attempt.error.message)) {
      const retry = await supabase
        .from('messages')
        .select(BASE_COLS)
        .order('created_at', { ascending: false })
        .limit(500)
      list = ((retry.data || []) as unknown) as MsgRow[]
    } else {
      list = ((attempt.data || []) as unknown) as MsgRow[]
    }
  }

  // Group by customer_id → thread summary
  const map = new Map<string, ThreadRow>()
  for (const m of list) {
    const existing = map.get(m.customer_id)
    if (!existing) {
      map.set(m.customer_id, {
        customer_id: m.customer_id,
        full_name: null,
        email: null,
        phone: null,
        last_body: m.body,
        last_at: m.created_at,
        last_role: m.sender_role,
        unread: m.sender_role === 'customer' && !m.read_at ? 1 : 0,
        resolved: !!m.thread_resolved_at,
      })
    } else if (m.sender_role === 'customer' && !m.read_at) {
      existing.unread += 1
    }
  }

  let threads = Array.from(map.values())

  // Attach profile info
  if (threads.length > 0) {
    const ids = threads.map((t) => t.customer_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', ids)
    const pmap = new Map((profiles || []).map((p: any) => [p.id as string, p]))
    threads = threads.map((t) => {
      const p = pmap.get(t.customer_id) as any
      return { ...t, full_name: p?.full_name ?? null, email: p?.email ?? null, phone: p?.phone ?? null }
    })
  }

  // Filters
  if (filter === 'unread') threads = threads.filter((t) => t.unread > 0)
  if (filter === 'resolved') threads = threads.filter((t) => t.resolved)
  if (q) {
    threads = threads.filter(
      (t) =>
        t.full_name?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.phone?.includes(q)
    )
  }

  // Already sorted by last_at desc (messages came desc, first-seen wins)
  const totalUnread = Array.from(map.values()).reduce((s, t) => s + t.unread, 0)

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          <MessageSquare size={20} />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black" style={{ color: 'var(--color-text)' }}>
            Support Conversations
          </h1>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            সাপোর্ট চ্যাট ইনবক্স — {threads.length} টি থ্রেড
            {totalUnread > 0 && ` • ${totalUnread} টি অপঠিত`}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/conversations"
          className="px-4 py-2 text-xs font-bold rounded-[var(--radius-md)] transition-colors border"
          style={{
            background: filter === 'all' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: filter === 'all' ? 'white' : 'var(--color-text)',
            borderColor: 'var(--color-border)',
          }}
        >
          All ({map.size})
        </Link>
        <Link
          href="/admin/conversations?filter=unread"
          className="px-4 py-2 text-xs font-bold rounded-[var(--radius-md)] transition-colors border"
          style={{
            background: filter === 'unread' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: filter === 'unread' ? 'white' : 'var(--color-text)',
            borderColor: 'var(--color-border)',
          }}
        >
          Unread ({totalUnread})
        </Link>
        <Link
          href="/admin/conversations?filter=resolved"
          className="px-4 py-2 text-xs font-bold rounded-[var(--radius-md)] transition-colors border"
          style={{
            background: filter === 'resolved' ? 'var(--color-primary)' : 'var(--color-surface)',
            color: filter === 'resolved' ? 'white' : 'var(--color-text)',
            borderColor: 'var(--color-border)',
          }}
        >
          ✓ Resolved
        </Link>

        {/* Search */}
        <form action="/admin/conversations" method="GET" className="flex-1 min-w-[200px]">
          {filter !== 'all' && <input type="hidden" name="filter" value={filter} />}
          <input
            type="text"
            name="q"
            defaultValue={params.q || ''}
            placeholder="Search name, email, phone…"
            className="w-full px-3 py-2 text-sm rounded-[var(--radius-md)] border focus:outline-none"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-background)',
              color: 'var(--color-text)',
            }}
          />
        </form>
      </div>

      <ConversationsList threads={threads} />
    </div>
  )
}
