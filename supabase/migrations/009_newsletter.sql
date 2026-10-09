-- ═══════════════════════════════════════════════
-- Migration 009 — Newsletter System
-- Subscribers + campaigns (bulk email via Resend)
-- Idempotent: safe to run multiple times
-- NOTE: run manually in Supabase SQL editor (do NOT auto-run)
-- ═══════════════════════════════════════════════

-- ─── Subscribers table ───
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT DEFAULT 'footer',
  unsubscribe_token UUID DEFAULT gen_random_uuid() UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  last_email_sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_subscribers_status
  ON public.newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_email
  ON public.newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_token
  ON public.newsletter_subscribers(unsubscribe_token);

-- ─── Campaigns table ───
CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  recipient_count INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status
  ON public.newsletter_campaigns(status, created_at DESC);

-- ─── RLS ───
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Public can insert (signup form)
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- NO public SELECT — email list stays protected.
-- Unsubscribe is token-based and handled server-side only.

-- Admin full access (subscribers)
DROP POLICY IF EXISTS "Admin full subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admin full subscribers" ON public.newsletter_subscribers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin full access (campaigns)
DROP POLICY IF EXISTS "Admin full campaigns" ON public.newsletter_campaigns;
CREATE POLICY "Admin full campaigns" ON public.newsletter_campaigns
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin')
  );

SELECT 'Migration 009 complete' AS result;
