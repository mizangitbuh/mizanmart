-- ═══════════════════════════════════════════════
-- Migration 007 — Customer Support Messages
-- Real-time support chat (thread derived by customer_id [+ order_id])
-- Idempotent: safe to run multiple times
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('customer', 'admin')),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_customer ON public.messages(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_order ON public.messages(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(read_at) WHERE read_at IS NULL;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ─── Customer reads own messages ───
DROP POLICY IF EXISTS "Customer reads own messages" ON public.messages;
CREATE POLICY "Customer reads own messages" ON public.messages
  FOR SELECT USING (auth.uid() = customer_id);

-- ─── Customer sends messages as 'customer' role ───
DROP POLICY IF EXISTS "Customer sends messages" ON public.messages;
CREATE POLICY "Customer sends messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND sender_role = 'customer'
  );

-- ─── Customer marks messages as read (own thread only) ───
DROP POLICY IF EXISTS "Customer updates read status" ON public.messages;
CREATE POLICY "Customer updates read status" ON public.messages
  FOR UPDATE USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- ─── Admin full access ───
DROP POLICY IF EXISTS "Admin full access messages" ON public.messages;
CREATE POLICY "Admin full access messages" ON public.messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ─── Enable Realtime (safe if already added) ───
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END
$$;

SELECT 'Migration 007 complete' AS result;
