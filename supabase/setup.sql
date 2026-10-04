-- ═══════════════════════════════════════════════
-- MIZANMART — Complete Database Setup
-- Run in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════

-- ─── 1. CATEGORIES ───
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. PRODUCTS ───
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  compare_price DECIMAL(10,2),
  stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
  sku TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','draft','out_of_stock')),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. PROFILES ───
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. ORDERS ───
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'cod',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  shipping_address JSONB,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. ORDER ITEMS ───
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10,2) NOT NULL
);

-- ─── 6. INDEXES ───
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- ─── 7. ENABLE RLS ───
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ─── 8. RLS POLICIES ───
DROP POLICY IF EXISTS "Categories public read" ON public.categories;
CREATE POLICY "Categories public read" ON public.categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Products public read" ON public.products;
CREATE POLICY "Products public read" ON public.products
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Users own profile" ON public.profiles;
CREATE POLICY "Users own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users own orders" ON public.orders;
CREATE POLICY "Users own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users own order items" ON public.order_items;
CREATE POLICY "Users own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- ─── 9. DEMO CATEGORIES ───
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Cosmetics',   'cosmetics',   'প্রসাধনী ও সাজসজ্জার সামগ্রী', 1),
  ('Clothing',    'clothing',    'পোশাক ও ফ্যাশন সামগ্রী',        2),
  ('Electronics', 'electronics', 'ইলেকট্রনিক্স ও গ্যাজেট',        3),
  ('General',     'general',     'সাধারণ প্রয়োজনীয় সামগ্রী',    4)
ON CONFLICT (slug) DO NOTHING;

-- ─── 10. DEMO PRODUCTS (3 per category = 12) ───
INSERT INTO public.products (category_id, name, slug, description, price, compare_price, stock_quantity, featured, status)
SELECT c.id, v.name, v.slug, v.description, v.price, v.compare_price, v.stock_quantity, v.featured, 'active'
FROM (VALUES
  -- Cosmetics
  ('cosmetics', 'Moisturizing Face Cream', 'face-cream', 'ময়েশ্চারাইজিং ফেস ক্রিম 50ml', 450, 550, 50, true),
  ('cosmetics', 'Matte Lipstick Set',      'lipstick-set', '৩ রঙের ম্যাট লিপস্টিক সেট', 650, 800, 40, true),
  ('cosmetics', 'Sunscreen SPF 50+',       'sunscreen-spf50', 'SPF 50+ সানস্ক্রিন লোশন', 380, NULL, 60, false),
  -- Clothing
  ('clothing', 'Cotton T-Shirt', 'cotton-tshirt', 'প্রিমিয়াম কটন টি-শার্ট', 550, 700, 100, true),
  ('clothing', 'Denim Jeans',    'denim-jeans',   'ক্লাসিক ব্লু ডেনিম জিন্স', 1450, 1800, 35, true),
  ('clothing', 'Summer Dress',   'summer-dress',  'সামার ক্যাজুয়াল ড্রেস', 1200, NULL, 25, false),
  -- Electronics
  ('electronics', 'Wireless Earbuds',  'wireless-earbuds', 'ব্লুটুথ 5.3 ওয়্যারলেস ইয়ারবাড', 1850, 2200, 30, true),
  ('electronics', 'USB-C Fast Charger','usb-c-charger',    '65W ফাস্ট চার্জার',              750, 900, 80, false),
  ('electronics', 'Bluetooth Speaker', 'bt-speaker',       'পোর্টেবল ব্লুটুথ স্পিকার',         2200, 2800, 20, true),
  -- General
  ('general', 'Steel Water Bottle', 'water-bottle',  '১ লিটার স্টিল বোতল',        350, 450, 120, false),
  ('general', 'Notebook Set',       'notebook-set',  '৩টার নোটবুক প্যাক',          250, NULL, 200, false),
  ('general', 'Travel Backpack',    'travel-backpack','৩০L ট্রাভেল ব্যাকপ্যাক',    1350, 1650, 45, true)
) AS v(cat_slug, name, slug, description, price, compare_price, stock_quantity, featured)
JOIN public.categories c ON c.slug = v.cat_slug
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════
-- ✅ Setup Complete
-- ═══════════════════════════════════════════════
SELECT 'Setup complete! ' || 
       (SELECT COUNT(*) FROM categories) || ' categories, ' ||
       (SELECT COUNT(*) FROM products) || ' products' AS result;
