## Phase 1: Fix Build Errors (blocking everything else)
- Fix `src/App.tsx` line 80 type error
- Fix `src/lib/posthog.ts` missing module (install or stub)
- Fix `supabase/functions/ai-generate/index.ts` unknown error type

## Phase 2: Global Rebranding
- Search all files for "CreatorLaunch" and rename to "CreatorWand"
- Update `index.html` title/meta
- Update all component headers, sidebar, documentation files

## Phase 3: Database Schema (Lovable Cloud)
- Create `subscription_plans` table (free/pro/business tiers with credit limits)
- Create `user_roles` table (admin/user roles, security-definer function)
- Create `user_api_keys` table (for storing user GROQ keys)
- Set up RLS policies for all new tables
- Set admin role for `danishhussian990@gmail.com`

## Phase 4: Subscription Logic
- Update `usePlanGate` hook to read from new tables
- Update `PlanGate` components for 3-tier system (FREE: 10 credits, PRO: 500, BUSINESS: unlimited)
- Fix "Credits Exhausted" logic for Pro/Business tiers

## Phase 5: Hybrid AI Key Logic
- Update `ai-generate` edge function to check `user_api_keys` table first, fallback to platform GROQ key
- Update Settings page UI to let users save their own Groq API key

## Phase 6: Marketplace Connect Module
- Create marketplace connection UI (mock integrations for Gumroad, Shopify, Etsy)
- Add "List to Marketplace" button on AI generation results
- Add route and sidebar navigation

## Phase 7: Admin Dashboard
- Ensure admin dashboard checks role from `user_roles` table (not profiles)
- Restrict access to role === 'admin' only

**Note:** The Express `server.js` files cannot run in Lovable's environment. Backend logic will be implemented via Supabase Edge Functions instead, which is the correct architecture for this platform.
