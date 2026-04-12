# 🪄 CreatorWand

CreatorWand AI is an AI‑powered SaaS platform for digital product creators and sellers. It helps you:

* **Discover** profitable niches
* **Generate** and validate product ideas
* **Create** listings and marketing content
* **Optimize** SEO and pricing
* **(Planned)** Connect to marketplaces like Gumroad for analytics and publishing

The product is built as a modern full‑stack web app with ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white) + ![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB) + ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white) + ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white) + ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white), deployed on ![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=flat&logo=vercel&logoColor=white).

---

# 📑 Table of Contents
* [Tech Stack](#tech-stack)
* [Architecture Overview](#architecture-overview)
* [Core Features](#core-features)
* [AI Tools Catalog](#ai-tools-catalog)
* [Plans, Credits & Access Control](#plans-credits--access-control)
* [Database Schema](#database-schema-high-level)
* [Supabase Edge Functions](#supabase-edge-functions)
* [Marketplace & API Keys](#marketplace--api-keys)
* [Error Monitoring & Analytics](#error-monitoring--analytics)
* [Local Development](#local-development)
* [Deployment](#deployment-vercel)
* [Roadmap](#roadmap)
* [License](#license)

---

# 📊 GitHub Stats

### <img src="https://github-readme-streak-stats.herokuapp.com/?user=Danish9-tech&theme=dark" alt="Current Streak" />

---

# 💻 Tech Stack

### 🎨 Frontend
* **Vite + React 18 + TypeScript**
* **Tailwind CSS + shadcn-style components**
* **React Router** for routing
* **Supabase JS client** from `@/integrations/supabase/client` (always initialized)

### ⚙️ Backend (Supabase)
* **PostgreSQL** with Row Level Security (RLS)
* **Supabase Auth** (email/password)
* **RPC function** `is_admin(uuid)` with `SECURITY DEFINER` for admin checks
* **Edge Function** `ai-generate` for AI tools
* **Tables:** profiles, plans, subscriptions, roles, admin, products, AI usage, user API keys

### 🚀 Deployment (Vercel)
* **GitHub → Vercel CI/CD**
* **Production project:** `creatorlaunch-ai-2026`
* **Environment variables** via Vercel project settings

### 📉 Observability (optional)
* ![Sentry](https://img.shields.io/badge/sentry-%23362D59.svg?style=flat&logo=sentry&logoColor=white) **Sentry** for error monitoring (`VITE_SENTRY_DSN`)
* ![PostHog](https://img.shields.io/badge/PostHog-F6511D?logo=posthog&logoColor=white) **PostHog** for product analytics (`VITE_POSTHOG_KEY`)

---

# 🏛️ Architecture Overview
The system is split across three platforms:

### 🌐 Frontend (GitHub)
* **Repository:** [https://github.com/Danish9-tech/creatorlaunch-ai-20](https://github.com/Danish9-tech/creatorlaunch-ai-20)
* Vite React app (TS) using Tailwind, shadcn components, Dashboard layout
* All AI tools are rendered via dedicated pages or a generic tools page
* Supabase client handles auth, profile fetching, and calling edge functions

### ⚡ Backend (Supabase)
* **Auth:** email/password, user metadata in profiles table
* **RLS‑protected tables** for plans, subscriptions, roles, admin, products, API keys, usage logs
* **RPC `is_admin(uuid)`** used throughout for safe admin checks that bypass RLS where needed
* **Edge function `ai-generate`** handles all AI generation logic

### 📦 Deploy (Vercel)
* Main branch deployments
* Environment variables for Supabase + AI keys + observability
* Edge function secrets (e.g. `GROK_API_KEY`) configured in Supabase project settings

---

# 🚀 Core Features
* **Authentication & Dashboard:** Supabase Auth (email/password). Auth‑protected dashboard with stats, plan information, and quick access to tools.
* **AI Tools Platform (30+ tools designed):** 7 core tools fully wired (Idea, Trends, Listings, Marketing, SEO, Competitors, Pricing). Additional micro‑tools built on a generic tools engine (`GenericToolPage` + `ai-generate`).
* **Plans & Credits:** Plans table seeded with Free, Starter, Pro, Agency, plus Business/Admin usage in code. `usePlanGate` hook + `PlanGate` component centralize access control for all tools.
* **Admin Dashboard:** Admin route (`/admin` or `/admin-dashboard`) accessible only to admin users. Manage users, roles, plans, and credits.
* **Marketplace (Gumroad):** Central Marketplace page in sidebar. Designed to connect via token/application ID, sync listings, and show analytics.
* **User API Keys:** Users can attach their own AI API keys (separate from platform default key). Keys stored in `user_api_keys` / `api_key_encrypted` with RLS so each user only sees their own.
* **Legal & Marketing Pages:** Landing page with footer links to Privacy Policy, Terms of Service, Contact. Auth‑aware Privacy/Terms pages that render inside dashboard if logged in.

---

# 🤖 AI Tools Catalog
All tools share the same backend pipeline via Supabase Edge Function ai-generate.

# 🔄 How Tool Execution Works
Frontend collects user input for a specific tool (e.g., Idea Generator). Makes a call:

TypeScript
const { data, error } = await supabase.functions.invoke('ai-generate', {
 body: { toolId: 'idea-generator', payload: formValues },
});
ai-generate Execution Flow:

Validate: Plan/credits check and usage logging.

Auth: Chooses API key (User key from user_api_keys if available, else platform GROK_API_KEY).

LLM Call: Calls Groq Llama 3.3 70B with a tool‑specific prompt.

Response: Returns { result: ... } JSON for the frontend.

Render: Frontend displays cards/tables using data.result.

# 🛠️ Core Tools (7 Fully Wired)
Idea Generator: Input: niche, platform, audience, monetization. Output: product name, description, price, demand level.

Trend Finder: Input: niche, market, timeframe. Output: trending topics, demand shifts, market gaps.

Listings Generator: Input: concept, keywords, tone. Output: titles, descriptions, bullet features, SEO tags.

Marketing Generator: Input: product info, audience. Output: email campaigns, social posts, ad copy.

SEO Tools: Input: niche, main keyword. Output: keyword clusters, on‑page suggestions, content outline.

Competitor Analyzer: Input: competitor URLs. Output: summaries, feature/price comparison, visual indicators.

Pricing Optimizer: Input: cost, perceived value, competition. Output: recommended range, tiered strategies.

# 🔬 Additional / Micro Tools
Validation: product score, niche score, risk analysis

Copy: headline variations, hooks, CTAs

Content: outline generators, script writers, blog starters

Optimization: upsell/downsell ideas, bundle suggestions

Marketplace: platform‑specific listing generators

# 💳 Plans, Credits & Access Control
Multi‑layer plan system ensures UI never disagrees with database state.

# 📋 Plans Table (seeded)
Includes: free, starter, pro, agency.

Fields: slug, name, price, credits, unlimited (bool), features (JSON), sort_order.

# ⚖️ How Effective Plan is Determined
Admin: admin_users / user_roles with role='admin' (Unlimited access).

Subscription: user_subscriptions row with plan_slug + credits_remaining.

Profile Fallback: profiles.plan and profiles.credits.

# 🗄️ Database Schema (Simplified)

| Table | Purpose | Key Fields |
| :--- | :--- | :--- |
| `profiles` | User Data | id, email, plan, credits |
| `user_api_keys` | Encrypted Keys | provider (Grok/OpenAI), encrypted_key |
| `products` | Content Hub | user_id, title, niche, status (Draft/Pub) |
| `ai_usage_logs` | Analytics | timestamp, tool_id, credits_used |

# ⚡Supabase Edge Functions
ai-generate: The central engine.

Responsibilities: Validate user session/plan, check/update credits, determine provider key (User vs Platform), call Groq Llama 3.3 70B, and return JSON.

# 🏪 Marketplace & API Keys
Marketplace (Gumroad): Central Sidebar page. Consolidated settings with connection status, listings tab, and analytics.

User API Keys: Dedicated /api-keys page. RLS policies ensure users only manage their own keys. Fallback to platform key if no user key exists.

# 💻 Local Development
Bash
git clone https://github.com/Danish9-tech/creatorlaunch-ai-20.git
cd creatorlaunch-ai-20
pnpm install
pnpm dev
Note: Create .env with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and GROK_API_KEY.

# 🚀 Deployment (Vercel)
CI/CD: GitHub ➔ Vercel.

Project: creatorlaunch-ai-2026.

Steps: Set Env vars ➔ Deploy Edge Functions ➔ Automated Build.

# 🛣️ Roadmap
[ ] Finalize Marketplace integration with real Gumroad analytics.

[ ] Complete API Keys page UI.

[ ] Expand Admin Dashboard with user and tool usage analytics.

[ ] Add payments and subscription billing system.

# ⚖️ License
This project is currently private / internal.
