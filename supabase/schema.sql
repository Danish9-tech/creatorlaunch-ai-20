-- =============================================================
-- CreatorLaunch AI - Complete Supabase Database Schema v2.0
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email            TEXT NOT NULL UNIQUE,
  full_name        TEXT,
  avatar_url       TEXT,
  plan             TEXT NOT NULL DEFAULT 'free'
                     CHECK (plan IN ('free','starter','pro','agency')),
  credits          INTEGER NOT NULL DEFAULT 50,
  credits_used     INTEGER NOT NULL DEFAULT 0,
  stripe_customer  TEXT,
  stripe_sub_id    TEXT,
  sub_status       TEXT DEFAULT 'inactive',
  sub_ends_at      TIMESTAMPTZ,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

-- =============================================================
-- GENERATIONS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS public.generations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_name    TEXT NOT NULL,
  tool_slug    TEXT NOT NULL,
  prompt       TEXT NOT NULL,
  result       TEXT NOT NULL,
  tokens_used  INTEGER DEFAULT 0,
  is_saved     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS generations_user_id_idx ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS generations_tool_slug_idx ON public.generations(tool_slug);
CREATE INDEX IF NOT EXISTS generations_created_at_idx ON public.generations(created_at DESC);

-- =============================================================
-- SUBSCRIPTIONS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id         TEXT NOT NULL,
  stripe_sub_id   TEXT,
  stripe_cus_id   TEXT,
  status          TEXT DEFAULT 'active',
  amount          DECIMAL(10,2) DEFAULT 0.00,
  currency        TEXT DEFAULT 'usd',
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  ends_at         TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);

-- =============================================================
-- USAGE LOGS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  tool_slug   TEXT,
  metadata    JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS usage_logs_user_id_idx ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS usage_logs_created_at_idx ON public.usage_logs(created_at DESC);

-- =============================================================
-- USER API KEYS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider          TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'grok', 'gemini')),
  api_key_encrypted TEXT NOT NULL,
  model_preference  TEXT,
  is_active         BOOLEAN DEFAULT TRUE,
  last_used_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE INDEX IF NOT EXISTS user_api_keys_user_id_idx ON public.user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS user_api_keys_active_idx ON public.user_api_keys(user_id, is_active);

-- =============================================================
<<<<<<< HEAD
-- MARKETPLACE INTEGRATIONS TABLE
-- =============================================================
CREATE TABLE IF NOT EXISTS public.marketplace_integrations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL CHECK (platform IN ('gumroad', 'etsy', 'shopify', 'creative_market', 'payhip', 'teachable')),
  platform_name   TEXT,
  credentials     JSONB DEFAULT '{}',
  settings        JSONB DEFAULT '{}',
  is_active       BOOLEAN DEFAULT TRUE,
  last_synced_at  TIMESTAMPTZ,
  products_synced INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

CREATE INDEX IF NOT EXISTS marketplace_integrations_user_id_idx ON public.marketplace_integrations(user_id);
CREATE INDEX IF NOT EXISTS marketplace_integrations_platform_idx ON public.marketplace_integrations(user_id, platform);

-- =============================================================
=======
>>>>>>> e99868580ef2741e5b0fbe1912a0a5948fa5fcce
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Generations RLS
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations"
  ON public.generations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations"
  ON public.generations FOR DELETE
  USING (auth.uid() = user_id);

-- Subscriptions RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Usage Logs RLS
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage logs"
  ON public.usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage logs"
  ON public.usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User API Keys RLS
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own api keys"
  ON public.user_api_keys FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

<<<<<<< HEAD
-- Marketplace Integrations RLS
ALTER TABLE public.marketplace_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own marketplace integrations"
  ON public.marketplace_integrations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

=======
>>>>>>> e99868580ef2741e5b0fbe1912a0a5948fa5fcce
-- =============================================================
-- GRANT PERMISSIONS
-- =============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.generations TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.usage_logs TO authenticated;
GRANT ALL ON public.user_api_keys TO authenticated;
<<<<<<< HEAD
GRANT ALL ON public.marketplace_integrations TO authenticated;
=======
>>>>>>> e99868580ef2741e5b0fbe1912a0a5948fa5fcce
