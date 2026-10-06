import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface BulkAction {
  action: 'activate' | 'deactivate' | 'delete' | 'set_category'
  productIds: string[]
  categoryId?: string
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const body: BulkAction = await request.json()
    const { action, productIds, categoryId } = body

    if (!productIds || productIds.length === 0) {
      return NextResponse.json({ error: 'No products selected' }, { status: 400 })
    }

    let result
    switch (action) {
      case 'activate':
        result = await supabase
          .from('products')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .in('id', productIds)
        break
      case 'deactivate':
        result = await supabase
          .from('products')
          .update({ status: 'draft', updated_at: new Date().toISOString() })
          .in('id', productIds)
        break
      case 'delete':
        result = await supabase
          .from('products')
          .delete()
          .in('id', productIds)
        break
      case 'set_category':
        if (!categoryId) {
          return NextResponse.json({ error: 'Category ID required' }, { status: 400 })
        }
        result = await supabase
          .from('products')
          .update({ category_id: categoryId, updated_at: new Date().toISOString() })
          .in('id', productIds)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (result?.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, affected: productIds.length })
  } catch (err) {
    console.error('Bulk action error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Bulk action failed' },
      { status: 500 }
    )
  }
}
