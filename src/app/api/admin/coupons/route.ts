import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function verifyAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return profile?.role === 'admin' ? user : null
}

// GET — list all coupons
export async function GET() {
  try {
    const supabase = await createClient()
    const admin = await verifyAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ coupons: data || [] })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

// POST — create coupon
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await verifyAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    const body = await request.json()
    const {
      code, description, discount_type, discount_value,
      min_order_amount, max_discount_amount,
      usage_limit, per_customer_limit, start_date, end_date, is_active,
    } = body

    if (!code || !discount_type || !discount_value) {
      return NextResponse.json({ error: 'Code, type and value required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: code.toUpperCase().trim(),
        description: description || null,
        discount_type,
        discount_value: Number(discount_value),
        min_order_amount: Number(min_order_amount) || 0,
        max_discount_amount: max_discount_amount ? Number(max_discount_amount) : null,
        usage_limit: usage_limit ? Number(usage_limit) : null,
        per_customer_limit: per_customer_limit ? Number(per_customer_limit) : 1,
        start_date: start_date || new Date().toISOString(),
        end_date: end_date || null,
        is_active: is_active !== false,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, coupon: data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create coupon' },
      { status: 500 }
    )
  }
}

// PATCH — update coupon
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await verifyAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 })

    const payload: any = { ...updates, updated_at: new Date().toISOString() }
    if (payload.code) payload.code = payload.code.toUpperCase().trim()
    if (payload.discount_value) payload.discount_value = Number(payload.discount_value)

    const { data, error } = await supabase
      .from('coupons')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, coupon: data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update coupon' },
      { status: 500 }
    )
  }
}

// DELETE — remove coupon
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await verifyAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 })

    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete coupon' },
      { status: 500 }
    )
  }
}
