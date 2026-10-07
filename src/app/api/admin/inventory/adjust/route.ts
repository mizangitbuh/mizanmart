import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

interface AdjustRequest {
  productId: string
  newStock: number
  reason: string
  notes?: string
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const body: AdjustRequest = await request.json()
    const { productId, newStock, reason, notes } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    if (typeof newStock !== 'number' || newStock < 0) {
      return NextResponse.json({ error: 'Invalid stock value' }, { status: 400 })
    }

    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock_quantity, name')
      .eq('id', productId)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const previousStock = product.stock_quantity

    const { error: updateError } = await supabase
      .from('products')
      .update({
        stock_quantity: newStock,
        status: newStock <= 0 ? 'out_of_stock' : 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // ═══ AUDIT LOG ═══
    await logAudit({
      action: 'inventory.adjust',
      entityType: 'product',
      entityId: productId,
      entityName: product.name,
      changes: {
        stock_quantity: { old: previousStock, new: newStock },
        difference: { old: null, new: newStock - previousStock },
      },
      metadata: {
        reason,
        notes: notes || null,
      },
    })

    // Optional: stock_history table (if exists)
    try {
      await supabase.from('stock_history').insert({
        product_id: productId,
        previous_quantity: previousStock,
        new_quantity: newStock,
        difference: newStock - previousStock,
        reason,
        notes: notes || null,
        admin_id: user.id,
      })
    } catch {
      // Table might not exist — ignore
    }

    return NextResponse.json({
      success: true,
      previous: previousStock,
      new: newStock,
    })
  } catch (err) {
    console.error('Adjust stock error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to adjust stock' },
      { status: 500 }
    )
  }
}
