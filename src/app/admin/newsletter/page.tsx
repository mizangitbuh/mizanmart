import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SubscribersTable, type Subscriber } from '@/components/admin/SubscribersTable'
import { KpiCard } from '@/components/admin/KpiCard'
import { Mail, Users, UserCheck, UserX, AlertTriangle, Search, X, Megaphone } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

interface Props {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}

export default async function NewsletterPage({ searchParams }: Props) {
  const params = await searchParams
  const q = (params.q || '').trim().toLowerCase()
  const status = ['active', 'unsubscribed', 'bounced'].includes(params.status || '')
    ? (params.status as string)
    : 'all'
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1)
  const supabase = await createClient()

  const { data: all } = await supabase.from('newsletter_subscribers').select('id, status')

  const rows = (all || []) as Array<{ id: string; status: string }>
  const total = rows.length
  const active = rows.filter((r) => r.status === 'active').length
  const unsubscribed = rows.filter((r) => r.status === 'unsubscribed').length
  const bounced = rows.filter((r) => r.status === 'bounced').length

  let query = supabase
    .from('newsletter_subscribers')
    .select('id, email, name, status, source, subscribed_at, unsubscribed_at, last_email_sent_at')
    .order('subscribed_at', { ascending: false })
    .limit(1000)

  if (status !== 'all') query = query.eq('status', status)

  const { data } = await query
  let list = ((data || []) as unknown) as Subscriber[]

  if (q) {
    list = list.filter(
      (s) => s.email.toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q)
    )
  }

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paged = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const sp = new URLSearchParams()
    if (params.q) sp.set('q', params.q)
    if (status !== 'all') sp.set('status', status)
    if (params.page) sp.set('page', params.page)
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === '') sp.delete(k)
      else sp.set(k, v)
    }
    const s = sp.toString()
    return `/admin/newsletter${s ? `?${s}` : ''}`
  }

  const tabs = [
    { value: 'all', label: `All (${total})` },
    { value: 'active', label: `Active (${active})` },
    { value: 'unsubscribed', label: `Unsubscribed (${unsubscribed})` },
  ]

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            <Mail size={20} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black" style={{ color: 'var(--color-text)' }}>
              Newsletter
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              সাবস্ক্রাইবার ম্যানেজমেন্ট — {total} জন
            </p>
          </div>
        </div>
        <Link
          href="/admin/newsletter/campaigns"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-bold text-white transition hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}
        >
          <Megaphone size={14} />
          Campaigns
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Total" value={total} icon={Users} color="var(--color-primary)" subtitle="All subscribers" />
        <KpiCard label="Active" value={active} icon={UserCheck} color="#16A34A" subtitle="Receiving emails" />
        <KpiCard label="Unsubscribed" value={unsubscribed} icon={UserX} color="#6B7280" subtitle="Opted out" />
        <KpiCard label="Bounced" value={bounced} icon={AlertTriangle} color="#DC2626" subtitle="Invalid emails" />
      </div>


      <div
        className="p-4 rounded-[var(--radius-lg)] border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-wrap gap-3 items-center">
          <form action="/admin/newsletter" method="GET" className="relative flex-1 min-w-[220px]">
            {status !== 'all' && <input type="hidden" name="status" value={status} />}
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              name="q"
              defaultValue={params.q || ''}
              placeholder="Search email বা name..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-[var(--radius-md)] border focus:outline-none"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-background)',
                color: 'var(--color-text)',
              }}
            />
          </form>
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => {
              const isActive = status === t.value
              return (
                <Link
                  key={t.value}
                  href={buildUrl({ status: t.value === 'all' ? undefined : t.value, page: undefined })}
                  className="px-3 py-2 text-xs font-bold rounded-[var(--radius-md)] transition-colors whitespace-nowrap"
                  style={{
                    background: isActive ? 'var(--color-primary)' : 'var(--color-background)',
                    color: isActive ? 'white' : 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {t.label}
                </Link>
              )
            })}
          </div>
          {(params.q || status !== 'all') && (
            <Link
              href="/admin/newsletter"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-[var(--radius-md)]"
              style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}
            >
              <X size={12} />
              Clear
            </Link>
          )}
        </div>
      </div>

      <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Showing {paged.length} of {list.length} subscriber{list.length !== 1 ? 's' : ''}
        {totalPages > 1 && ` • Page ${safePage}/${totalPages}`}
      </div>

      <SubscribersTable subscribers={paged} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {safePage > 1 && (
            <Link
              href={buildUrl({ page: String(safePage - 1) })}
              className="px-4 py-2 text-xs font-bold rounded-[var(--radius-md)] border"
              style={{ background: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
            >
              ← Prev
            </Link>
          )}
          <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>
            {safePage} / {totalPages}
          </span>
          {safePage < totalPages && (
            <Link
              href={buildUrl({ page: String(safePage + 1) })}
              className="px-4 py-2 text-xs font-bold rounded-[var(--radius-md)] border"
              style={{ background: 'var(--color-surface)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
