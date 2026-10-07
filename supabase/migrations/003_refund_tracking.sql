-- ═══════════════════════════════════════════════
-- Migration 003 — Refund tracking
-- Adds refund_amount, refund_reason, refunded_at to orders
-- Idempotent: safe to run multiple times
-- ═══════════════════════════════════════════════

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refund_reason TEXT,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;

SELECT 'Migration 003 complete' AS result;
