import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET — list user's wishlist (with product data for wishlist page)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('wishlists')
    .select(
      'id, product_id, created_at, products(id, name, slug, price, compare_price, images, stock_quantity, status)'
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: data ?? [] })
}

// POST — toggle wishlist for a product
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Please sign in to save items', code: 'AUTH_REQUIRED' },
      { status: 401 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const productId = body?.product_id

  if (!productId || typeof productId !== 'string') {
    return NextResponse.json({ error: 'product_id required' }, { status: 400 })
  }

  // Check existing
  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', existing.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ wishlisted: false })
  }

  const { error } = await supabase
    .from('wishlists')
    .insert({ user_id: user.id, product_id: productId })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ wishlisted: true })
}
