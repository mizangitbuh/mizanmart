import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════
// GET /api/reviews?productId=X
// Returns: approved reviews + average rating + count
// ═══════════════════════════════════════════════
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')

  if (!productId) {
    return NextResponse.json({ error: 'productId required' }, { status: 400 })
  }

  const supabase = await createClient()

  // Fetch approved reviews with user's display name
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(
      'id, rating, title, body, order_id, created_at, user_id, profiles(full_name)'
    )
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const list = reviews || []
  const count = list.length
  const avg =
    count > 0
      ? list.reduce((sum, r) => sum + Number(r.rating), 0) / count
      : 0

  // Distribution (5★ to 1★)
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: list.filter((r) => r.rating === star).length,
  }))

  return NextResponse.json({
    reviews: list,
    stats: {
      average: Math.round(avg * 10) / 10,
      count,
      distribution,
    },
  })
}

// ═══════════════════════════════════════════════
// POST /api/reviews
// Body: { product_id, rating, title?, body? }
// ═══════════════════════════════════════════════
const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).nullable().optional(),
  body: z.string().max(2000).nullable().optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Please sign in to write a review', code: 'AUTH_REQUIRED' },
      { status: 401 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.issues },
      { status: 400 }
    )
  }

  const { product_id, rating, title, body: reviewBody } = parsed.data

  // Check for existing review (UNIQUE constraint would fail anyway, but nicer error)
  const { data: existing } = await supabase
    .from('reviews')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      {
        error:
          existing.status === 'approved'
            ? 'You already reviewed this product'
            : 'You already have a pending review for this product',
        existing_status: existing.status,
      },
      { status: 409 }
    )
  }

  // Verified purchase check — find a delivered order containing this product
  const { data: verifiedOrder } = await supabase
    .from('orders')
    .select('id, order_items!inner(product_id)')
    .eq('user_id', user.id)
    .eq('status', 'delivered')
    .eq('order_items.product_id', product_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const orderId = verifiedOrder?.id || null

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      product_id,
      user_id: user.id,
      order_id: orderId,
      rating,
      title: title || null,
      body: reviewBody || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    review,
    verified: !!orderId,
    message: 'Review submitted. It will appear after admin approval.',
  })
}
