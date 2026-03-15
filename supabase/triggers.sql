-- =============================================================
-- CreatorLaunch AI - Production Database Triggers
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- =============================================================

-- =============================================================
-- TRIGGER 1: Auto-create profile row when user signs up
-- =============================================================
-- This is CRITICAL. Without it, new signups won't have a
-- profiles row, causing Dashboard/credits to fail.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    plan,
    credits,
    credits_used,
    sub_status,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'free',
    50,          -- default free plan credits
    0,
    'inactive',
    TRUE,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- safe to re-run
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger to ensure it's live
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- =============================================================
-- TRIGGER 2: Auto-update updated_at on profiles changes
-- =============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- =============================================================
-- VERIFY triggers are active (run after applying above)
-- =============================================================
-- SELECT trigger_name, event_manipulation, event_object_table
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
-- ORDER BY trigger_name;
