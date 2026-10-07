-- ═══════════════════════════════════════════════
-- Migration 005 — Product Reviews
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product_status ON public.reviews(product_id, status);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone reads approved reviews" ON public.reviews;
CREATE POLICY "Anyone reads approved reviews" ON public.reviews
  FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Users read own reviews" ON public.reviews;
CREATE POLICY "Users read own reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create own reviews" ON public.reviews;
CREATE POLICY "Users create own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own pending reviews" ON public.reviews;
CREATE POLICY "Users update own pending reviews" ON public.reviews
  FOR UPDATE
  USING (auth.uid() = user_id AND status IN ('pending','rejected'))
  WITH CHECK (auth.uid() = user_id AND status IN ('pending','rejected'));

DROP POLICY IF EXISTS "Admin all reviews" ON public.reviews;
CREATE POLICY "Admin all reviews" ON public.reviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

SELECT 'Migration 005 complete' AS result;
