-- ═══════════════════════════════════════════════
-- STORE SETTINGS TABLE & INITIAL DATA
-- Run in Supabase SQL Editor
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_name TEXT NOT NULL DEFAULT 'MizanMart',
  store_tagline TEXT DEFAULT 'Your trusted online shopping destination',
  support_email TEXT DEFAULT 'support@mizanmart.com',
  support_phone TEXT DEFAULT '+8801700000000',
  support_whatsapp TEXT DEFAULT '+8801700000000',
  store_address TEXT DEFAULT 'Dhaka, Bangladesh',
  currency_symbol TEXT DEFAULT '৳',
  
  -- Shipping Configuration
  inside_dhaka_shipping DECIMAL(10,2) DEFAULT 60.00,
  outside_dhaka_shipping DECIMAL(10,2) DEFAULT 120.00,
  free_shipping_threshold DECIMAL(10,2) DEFAULT 1000.00,
  free_shipping_enabled BOOLEAN DEFAULT true,
  estimated_delivery_dhaka TEXT DEFAULT '1-2 Days',
  estimated_delivery_outside TEXT DEFAULT '3-5 Days',

  -- Payment Methods Configuration
  cod_enabled BOOLEAN DEFAULT true,
  bkash_enabled BOOLEAN DEFAULT false,
  bkash_number TEXT DEFAULT '',
  bkash_type TEXT DEFAULT 'personal',
  nagad_enabled BOOLEAN DEFAULT false,
  nagad_number TEXT DEFAULT '',
  nagad_type TEXT DEFAULT 'personal',

  -- Inventory & Stock Alerts
  low_stock_threshold INT DEFAULT 5,

  -- Announcements & Top Banner Notice
  announcement_enabled BOOLEAN DEFAULT false,
  announcement_text TEXT DEFAULT 'স্বাগতম মিজানমার্ট-এ! ১০০০ টাকার বেশি অর্ডারে সারাদেশে ফ্রি ডেলিভারি!',
  maintenance_mode BOOLEAN DEFAULT false,

  -- Social Links
  facebook_url TEXT DEFAULT '',
  instagram_url TEXT DEFAULT '',
  youtube_url TEXT DEFAULT '',

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default row if not exists
INSERT INTO public.store_settings (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 1. Public can read settings (needed for store contact, shipping rate in checkout, announcement bar)
DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings" ON public.store_settings
  FOR SELECT USING (true);

-- 2. Only Admins can update settings
DROP POLICY IF EXISTS "Admins can update store settings" ON public.store_settings;
CREATE POLICY "Admins can update store settings" ON public.store_settings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 3. Only Admins can insert store settings
DROP POLICY IF EXISTS "Admins can insert store settings" ON public.store_settings;
CREATE POLICY "Admins can insert store settings" ON public.store_settings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

SELECT 'Store settings table ready!' AS result;
