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

// GET — list all banners
export async function GET() {
  try {
    const supabase = await createClient()
    const admin = await verifyAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('position', { ascending: true })
      .order('sort_order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ banners: data || [] })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch banners' },
      { status: 500 }
    )
  }
}

// POST — create banner
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await verifyAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    const body = await request.json()
    const {
      title, subtitle, description, image_url,
      cta_text, cta_url, background_color, text_color,
      position, sort_order, is_active, start_date, end_date,
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('banners')
      .insert({
        title,
        subtitle: subtitle || null,
        description: description || null,
        image_url: image_url || null,
        cta_text: cta_text || 'Shop Now',
        cta_url: cta_url || '/products',
        background_color: background_color || '#C62828',
        text_color: text_color || '#FFFFFF',
        position: position || 'hero',
        sort_order: Number(sort_order) || 0,
        is_active: is_active !== false,
        start_date: start_date || null,
        end_date: end_date || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, banner: data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create banner' },
      { status: 500 }
    )
  }
}

// PATCH — update banner
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await verifyAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    const body = await request.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'Banner ID required' }, { status: 400 })

    const { data, error } = await supabase
      .from('banners')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, banner: data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update banner' },
      { status: 500 }
    )
  }
}

// DELETE — remove banner
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const admin = await verifyAdmin(supabase)
    if (!admin) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Banner ID required' }, { status: 400 })

    const { error } = await supabase.from('banners').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete banner' },
      { status: 500 }
    )
  }
}
