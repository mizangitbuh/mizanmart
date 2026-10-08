import { createClient } from '@/lib/supabase/server'

export interface StoreSettings {
  id: string
  store_name: string
  store_tagline: string
  support_email: string
  support_phone: string
  support_whatsapp: string
  store_address: string
  currency_symbol: string

  // Shipping
  inside_dhaka_shipping: number
  outside_dhaka_shipping: number
  free_shipping_threshold: number
  free_shipping_enabled: boolean
  estimated_delivery_dhaka: string
  estimated_delivery_outside: string

  // Payments
  cod_enabled: boolean
  bkash_enabled: boolean
  bkash_number: string
  bkash_type: 'personal' | 'merchant'
  nagad_enabled: boolean
  nagad_number: string
  nagad_type: 'personal' | 'merchant'

  // Inventory
  low_stock_threshold: number

  // Announcements
  announcement_enabled: boolean
  announcement_text: string
  maintenance_mode: boolean

  // Social Links
  facebook_url: string
  instagram_url: string
  youtube_url: string

  updated_at?: string
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  id: 'default',
  store_name: 'Martivo',
  store_tagline: 'Your trusted online shopping destination',
  support_email: 'jobmizanew@gmail.com',
  support_phone: '+8801700000000',
  support_whatsapp: '+8801700000000',
  store_address: 'Dhaka, Bangladesh',
  currency_symbol: '৳',

  inside_dhaka_shipping: 60,
  outside_dhaka_shipping: 120,
  free_shipping_threshold: 1000,
  free_shipping_enabled: true,
  estimated_delivery_dhaka: '1-2 Days',
  estimated_delivery_outside: '3-5 Days',

  cod_enabled: true,
  bkash_enabled: false,
  bkash_number: '',
  bkash_type: 'personal',
  nagad_enabled: false,
  nagad_number: '',
  nagad_type: 'personal',

  low_stock_threshold: 5,

  announcement_enabled: false,
  announcement_text: 'স্বাগতম মিজানমার্ট-এ! ১০০০ টাকার বেশি অর্ডারে সারাদেশে ফ্রি ডেলিভারি!',
  maintenance_mode: false,

  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
}

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .eq('id', 'default')
      .single()

    if (error || !data) {
      return DEFAULT_STORE_SETTINGS
    }

    return {
      ...DEFAULT_STORE_SETTINGS,
      ...data,
      inside_dhaka_shipping: Number(data.inside_dhaka_shipping ?? DEFAULT_STORE_SETTINGS.inside_dhaka_shipping),
      outside_dhaka_shipping: Number(data.outside_dhaka_shipping ?? DEFAULT_STORE_SETTINGS.outside_dhaka_shipping),
      free_shipping_threshold: Number(data.free_shipping_threshold ?? DEFAULT_STORE_SETTINGS.free_shipping_threshold),
      low_stock_threshold: Number(data.low_stock_threshold ?? DEFAULT_STORE_SETTINGS.low_stock_threshold),
    }
  } catch {
    return DEFAULT_STORE_SETTINGS
  }
}
