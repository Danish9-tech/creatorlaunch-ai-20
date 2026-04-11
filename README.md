# CreatorWand AI

CreatorLaunch AI (also called CreatorWand AI in some code) is a SaaS platform for digital product creators and sellers. It helps you research niches, generate product ideas, write listings and marketing copy, optimize SEO and pricing, and (planned) push listings directly to marketplaces like Gumroad.
Core stack: **Vite + React + TypeScript + Tailwind CSS + Supabase**, with frontend on GitHub, backend on Supabase, deployment on Vercel. [perplexity]


## High-Level Architecture

- **Frontend (GitHub)**
  - Vite + React 18 + TypeScript  
  - Tailwind CSS + shadcn-style UI components  
  - React Router app with authenticated dashboard layout  
  - Supabase client from `@/integrations/supabase/client` (always initialized)  

- **Backend (Supabase)**
  - PostgreSQL with RLS  
  - Auth (email/password)  
  - Tables for profiles, plans, subscriptions, roles, admin, products, AI usage, user API keys  
  - `is_admin(uuid)` RPC for safe admin checks  
  - Edge Functions (notably `ai-generate`) for AI tools  

- **Deployment (Vercel)**
  - GitHub → Vercel integration  
  - ENV vars configured for Supabase and AI keys  
  - Production project: `creatorlaunch-ai-2026`  

- **Observability (optional but supported)**
  - Sentry for error monitoring  
  - PostHog for analytics  


## Main Features

- Authentication (Supabase Auth) with protected dashboard.
- Plans & credits system (Free, Starter, Pro, Agency, Business, Admin variants).
- Central plan gate (`usePlanGate` + `PlanGate`) to protect all tools from one place. 
- Admin Dashboard (`/admin` or `/admin-dashboard`) for full control over users, roles, plans, credits, and tool usage. 
- AI tools via Supabase Edge Function `ai-generate` using Groq/Grok or user’s own API key. 
- Marketplace module (Gumroad integration: connection, listings, analytics).
- API Keys module where users can attach their own AI keys. 
- Legal and marketing pages (Landing, Privacy Policy, Terms of Service, Contact, etc.).

## AI Tools (All Micro + Main Tools)

All AI tools share the same backend pattern:

1. Frontend page calls `supabase.functions.invoke('ai-generate', { body: { toolId, payload } })`. 
2. `ai-generate` edge function:
   - Checks if user has a personal API key in `user_api_keys` / `api_key_encrypted`.  
   - If not, falls back to platform `GROK_API_KEY` / Groq key.  
   - Calls LLM (e.g., Groq Llama 3.3 70B) with a tool-specific prompt.  
   - Returns structured JSON `{ result: ... }`.  
3. Frontend renders cards/tables using `data.result`.

### Core Tool Set (7 Primary Tools)
These are fully wired and verified:

1. **Idea Generator**  
   - Input: niche, platform, audience, price range, etc.  
   - Output: cards with product name, description, pricing suggestion, demand level, competition rating.
   - Usage: starting point to brainstorm digital products.

2. **Trend Finder**  
   - Input: niche, timeframe, marketplace.  
   - Output: trend analysis, rising/declining topics, opportunities.  
   - Uses same `ai-generate` pipeline with a different `toolId`.
   - 
3. **Listings Generator**  
   - Input: product concept, target platform (Gumroad, Etsy, etc.), keywords.  
   - Output: title, short description, long description, bullet points, tags/keywords.

4. **Marketing Generator**  
   - Input: product info, audience, tone.  
   - Output: email copy, social posts, ad copy variants.
   - 
5. **SEO Tools**  
   - Input: niche/product, base URL, focus keyword.  
   - Output: keyword clusters, meta title/description suggestions, content outline, SEO tips.

6. **Competitor Analyzer**  
   - Input: competitor URLs or product names/platform.  
   - Output: competitor overview, pricing comparison, pros/cons, positioning suggestions.  
   - UI enhanced with `TrendingUp` / `TrendingDown` icons.
   - 
7. **Pricing Optimizer**  
   - Input: product type, audience, cost, competition info.  
   - Output: recommended price range, different pricing strategies, justification.
   - 
### Additional / Planned Tools

From the Lovable audit and schema, the platform is designed for “30+ tools”, with many micro-tools powered by the same `GenericToolPage` + `ai-generate` logic.

Examples (from schema & UX):

- Product validation / score tools  
- Niche score tools  
- Headline/title variations  
- Upsell/downsell suggestions  
- Content outline generators  
- Review mining summarizers  
- Marketplace-specific optimizer tools (e.g., Gumroad vs Etsy variants)  

All of these are plugged in via:

- Database `tools` / `tool_categories` tables with metadata.
- `GenericToolPage.tsx` that reads `toolId` from route and renders a generic UI.
- `PlanGate` ensures each tool is only available to the right plan.


## Pages & Navigation

### Main Routes (User-Facing)

- `/` – Marketing/landing page  
- `/login`, `/signup` – Auth flow  
- `/dashboard` – Overview (stats, plan, quick links)  
- `/tools` or multiple `/tools/...` routes – AI tools (7 core + more micro tools)  
- `/products` – Saved products from ProductCreator wizard (status = draft, etc.)..ai/search/0d6a3fcb-5c65-4cdd-ab81-698b95a303c1)
- `/api-keys` – API keys management (user-provided AI keys).
- `/settings` – Profile, plan details, maybe billing stubs.

### Admin Routes
- `/admin` or `/admin-dashboard` – Admin overview  
  - Summary stats, total users, plan breakdown, credits usage  
- Users management page  
  - Upgrade/downgrade plans (Free → Business, etc.)  
  - Adjust credits, set/unset admin for users  
- Tools usage / logs pages (planned)  

