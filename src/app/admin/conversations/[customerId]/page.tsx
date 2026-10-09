import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ThreadView, type ThreadMsg } from '@/components/admin/ThreadView'
import { ArrowLeft, User, Phone, Mail, Package } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ customerId: string }>
  searchParams: Promise<{ order?: string }>
}

export default async function ThreadPage({ params, searchParams }: Props) {
  const { customerId } = await params
  const { order: focusOrderId } = await searchParams
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, created_at')
    .eq('id', customerId)
    .single()

  const THREAD_FULL = 'id, customer_id, order_id, sender_role, body, read_at, created_at, thread_resolved_at'
  const THREAD_BASE = 'id, customer_id, order_id, sender_role, body, read_at, created_at'
  let msgs: ThreadMsg[] = []
  {
    const attempt = await supabase
      .from('messages')
      .select(THREAD_FULL)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: true })
      .limit(300)
    if (attempt.error && /thread_resolved_at|column/i.test(attempt.error.message)) {
      const retry = await supabase
        .from('messages')
        .select(THREAD_BASE)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: true })
        .limit(300)
      msgs = ((retry.data || []) as unknown) as ThreadMsg[]
    } else {
      msgs = ((attempt.data || []) as unknown) as ThreadMsg[]
    }
  }

  if (!profile && msgs.length === 0) notFound()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, total, created_at')
    .eq('user_id', customerId)
    .order('created_at', { ascending: false })
    .limit(10)

  const focusOrderNumber = focusOrderId
    ? ((orders || []).find((o: any) => o.id === focusOrderId) as any)?.order_number ?? null
    : null

  return (
    <div className="max-w-6xl space-y-5">
      <Link
        href="/admin/conversations"
        className="inline-flex items-center gap-2 text-sm hover:opacity-80 transition"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft size={16} /> Back to Inbox
      </Link>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Customer info sidebar */}
        <div className="space-y-4">
          <div
            className="p-5 rounded-[var(--radius-lg)] border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-white"
                style={{ background: 'var(--color-primary)' }}
              >
                {(profile?.full_name?.[0] || profile?.email?.[0] || '?').toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                  {profile?.full_name || 'Customer'}
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                  {profile?.email}
                </div>
              </div>
            </div>
            <div className="space-y-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {profile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={12} /> {profile.phone}
                </div>
              )}
              {profile?.email && (
                <div className="flex items-center gap-2">
                  <Mail size={12} /> {profile.email}
                </div>
              )}
              <div className="flex items-center gap-2">
                <User size={12} />
                Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB') : '—'}
              </div>
            </div>
          </div>

          {/* Recent orders */}
          <div
            className="p-5 rounded-[var(--radius-lg)] border"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            <h3 className="font-black text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <Package size={15} style={{ color: 'var(--color-primary)' }} />
              Recent Orders ({orders?.length || 0})
            </h3>
            {(orders || []).length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>কোনো অর্ডার নেই</p>
            ) : (
              <div className="space-y-2">
                {(orders || []).map((o: any) => (
                  <Link
                    key={o.id}
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] border text-xs transition hover:opacity-80"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <span className="font-mono font-bold" style={{ color: 'var(--color-text)' }}>
                      {o.order_number}
                    </span>
                    <Badge variant="info" size="sm">{o.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div
          className="lg:col-span-2 rounded-[var(--radius-lg)] border overflow-hidden"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
              {profile?.full_name || profile?.email || 'Customer'} এর সাথে চ্যাট
            </div>
            <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {(msgs || []).length} টি মেসেজ • রিয়েল-টাইম
            </div>
          </div>
          <ThreadView
            customerId={customerId}
            initialMessages={(msgs || []) as ThreadMsg[]}
            focusOrderId={focusOrderId ?? null}
            focusOrderNumber={focusOrderNumber}
          />
        </div>
      </div>
    </div>
  )
}
