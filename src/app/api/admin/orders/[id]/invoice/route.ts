import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'
import { InvoiceDocument } from '@/lib/orders/invoice-pdf'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }),
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Not authorized' }, { status: 403 }),
    }
  }

  return { ok: true as const, supabase }
}

function getBaseUrl(request: Request): string {
  // Prefer env var (production), fallback to request host
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envUrl) return envUrl.replace(/\/$/, '')

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') || 'http'
  if (host) return `${proto}://${host}`

  return 'http://localhost:3000'
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { data: order, error } = await auth.supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single()

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  try {
    // ─── Fetch product images for items ───
    const productIds = [
      ...new Set(
        (order.order_items || [])
          .map((it: any) => it.product_id)
          .filter(Boolean)
      ),
    ]

    const productImages: Record<string, string | null> = {}

    if (productIds.length > 0) {
      const { data: products } = await auth.supabase
        .from('products')
        .select('id, images')
        .in('id', productIds)

      for (const p of products || []) {
        const imgs = Array.isArray(p.images) ? p.images : []
        const first = imgs.find((url: any) => typeof url === 'string' && url.trim())
        productImages[p.id] = first || null
      }
    }

    // ─── Generate QR code (order tracking URL) ───
    const baseUrl = getBaseUrl(request)
    const trackingUrl = `${baseUrl}/order-success/${order.order_number}`
    const qrDataUrl = await QRCode.toDataURL(trackingUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#991b1b',
        light: '#ffffff',
      },
    })

    // ─── Render PDF ───
    const buffer = await renderToBuffer(
      InvoiceDocument({ order, productImages, qrDataUrl }) as any
    )

    const filename = `invoice-${order.order_number}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('Invoice generation failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invoice failed' },
      { status: 500 }
    )
  }
}
