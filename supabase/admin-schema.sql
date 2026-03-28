-- ============================================================
-- CREATORLAUNCH AI - COMPLETE ADMIN + SUBSCRIPTION SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. ADMIN ROLES TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. SUBSCRIPTION PLANS TABLE
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  features JSONB DEFAULT '[]',
  tool_access JSONB DEFAULT '{}',
  micro_tool_access JSONB DEFAULT '{}',
  ai_generations_limit INTEGER DEFAULT 10,
  products_limit INTEGER DEFAULT 1,
  platforms_limit INTEGER DEFAULT 1,
  custom_api_keys BOOLEAN DEFAULT FALSE,
  marketplace_integrations BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  plan_slug TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  payment_method TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER AI API KEYS TABLE
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'grok', 'gemini', 'custom')),
  api_key_encrypted TEXT NOT NULL,
  model_preference TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- 5. MARKETPLACE INTEGRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.marketplace_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('gumroad', 'etsy', 'shopify', 'creative_market', 'payhip', 'teachable', 'amazon', 'ebay', 'walmart', 'woocommerce', 'custom')),
  platform_name TEXT,
  credentials JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ,
  products_synced INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- 6. TOOL USAGE TRACKING
CREATE TABLE IF NOT EXISTS public.tool_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_id TEXT NOT NULL,
  tool_name TEXT,
  tool_category TEXT,
  inputs JSONB DEFAULT '{}',
  output TEXT,
  tokens_used INTEGER DEFAULT 0,
  model_used TEXT,
  api_source TEXT DEFAULT 'platform',
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ADMIN AUDIT LOG
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DEFAULT SUBSCRIPTION PLANS
-- ============================================================

INSERT INTO public.subscription_plans 
  (name, slug, price_monthly, price_yearly, description, ai_generations_limit, products_limit, platforms_limit, custom_api_keys, marketplace_integrations, priority_support, sort_order, features, tool_access, micro_tool_access)
VALUES 
(
  'Free',
  'free',
  0.00,
  0.00,
  'Perfect for individuals getting started',
  25,
  3,
  1,
  FALSE,
  FALSE,
  FALSE,
  1,
  '["25 AI generations/month","3 products","1 platform","Basic tools only","Community support"]',
  '{"product_creator":true,"idea_generator":true,"listings_generator":false,"trend_finder":false,"seo_optimizer":false,"email_generator":false,"image_enhancer":false,"analytics":false}',
  '{"keyword_research":false,"competitor_analysis":false,"pricing_optimizer":false,"review_analyzer":false,"bulk_listing":false,"ai_photo":false,"description_enhancer":true,"title_optimizer":true}'
),
(
  'Pro',
  'pro',
  29.00,
  290.00,
  'For serious sellers ready to scale',
  500,
  50,
  5,
  TRUE,
  TRUE,
  FALSE,
  2,
  '["500 AI generations/month","50 products","5 platforms","All tools access","Custom AI API key","Marketplace integrations","Email support"]',
  '{"product_creator":true,"idea_generator":true,"listings_generator":true,"trend_finder":true,"seo_optimizer":true,"email_generator":true,"image_enhancer":true,"analytics":true}',
  '{"keyword_research":true,"competitor_analysis":true,"pricing_optimizer":true,"review_analyzer":true,"bulk_listing":false,"ai_photo":true,"description_enhancer":true,"title_optimizer":true}'
),
(
  'Business',
  'business',
  79.00,
  790.00,
  'For agencies and power users at scale',
  -1,
  -1,
  -1,
  TRUE,
  TRUE,
  TRUE,
  3,
  '["Unlimited AI generations","Unlimited products","All platforms","All tools + micro-tools","Custom AI API key","All marketplace integrations","Bulk operations","Priority support","White-label option"]',
  '{"product_creator":true,"idea_generator":true,"listings_generator":true,"trend_finder":true,"seo_optimizer":true,"email_generator":true,"image_enhancer":true,"analytics":true}',
  '{"keyword_research":true,"competitor_analysis":true,"pricing_optimizer":true,"review_analyzer":true,"bulk_listing":true,"ai_photo":true,"description_enhancer":true,"title_optimizer":true}'
)
ON CONFLICT (slug) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  features = EXCLUDED.features,
  tool_access = EXCLUDED.tool_access,
  micro_tool_access = EXCLUDED.micro_tool_access,
  updated_at = NOW();

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin users can see everything
CREATE POLICY "Admins full access" ON public.admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_users au 
      WHERE au.user_id = auth.uid()
    )
  );

-- Anyone can read plans
CREATE POLICY "Anyone can read plans" ON public.subscription_plans
  FOR SELECT USING (is_active = TRUE);

-- Admins can manage plans
CREATE POLICY "Admins manage plans" ON public.subscription_plans
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Users see own subscription
CREATE POLICY "Users see own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Admins see all subscriptions
CREATE POLICY "Admins see all subscriptions" ON public.user_subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- Users manage own API keys
CREATE POLICY "Users manage own API keys" ON public.user_api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Users manage own integrations
CREATE POLICY "Users manage own integrations" ON public.marketplace_integrations
  FOR ALL USING (auth.uid() = user_id);

-- Users see own usage, admins see all
CREATE POLICY "Users see own usage" ON public.tool_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own usage" ON public.tool_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins see all usage" ON public.tool_usage
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins manage audit log" ON public.admin_audit_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid())
  );

-- ============================================================
-- AUTO-CREATE FREE SUBSCRIPTION ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  SELECT id INTO free_plan_id FROM public.subscription_plans WHERE slug = 'free' LIMIT 1;
  
  INSERT INTO public.user_subscriptions (user_id, plan_id, plan_slug, status)
  VALUES (NEW.id, free_plan_id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- ============================================================
-- FUNCTION: CHECK USER PLAN ACCESS
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_plan(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_plan TEXT;
BEGIN
  SELECT plan_slug INTO user_plan
  FROM public.user_subscriptions
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;
  
  RETURN COALESCE(user_plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FUNCTION: SET ADMIN (run this to make yourself admin)
-- ============================================================
CREATE OR REPLACE FUNCTION public.make_admin(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.admin_users (user_id, role)
  VALUES (p_user_id, 'super_admin')
  ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- GRANT YOUR USER ID ADMIN ACCESS:
-- Replace 'YOUR-USER-ID-HERE' with your actual Supabase user ID
-- You can find it in: Auth > Users in Supabase dashboard
-- ============================================================
-- SELECT public.make_admin('YOUR-USER-ID-HERE');
