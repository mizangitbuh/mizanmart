import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAudit, computeChanges } from '@/lib/audit'
import { getStoreSettings, DEFAULT_STORE_SETTINGS, StoreSettings } from '@/lib/settings'

export async function GET() {
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

    const settings = await getStoreSettings()
    return NextResponse.json({ settings })
  } catch (err) {
    console.error('Settings GET error:', err)
    return NextResponse.json({ settings: DEFAULT_STORE_SETTINGS })
  }
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

    const body: Partial<StoreSettings> = await request.json()

    // Fetch previous settings for audit diff
    const oldSettings = await getStoreSettings()

    const payloadToSave = {
      id: 'default',
      store_name: body.store_name?.trim() || oldSettings.store_name,
      store_tagline: body.store_tagline?.trim() ?? oldSettings.store_tagline,
      support_email: body.support_email?.trim() ?? oldSettings.support_email,
      support_phone: body.support_phone?.trim() ?? oldSettings.support_phone,
      support_whatsapp: body.support_whatsapp?.trim() ?? oldSettings.support_whatsapp,
      store_address: body.store_address?.trim() ?? oldSettings.store_address,
      currency_symbol: body.currency_symbol?.trim() || '৳',

      inside_dhaka_shipping: Number(body.inside_dhaka_shipping ?? oldSettings.inside_dhaka_shipping),
      outside_dhaka_shipping: Number(body.outside_dhaka_shipping ?? oldSettings.outside_dhaka_shipping),
      free_shipping_threshold: Number(body.free_shipping_threshold ?? oldSettings.free_shipping_threshold),
      free_shipping_enabled: Boolean(body.free_shipping_enabled ?? oldSettings.free_shipping_enabled),
      estimated_delivery_dhaka: body.estimated_delivery_dhaka ?? oldSettings.estimated_delivery_dhaka,
      estimated_delivery_outside: body.estimated_delivery_outside ?? oldSettings.estimated_delivery_outside,

      cod_enabled: Boolean(body.cod_enabled ?? oldSettings.cod_enabled),
      bkash_enabled: Boolean(body.bkash_enabled ?? oldSettings.bkash_enabled),
      bkash_number: body.bkash_number?.trim() ?? oldSettings.bkash_number,
      bkash_type: body.bkash_type ?? oldSettings.bkash_type,
      nagad_enabled: Boolean(body.nagad_enabled ?? oldSettings.nagad_enabled),
      nagad_number: body.nagad_number?.trim() ?? oldSettings.nagad_number,
      nagad_type: body.nagad_type ?? oldSettings.nagad_type,

      low_stock_threshold: Number(body.low_stock_threshold ?? oldSettings.low_stock_threshold),

      announcement_enabled: Boolean(body.announcement_enabled ?? oldSettings.announcement_enabled),
      announcement_text: body.announcement_text?.trim() ?? oldSettings.announcement_text,
      maintenance_mode: Boolean(body.maintenance_mode ?? oldSettings.maintenance_mode),

      facebook_url: body.facebook_url?.trim() ?? oldSettings.facebook_url,
      instagram_url: body.instagram_url?.trim() ?? oldSettings.instagram_url,
      youtube_url: body.youtube_url?.trim() ?? oldSettings.youtube_url,

      updated_at: new Date().toISOString(),
    }

    const { error: upsertError } = await supabase
      .from('store_settings')
      .upsert(payloadToSave, { onConflict: 'id' })

    if (upsertError) {
      console.error('Failed to save settings:', upsertError)
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    // ═══ AUDIT LOG ═══
    const changes = computeChanges(oldSettings, payloadToSave)
    if (Object.keys(changes).length > 0) {
      await logAudit({
        action: 'settings.update',
        entityType: 'settings',
        entityId: 'default',
        entityName: 'Store Settings',
        changes,
        metadata: {
          changed_count: Object.keys(changes).length,
          updated_at: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json({ success: true, settings: payloadToSave })
  } catch (err) {
    console.error('Settings POST error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update settings' },
      { status: 500 }
    )
  }
}
