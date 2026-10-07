-- ═══════════════════════════════════════════════
-- Migration 006 — Admin can read all profiles
-- Needed for admin panel to show reviewer info
-- ═══════════════════════════════════════════════

DROP POLICY IF EXISTS "Admin reads all profiles" ON public.profiles;
CREATE POLICY "Admin reads all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

SELECT 'Migration 006 complete' AS result;