Sidebar additions:

- `Admin` link in `AppSidebar` bottom items with Shield icon.
- `API Keys` link below `Marketplace`.

### Legal / Support Pages

- `/privacy-policy`  
- `/terms-of-service`  
- `/contact`  

These pages support both logged-in layout (inside `DashboardLayout`) and public layout, with auth-aware logic.

## Database Schema (High Level)

Exact schema was generated from Lovable audit and then expanded.
Key tables:

- `profiles`  
  - `id` (uuid, matches `auth.users.id`)  
  - `email`  
  - `plan` (e.g., free, starter, pro, agency, business)  
  - `credits` (int, can be large for unlimited)  
  - Other profile fields  
- `plans`  
  - `slug` (free/starter/pro/agency etc.)  
  - `name`, `price`, `credits`, `unlimited`, `features` (JSON array), `sort_order`  
  - Seeded with defaults in SQL.
- `user_subscriptions`  
  - `user_id`  
  - `plan_slug`  
  - `credits_remaining` (can be `-1` for unlimited)  
- `user_roles`  
  - `user_id`  
  - `role` (e.g., admin)
- `admin_users`  
  - `user_id` (explicit admin list)  
- `user_api_keys` / `api_key_encrypted`  
  - `user_id`  
  - `provider` (e.g., groq/grok/openai)  
  - `key` / `encrypted_key`  
  - RLS ensures users only see their own keys.
- `products`  
  - `id`, `user_id`, `title`, `description`, `niche`, `product_type`, `price`, `status` (draft/published)  
  - Inserted when the product wizard completes.
- `ai_usage_logs` / `credits_usage` (designed in Lovable audit)  
  - Tracks per-tool and per-user usage for credits.

RLS:

- Each table has policies like “user can read/write their own rows”, plus admin override via `is_admin()` function.
- `is_admin(uuid)` function is `SECURITY DEFINER` so that admin checks bypass RLS safely.


## Plan & Credits Logic

The plan system is layered to avoid inconsistent UI:

Priority order for determining effective plan:

1. `admin_users` / `user_roles` (admin → full/unlimited access).
2. `user_subscriptions` (plan_slug + credits_remaining).
3. `profiles.plan` and `profiles.credits`.

`usePlanGate` hook:

- Reads Supabase profile + subscription + role.
- Resolves final “effective plan” and credit availability.  
- `PlanGate` component wraps tool pages and decides:  
  - Allow access (business/pro/admin)  
  - Show upgrade modal (free/starter, not enough credits)  
  - Show error if something misconfigured  

All tools pass through this gate via `GenericToolPage`.


## Edge Function: `ai-generate`

Location: `supabase/functions/ai-generate/index.ts`.

Responsibilities:

- Parse incoming request: `{ toolId, payload, userId }`.  
- Look up user’s plan & credits; optionally decrement credits. 
- Resolve which API key to use:
  - If user has personal key in `user_api_keys`, use that.
  - Else use platform-level `GROK_API_KEY` (env).
- Call AI provider (e.g., Groq Llama 3.3 70B) with tool-specific prompt template.
- Return `Content-Type: application/json` with `{ result: ... }`.
- 
Important fix:

- Original function streamed plain text; frontend expected JSON via `supabase.functions.invoke`, which broke all tools.
- Rewritten to return JSON so `data.result` is correctly populated in React pages.
- 
Env:

- `GROK_API_KEY` configured both in Vercel env and Supabase Edge Function secrets via `Deno.env.get('GROK_API_KEY')`.

## Environment Variables

In development, use `.env` / `.env.local`:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GROK_API_KEY=your_default_model_key
VITE_SENTRY_DSN=your_sentry_dsn        # optional
VITE_POSTHOG_KEY=your_posthog_key      # optional
```

Important notes:

- `VITE_SUPABASE_ANON_KEY` naming was corrected (previously misnamed).
- `GROK_API_KEY` must be set in both Vercel and Supabase function secrets.

## Local Development

```bash
git clone https://github.com/Danish9-tech/creatorlaunch-ai-20.git
cd creatorlaunch-ai-20
pnpm install   # or npm install / yarn
pnpm dev       # or npm run dev
```

Repo + deployment details from earlier sessions.

## Production Deployment (Vercel)

1. Connect GitHub repo to Vercel.
2. Add env vars in the Vercel project: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `GROK_API_KEY`, plus optional observability keys. 
3. Ensure Supabase Edge Functions are deployed (`ai-generate`).c5b3764e0233)
4. Push to `main` → Vercel auto-build → production deployment.

## Error Monitoring & Analytics

- **Sentry**: Project supports Sentry integration via `VITE_SENTRY_DSN` and `@sentry/react` + `@sentry/tracing` in the Vite app.
- **PostHog**: Frontend can initialize `posthog-js` with project key for product analytics.

## Status / What’s Working

From the last full audit and fixes:

- Auth, dashboard, navigation: working.  
- Plan & admin detection, `is_admin()` + RLS: fixed and working.  
- Business/admin plans now correctly recognized on frontend.  
- Admin Dashboard accessible with your admin email.  
- `ai-generate` Edge Function: fully wired and returning JSON.  
- All 7 main tools working with Groq key and user’s own key.  
- User API keys table + RLS: configured; API Keys page pending/partially implemented.  
- Marketplace consolidation and Gumroad live analytics/listings: in progress.  


If you want, next step I can:

- Add an explicit “Tools Overview” section in the README that lists every route/slug for each tool exactly as it appears in your `tools` table and routes (we’ll need you to paste your `tools` table content or `src/pages/tools` tree for that).  

What I’m missing now is the exact file/route names for all 30+ micro tools; do you want to paste your tools list so I can literally document each tool one by one?
