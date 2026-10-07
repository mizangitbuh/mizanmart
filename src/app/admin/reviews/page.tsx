import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ReviewsTable, type AdminReview } from '@/components/admin/ReviewsTable'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ status?: string }>
}

const tabs = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' },
] as const

export default async function AdminReviewsPage({ searchParams }: Props) {
  const params = await searchParams
  const activeTab = (params.status || 'pending') as typeof tabs[number]['key']
  const supabase = await createClient()

  // ─── Tab counts ───
  const [pendingRes, approvedRes, rejectedRes, allRes] = await Promise.all([
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }),
  ])

  const counts = {
    pending: pendingRes.count || 0,
    approved: approvedRes.count || 0,
    rejected: rejectedRes.count || 0,
    all: allRes.count || 0,
  }

  // ─── Fetch reviews (no profiles join — no direct FK) ───
  let query = supabase
    .from('reviews')
    .select('id, product_id, user_id, order_id, rating, title, body, status, admin_note, created_at, updated_at, products(id, name, slug)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (activeTab !== 'all') {
    query = query.eq('status', activeTab)
  }

  const { data: reviews, error: reviewsError } = await query

  if (reviewsError) {
    console.error('[admin/reviews] reviews query failed:', reviewsError)
  }

  const rawReviews = (reviews || []) as any[]

  // ─── Fetch profiles for unique user_ids ───
  const userIds = [...new Set(rawReviews.map((r) => r.user_id).filter(Boolean))]
  let profileMap: Record<string, { full_name: string | null; email: string | null }> = {}

  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds)

    if (profilesError) {
      console.error('[admin/reviews] profiles fetch failed:', profilesError)
    } else {
      profileMap = Object.fromEntries(
        (profiles || []).map((p: any) => [
          p.id,
          { full_name: p.full_name, email: p.email },
        ])
      )
    }
  }

  // ─── Merge ───
  const list: AdminReview[] = rawReviews.map((r) => ({
    id: r.id,
    product_id: r.product_id,
    user_id: r.user_id,
    order_id: r.order_id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    status: r.status,
    admin_note: r.admin_note,
    created_at: r.created_at,
    profiles: profileMap[r.user_id] || null,
    products: r.products || null,
  }))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black mb-1" style={{ color: 'var(--color-text)' }}>
          Reviews
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Moderate customer reviews before they appear publicly
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const active = activeTab === tab.key
          const count = counts[tab.key]
          return (
            <Link
              key={tab.key}
              href={`/admin/reviews?status=${tab.key}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] text-sm font-semibold transition border"
              style={{
                background: active ? 'var(--color-primary-light)' : 'var(--color-surface)',
                borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                color: active ? 'var(--color-primary)' : 'var(--color-text)',
              }}
            >
              {tab.label}
              <span
                className="text-[10px] font-black px-1.5 py-0.5 rounded"
                style={{
                  background: active ? 'var(--color-primary)' : 'var(--color-border)',
                  color: active ? 'white' : 'var(--color-text-muted)',
                }}
              >
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Table */}
      <ReviewsTable reviews={list} />
    </div>
  )
}
