import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Megaphone, Plus, ArrowLeft, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Status = 'draft' | 'sending' | 'sent' | 'failed'

const statusVariant: Record<Status, 'default' | 'info' | 'success' | 'danger'> = {
  draft: 'default',
  sending: 'info',
  sent: 'success',
  failed: 'danger',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'এখনই'
  if (mins < 60) return `${mins} মিনিট আগে`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ঘণ্টা আগে`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} দিন আগে`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

interface Campaign {
  id: string
  subject: string
  status: Status
  recipient_count: number
  sent_count: number
  failed_count: number
  created_at: string
  sent_at: string | null
}

export default async function CampaignsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('newsletter_campaigns')
    .select('id, subject, status, recipient_count, sent_count, failed_count, created_at, sent_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const list = ((data || []) as unknown) as Campaign[]

  return (
    <div className="max-w-4xl space-y-5">
      <Link
        href="/admin/newsletter"
        className="inline-flex items-center gap-2 text-sm hover:opacity-80 transition"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft size={16} /> Subscribers
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-white"
            style={{ background: 'var(--color-primary)' }}
          >
            <Megaphone size={20} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black" style={{ color: 'var(--color-text)' }}>
              Campaigns
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              ইমেইল ক্যাম্পেইন — {list.length} টি
            </p>
          </div>
        </div>
        <Link
          href="/admin/newsletter/campaigns/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-md)] text-xs font-bold text-white transition hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}
        >
          <Plus size={14} />
          New Campaign
        </Link>
      </div>

      {list.length === 0 ? (
        <div
          className="p-10 rounded-[var(--radius-lg)] border text-center"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <Megaphone size={36} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
          <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
            এখনো কোনো campaign নেই
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            New Campaign বাটনে ক্লিক করে প্রথম ইমেইল তৈরি করুন
          </p>
        </div>
      ) : (
        <div
          className="rounded-[var(--radius-lg)] border overflow-hidden"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {list.map((c) => (
            <Link
              key={c.id}
              href={`/admin/newsletter/campaigns/${c.id}`}
              className="flex items-center gap-3 px-4 py-3.5 border-b last:border-b-0 transition-colors hover:bg-[var(--color-surface-hover)]"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                    {c.subject}
                  </span>
                  <Badge variant={statusVariant[c.status]} size="sm">
                    {c.status}
                  </Badge>
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {c.status === 'draft'
                    ? `Draft • ${timeAgo(c.created_at)}`
                    : `${c.sent_count}/${c.recipient_count} sent${c.failed_count > 0 ? ` • ${c.failed_count} failed` : ''} • ${timeAgo(c.sent_at || c.created_at)}`}
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
