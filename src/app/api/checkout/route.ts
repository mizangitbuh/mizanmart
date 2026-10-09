import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkoutLimiter, getClientIp } from '@/lib/rate-limit'
import { getStoreSettings } from '@/lib/settings'
import { sendEmail } from '@/lib/email/client'
import { orderConfirmationEmail } from '@/lib/email/templates/order-confirmation'

// ═══════════════════════════════════════════════════════════
// SECURE CHECKOUT API with Rate Limiting
// 
// 🔒 SECURITY:
//   - Rate limiting (10 orders / 5 min / IP)
//   - Server-side price calculation
//   - Stock validation + decrement
//   - Coupon server-verify
//   - Input validation
//   - Snapshots for history
// ═══════════════════════════════════════════════════════════

interface CheckoutItem {
  productId: string
  quantity: number
}

interface CheckoutRequest {
  form: {
    name: string
    phone: string
    email?: string
    address: string
    city: string
    notes?: string
  }
  items: CheckoutItem[]
  couponCode?: string | null
  paymentMethod?: string
}

export async function POST(request: Request) {
  // ═══════════════════════════════════════════════════════════
  // RATE LIMITING (before any work)
  // ═══════════════════════════════════════════════════════════

  const clientIp = getClientIp(request)
  const limit = checkoutLimiter.check(clientIp)

  if (!limit.allowed) {
    const retryAfter = Math.ceil((limit.resetAt - Date.now()) / 1000)
    return NextResponse.json(
      { error: `অনেক বেশি অর্ডার। ${retryAfter} সেকেন্ড পর আবার চেষ্টা করুন।` },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    )
  }

  const supabase = await createClient()

  try {
    const body: CheckoutRequest = await request.json()
    const { form, items, couponCode } = body

    // ═══════════════════════════════════════════════════════════
    // INPUT VALIDATION
    // ═══════════════════════════════════════════════════════════

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    if (items.length > 50) {
      return NextResponse.json({ error: 'Too many distinct items' }, { status: 400 })
    }

    if (!form?.name?.trim() || !form?.phone?.trim() || !form?.address?.trim() || !form?.city?.trim()) {
      return NextResponse.json({ error: 'Missing required shipping fields' }, { status: 400 })
    }

    if (form.name.length > 200 || form.phone.length > 20 || form.address.length > 500) {
      return NextResponse.json({ error: 'Field values too long' }, { status: 400 })
    }

    // BD phone regex
    const phoneRegex = /^01[3-9]\d{8}$/
    if (!phoneRegex.test(form.phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    }

    // ═══════════════════════════════════════════════════════════
    // FETCH PRODUCTS FROM DATABASE (source of truth)
    // ═══════════════════════════════════════════════════════════

    const productIds = items.map((i) => i.productId).filter(Boolean)
    const uniqueIds = [...new Set(productIds)]

    if (uniqueIds.length === 0) {
      return NextResponse.json({ error: 'Invalid product IDs' }, { status: 400 })
    }

    const { data: dbProducts, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity, status')
      .in('id', uniqueIds)

    if (productsError) throw productsError

    if (!dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ error: 'Products not found' }, { status: 404 })
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]))

    // ═══════════════════════════════════════════════════════════
    // VALIDATE STOCK + CALCULATE TOTALS SERVER-SIDE
    // ═══════════════════════════════════════════════════════════

    const validatedItems = []
    let serverSubtotal = 0

    for (const item of items) {
      const product = productMap.get(item.productId)

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 404 }
        )
      }

      if (product.status !== 'active') {
        return NextResponse.json(
          { error: `Product not available: ${product.name}` },
          { status: 400 }
        )
      }

      const qty = Math.max(1, Math.floor(Number(item.quantity) || 0))
      if (qty > 100) {
        return NextResponse.json(
          { error: `Maximum quantity exceeded for ${product.name}` },
          { status: 400 }
        )
      }

      if (product.stock_quantity < qty) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Only ${product.stock_quantity} available.` },
          { status: 400 }
        )
      }

      // 🔒 Use DB price, NOT client price
      const unitPrice = Number(product.price)
      const itemSubtotal = unitPrice * qty
      serverSubtotal += itemSubtotal

      validatedItems.push({
        product_id: product.id,
        product_name: product.name,          // SNAPSHOT
        price: unitPrice,                    // SNAPSHOT
        quantity: qty,
        subtotal: itemSubtotal,
      })
    }

    // ═══════════════════════════════════════════════════════════
    // SERVER-SIDE SHIPPING (Dynamic from Store Settings)
    // ═══════════════════════════════════════════════════════════

    const settings = await getStoreSettings()
    const isInsideDhaka =
      form.city?.trim().toLowerCase().includes('dhaka') ||
      form.city?.trim().includes('ঢাকা')
    const baseShipping = isInsideDhaka
      ? Number(settings.inside_dhaka_shipping)
      : Number(settings.outside_dhaka_shipping)

    const isFreeShipping =
      settings.free_shipping_enabled &&
      serverSubtotal >= Number(settings.free_shipping_threshold)

    const shippingCost = isFreeShipping ? 0 : baseShipping

    // ═══════════════════════════════════════════════════════════
    // SERVER-SIDE COUPON VERIFICATION
    // ═══════════════════════════════════════════════════════════

    let couponDiscount = 0
    let couponId: string | null = null
    let couponCodeSnapshot: string | null = null

    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase().trim())
        .eq('is_active', true)
        .single()

      if (coupon) {
        const now = new Date()
        const isValid =
          (!coupon.start_date || new Date(coupon.start_date) <= now) &&
          (!coupon.end_date || new Date(coupon.end_date) >= now) &&
          (!coupon.usage_limit || coupon.usage_count < coupon.usage_limit) &&
          serverSubtotal >= Number(coupon.min_order_amount || 0)

        if (isValid) {
          let discount = 0
          if (coupon.discount_type === 'percentage') {
            discount = (serverSubtotal * Number(coupon.discount_value)) / 100
            if (coupon.max_discount_amount) {
              discount = Math.min(discount, Number(coupon.max_discount_amount))
            }
          } else {
            discount = Number(coupon.discount_value)
          }
          couponDiscount = Math.min(Math.round(discount * 100) / 100, serverSubtotal)
          couponId = coupon.id
          couponCodeSnapshot = coupon.code
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    // FINAL TOTAL (server-calculated)
    // ═══════════════════════════════════════════════════════════

    const grandTotal = Math.max(0, serverSubtotal + shippingCost - couponDiscount)

    // ═══════════════════════════════════════════════════════════
    // CREATE ORDER
    // ═══════════════════════════════════════════════════════════

    const { data: { user } } = await supabase.auth.getUser()

    const orderNumber = 'MM' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100).toString().padStart(2, '0')

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        order_number: orderNumber,
        status: 'pending',
        subtotal: serverSubtotal,
        shipping_cost: shippingCost,
        discount: couponDiscount,
        total: grandTotal,
        payment_method: body.paymentMethod || 'cod',
        payment_status: 'pending',
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_email: form.email?.trim() || null,
        shipping_address: {
          address: form.address.trim(),
          city: form.city.trim(),
        },
        notes: form.notes?.trim() || null,
        coupon_code: couponCodeSnapshot,
      })
      .select()
      .single()

    if (orderError) throw orderError

    // ═══════════════════════════════════════════════════════════
    // INSERT ORDER ITEMS
    // ═══════════════════════════════════════════════════════════

    const orderItemsWithId = validatedItems.map((item) => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsWithId)
    if (itemsError) throw itemsError

    // ═══════════════════════════════════════════════════════════
    // DECREMENT STOCK
    // ═══════════════════════════════════════════════════════════

    for (const item of validatedItems) {
      const product = productMap.get(item.product_id)
      if (!product) continue

      const newStock = Math.max(0, product.stock_quantity - item.quantity)

      const { error: stockError } = await supabase
        .from('products')
        .update({
          stock_quantity: newStock,
          status: newStock <= 0 ? 'out_of_stock' : product.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.product_id)

      if (stockError) {
        console.error(`Stock decrement failed for ${item.product_name}:`, stockError)
      }
    }

    // ═══════════════════════════════════════════════════════════
    // INCREMENT COUPON USAGE
    // ═══════════════════════════════════════════════════════════

    if (couponId) {
      try {
        const { data: coupon } = await supabase
          .from('coupons')
          .select('usage_count')
          .eq('id', couponId)
          .single()

        if (coupon) {
          await supabase
            .from('coupons')
            .update({ usage_count: (coupon.usage_count || 0) + 1 })
            .eq('id', couponId)
        }
      } catch (e) {
        console.error('Coupon usage increment failed:', e)
      }
    }

    // ═══════════════════════════════════════════════════════════
    // SUCCESS
    // ═══════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════
    // SEND ORDER CONFIRMATION EMAIL (best-effort, non-blocking)
    // ═══════════════════════════════════════════════════════════

    if (form.email?.trim()) {
      try {
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          new URL(request.url).origin ||
          'http://localhost:3000'

        const { subject, html } = orderConfirmationEmail({
          order: {
            id: order.id,
            order_number: order.order_number,
            created_at: order.created_at,
            customer_name: order.customer_name || form.name.trim(),
            customer_email: order.customer_email,
            shipping_address: order.shipping_address,
            payment_method: order.payment_method,
            payment_status: order.payment_status,
            subtotal: Number(order.subtotal),
            shipping_cost: Number(order.shipping_cost),
            discount: Number(order.discount),
            total: Number(order.total),
            coupon_code: order.coupon_code,
          },
          items: validatedItems.map((it) => ({
            product_name: it.product_name,
            quantity: it.quantity,
            price: Number(it.price),
            subtotal: Number(it.subtotal),
          })),
          siteUrl,
        })

        const result = await sendEmail({
          to: form.email.trim(),
          subject,
          html,
          tags: [{ name: 'category', value: 'order-confirmation' }],
        })

        if (!result.success) {
          console.error('[checkout] Order confirmation email failed:', result.error)
        } else {
          console.log('[checkout] Order confirmation email sent:', result.id)
        }
      } catch (emailErr) {
        // Never fail the order because of email
        console.error('[checkout] Email exception:', emailErr)
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.order_number,
      summary: {
        subtotal: serverSubtotal,
        shipping: shippingCost,
        discount: couponDiscount,
        total: grandTotal,
      },
    })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Order failed' },
      { status: 500 }
    )
  }
}
