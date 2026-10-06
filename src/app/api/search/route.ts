import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()

    if (!q || q.length < 2) {
      return NextResponse.json({ products: [], categories: [] })
    }

    const supabase = await createClient()

    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, slug, price, images, category:categories(name)')
        .eq('status', 'active')
        .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(8),
      supabase
        .from('categories')
        .select('id, name, slug')
        .ilike('name', `%${q}%`)
        .limit(4),
    ])

    return NextResponse.json({
      products: productsRes.data || [],
      categories: categoriesRes.data || [],
    })
  } catch (err) {
    console.error('Search error:', err)
    return NextResponse.json({ products: [], categories: [] })
  }
}
