import { NextResponse } from 'next/server'
import { getStoreSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const settings = await getStoreSettings()
    return NextResponse.json({
      store_name: settings.store_name,
      store_tagline: settings.store_tagline,
      support_email: settings.support_email,
      support_phone: settings.support_phone,
      support_whatsapp: settings.support_whatsapp,
      store_address: settings.store_address,
      currency_symbol: settings.currency_symbol,
      inside_dhaka_shipping: settings.inside_dhaka_shipping,
      outside_dhaka_shipping: settings.outside_dhaka_shipping,
      free_shipping_threshold: settings.free_shipping_threshold,
      free_shipping_enabled: settings.free_shipping_enabled,
      estimated_delivery_dhaka: settings.estimated_delivery_dhaka,
      estimated_delivery_outside: settings.estimated_delivery_outside,
      cod_enabled: settings.cod_enabled,
      bkash_enabled: settings.bkash_enabled,
      bkash_number: settings.bkash_number,
      bkash_type: settings.bkash_type,
      nagad_enabled: settings.nagad_enabled,
      nagad_number: settings.nagad_number,
      nagad_type: settings.nagad_type,
      announcement_enabled: settings.announcement_enabled,
      announcement_text: settings.announcement_text,
      maintenance_mode: settings.maintenance_mode,
      facebook_url: settings.facebook_url,
      instagram_url: settings.instagram_url,
      youtube_url: settings.youtube_url,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}
