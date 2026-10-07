import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAudit } from '@/lib/audit'

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

    const { orderIds, status } = await request.json()

    if (!orderIds || orderIds.length === 0) {
      return NextResponse.json({ error: 'No orders selected' }, { status: 400 })
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Fetch orders BEFORE (for audit)
    const { data: ordersBefore } = await supabase
      .from('orders')
      .select('id, order_number, status, total')
      .in('id', orderIds)

    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', orderIds)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // ═══ AUDIT LOG ═══
    await logAudit({
      action: 'order.status_change',
      entityType: 'order',
      entityId: orderIds.join(','),
      entityName: `${orderIds.length} orders → ${status}`,
      changes: {
        bulk_status_change: { old: null, new: status },
        order_count: { old: null, new: orderIds.length },
        affected_orders: {
          old: null,
          new: (ordersBefore || []).map((o) => ({
            id: o.id,
            order_number: o.order_number,
            previous_status: o.status,
            total: o.total,
          })),
        },
      },
      metadata: {
        performed_at: new Date().toISOString(),
      },
    })

    return NextResponse.json({ success: true, affected: orderIds.length })
  } catch (err) {
    console.error('Bulk status error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Bulk update failed' },
      { status: 500 }
    )
  }
}
