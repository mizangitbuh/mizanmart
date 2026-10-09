import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CampaignSendButton } from '@/components/admin/CampaignSendButton'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

type Status = 'draft' | 'sending' | 'sent' | 'failed'

export default async function CampaignViewPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('newsletter_campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) notFound()
  const c = data as {
    id: string
    subject: string
    body_html: string
    body_text: string | null
    status: Status
    recipient_count: number
    sent_count: number
    failed_count: number
    created_at: string
    sent_at: string | null
  }

  const { count: activeCount } = await supabase
    .from('newsletter_subscribers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  const variant: Record<Status, 'default' | 'info' | 'success' | 'danger'> = {
    draft: 'default',
    sending: 'info',
    sent: 'success',
    failed: 'danger',
  }

  return (
    <div className="max-w-3xl space-y-5">
      <Link
        href="/admin/newsletter/campaigns"
        className="inline-flex items-center gap-2 text-sm hover:opacity-80 transition"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft size={16} /> Campaigns
      </Link>

      <div
        className="p-5 rounded-[var(--radius-lg)] border space-y-4"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-lg md:text-xl font-black flex-1 min-w-[200px]" style={{ color: 'var(--color-text)' }}>
            {c.subject}
          </h1>
          <Badge variant={variant[c.status]} size="md">
            {c.status}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Recipients" value={c.recipient_count} />
          <Stat label="Sent" value={c.sent_count} color="#16A34A" />
          <Stat label="Failed" value={c.failed_count} color="#DC2626" />
        </div>

        <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          Created {new Date(c.created_at).toLocaleString('en-GB')}
          {c.sent_at && ` • Sent ${new Date(c.sent_at).toLocaleString('en-GB')}`}
        </div>

        {c.status === 'draft' && (
          <CampaignSendButton campaignId={c.id} activeCount={activeCount || 0} />
        )}
      </div>

      <div
        className="rounded-[var(--radius-lg)] border overflow-hidden"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="px-4 py-3 border-b text-xs font-black" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
          EMAIL BODY PREVIEW
        </div>
        <div className="max-h-[70vh] overflow-y-auto" style={{ background: 'white' }}>
          <iframe title="Campaign body" sandbox="" srcDoc={c.body_html} className="w-full" style={{ minHeight: '480px', border: '0' }} />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="p-3 rounded-[var(--radius-md)] border" style={{ borderColor: 'var(--color-border)' }}>
      <div className="text-xl font-black" style={{ color: color || 'var(--color-text)' }}>
        {value}
      </div>
      <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </div>
    </div>
  )
}
