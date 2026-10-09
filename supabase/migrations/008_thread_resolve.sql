-- ═══════════════════════════════════════════════
-- Migration 008 — Support thread resolve flag
-- Lets admins mark a whole thread resolved / reopen it.
-- Convention: the LATEST message in a thread carries
-- thread_resolved_at. Any new message (NULL) auto re-opens.
-- Idempotent: safe to run multiple times
-- ═══════════════════════════════════════════════

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS thread_resolved_at TIMESTAMPTZ;

-- Existing RLS policies already cover the new column
-- (customer UPDATE policy allows marking own thread;
--  admin has full access). No new policies needed.

SELECT 'Migration 008 complete' AS result;
