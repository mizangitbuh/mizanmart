import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CampaignForm } from '@/components/admin/CampaignForm'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function NewCampaignPage() {
  const supabase = await createClient()
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { count: activeCount } = await supabase
    .from('newsletter_subscribers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: new30Count } = await supabase
    .from('newsletter_subscribers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active')
    .gte('subscribed_at', cutoff)

  return (
    <div className="max-w-3xl space-y-5">
      <Link
        href="/admin/newsletter/campaigns"
        className="inline-flex items-center gap-2 text-sm hover:opacity-80 transition"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft size={16} /> Campaigns
      </Link>
      <div>
        <h1 className="text-xl md:text-2xl font-black" style={{ color: 'var(--color-text)' }}>
          New Campaign
        </h1>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          নতুন ইমেইল তৈরি করুন — preview দেখে তারপর পাঠান
        </p>
      </div>
      <CampaignForm activeCount={activeCount || 0} new30Count={new30Count || 0} />
    </div>
  )
}
