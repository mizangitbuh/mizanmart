import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { code, orderAmount } = await request.json()

    if (!code || !orderAmount) {
      return NextResponse.json({ error: 'Coupon code and order amount required' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('is_active', true)
      .single()

    if (error || !coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
    }

    // Check expiry
    const now = new Date()
    if (coupon.start_date && new Date(coupon.start_date) > now) {
      return NextResponse.json({ error: 'Coupon not yet active' }, { status: 400 })
    }
    if (coupon.end_date && new Date(coupon.end_date) < now) {
      return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
    }

    // Check min order
    const minOrder = Number(coupon.min_order_amount) || 0
    if (Number(orderAmount) < minOrder) {
      return NextResponse.json(
        { error: `Minimum order amount ৳${minOrder} required` },
        { status: 400 }
      )
    }

    // Calculate discount
    let discount = 0
    if (coupon.discount_type === 'percentage') {
      discount = (Number(orderAmount) * Number(coupon.discount_value)) / 100
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, Number(coupon.max_discount_amount))
      }
    } else {
      discount = Number(coupon.discount_value)
    }

    // Cap at order amount
    discount = Math.min(discount, Number(orderAmount))
    discount = Math.round(discount * 100) / 100

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.discount_type,
        discount_value: Number(coupon.discount_value),
      },
      discount,
    })
  } catch (err) {
    console.error('Coupon validate error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}
