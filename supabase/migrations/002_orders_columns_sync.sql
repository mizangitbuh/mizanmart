-- ═══════════════════════════════════════════════
-- Migration 002 — Sync orders columns
-- Adds discount + coupon_code (exists in prod, missing in setup.sql)
-- Idempotent: safe to run multiple times
-- ═══════════════════════════════════════════════

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_code TEXT;

UPDATE public.orders SET discount = 0 WHERE discount IS NULL;

SELECT 'Migration 002 complete' AS result;
