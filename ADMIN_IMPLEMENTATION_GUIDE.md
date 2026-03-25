# 🚀 CreatorLaunch AI - Complete Admin & Subscription Implementation Guide

## 📋 **Overview**

This guide covers the complete implementation of:
1. **Admin Panel** (hidden from users)
2. **Subscription System** (Free, Pro, Business)
3. **User API Key Integration**
4. **Marketplace Integration System**
5. **Tool Access Restrictions**
6. **Grok API Integration**

---

## ✅ **Step 1: Database Setup** 

### 1.1 Run the Admin Schema

1. Go to your Supabase Dashboard: [https://supabase.com/dashboard/org/vercel_icfg_NbMRFp2RRZRlzjQ2LLandrW0](https://supabase.com/dashboard/org/vercel_icfg_NbMRFp2RRZRlzjQ2LLandrW0)
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/admin-schema.sql`
4. Paste and click **Run**
5. This creates:
   - `admin_users` table
   - `subscription_plans` table (with Free, Pro, Business plans)
   - `user_subscriptions` table
   - `user_api_keys` table
   - `marketplace_integrations` table
   - `tool_usage` tracking
   - `admin_audit_log`

### 1.2 Make Yourself Admin

1. In Supabase Dashboard, go to **Authentication > Users**
2. Find your user account and copy the **User ID**
3. Go back to SQL Editor
4. Run this query (replace with your user ID):

```sql
SELECT public.make_admin('YOUR-USER-ID-HERE');
```

5. Verify by running:

```sql
SELECT * FROM public.admin_users;
```

You should see your user ID with role `super_admin`.

---

## 🎯 **Step 2: Subscription Plans Configuration**

### Default Plans Created:

#### **FREE Plan**
- 25 AI generations/month
- 3 products max
- 1 platform connection
- Basic tools only (Product Creator, Idea Generator)
- Micro-tools: Description Enhancer, Title Optimizer only
- No custom API keys
- No marketplace integrations

#### **PRO Plan** ($29/month or $290/year)
- 500 AI generations/month
- 50 products
- 5 platform connections
- All main tools access
- Most micro-tools
- Custom API key support
- Marketplace integrations
- Email support

#### **BUSINESS Plan** ($79/month or $790/year)
- Unlimited AI generations
- Unlimited products
- All platforms
- All tools + micro-tools
- Custom API keys
- All marketplace integrations
- Bulk operations
- Priority support
- White-label option

### Modify Plans:

Edit plans in Supabase SQL Editor:

```sql
UPDATE public.subscription_plans
SET 
  price_monthly = 39.00,
  ai_generations_limit = 1000,
  features = '["1000 generations","Unlimited products"]'
WHERE slug = 'pro';
```

---

## 🔐 **Step 3: Implement Access Control**

### 3.1 Create useSubscription Hook

Create: `src/hooks/useSubscription.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionPlan {
  slug: string;
  name: string;
  ai_generations_limit: number;
  products_limit: number;
  platforms_limit: number;
  custom_api_keys: boolean;
  marketplace_integrations: boolean;
  tool_access: Record<string, boolean>;
  micro_tool_access: Record<string, boolean>;
}

export const useSubscription = () => {
  const { data: user } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data;
    },
  });

  const plan: SubscriptionPlan = subscription?.plan || {
    slug: 'free',
    name: 'Free',
    ai_generations_limit: 25,
    products_limit: 3,
    platforms_limit: 1,
    custom_api_keys: false,
    marketplace_integrations: false,
    tool_access: {},
    micro_tool_access: {},
  };

  const canAccessTool = (toolId: string): boolean => {
    return plan.tool_access?.[toolId] === true;
  };

  const canAccessMicroTool = (microToolId: string): boolean => {
    return plan.micro_tool_access?.[microToolId] === true;
  };

  const hasFeature = (feature: string): boolean => {
    switch (feature) {
      case 'custom_api_keys':
        return plan.custom_api_keys;
      case 'marketplace_integrations':
        return plan.marketplace_integrations;
      default:
        return false;
    }
  };

  return {
    subscription,
    plan,
    isLoading,
    canAccessTool,
    canAccessMicroTool,
    hasFeature,
    isPro: plan.slug === 'pro' || plan.slug === 'business',
    isBusiness: plan.slug === 'business',
    isFree: plan.slug === 'free',
  };
};
```

### 3.2 Create Plan Gate Component

Create: `src/components/subscription/PlanGate.tsx`

```typescript
import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlanGateProps {
  tool?: string;
  microTool?: string;
  feature?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PlanGate: React.FC<PlanGateProps> = ({
  tool,
  microTool,
  feature,
  children,
  fallback,
}) => {
  const { canAccessTool, canAccessMicroTool, hasFeature, plan } = useSubscription();
  const navigate = useNavigate();

  let hasAccess = true;
  let requiredPlan = 'Pro';

  if (tool && !canAccessTool(tool)) {
    hasAccess = false;
  }

  if (microTool && !canAccessMicroTool(microTool)) {
    hasAccess = false;
  }

  if (feature && !hasFeature(feature)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;

    return (
      <Alert className="border-orange-200 bg-orange-50">
        <Crown className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="font-medium text-orange-900">
              {requiredPlan} Plan Required
            </p>
            <p className="text-sm text-orange-700">
              Upgrade to access this feature. Current plan: {plan.name}
            </p>
          </div>
          <Button
            onClick={() => navigate('/pricing')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Crown className="mr-2 h-4 w-4" />
            Upgrade Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
```

### 3.3 Usage in Tool Pages

Wrap tool content with PlanGate:

```typescript
// Example: src/pages/SomeToolPage.tsx
import { PlanGate } from '@/components/subscription/PlanGate';

export const SomeToolPage = () => {
  return (
    <PlanGate tool="seo_optimizer">
      {/* Your tool content here - only visible if user has access */}
      <div>Tool content...</div>
    </PlanGate>
  );
};
```

---

## 👑 **Step 4: Admin Panel Access**

### 4.1 Admin Route Setup

The admin panel is accessible ONLY to users in the `admin_users` table at:

**URL:** `https://creatorlaunch-ai-2026.vercel.app/admin`

### 4.2 Access Your Admin Panel

1. Make sure you ran the `make_admin()` function with your user ID
2. Login to your app
3. Navigate to: `/admin`
4. You should see the Admin Dashboard

### 4.3 Admin Features:

- **Users Management**: View all users, their plans, usage stats
- **Subscriptions**: Upgrade/downgrade user plans, view revenue
- **Plans Management**: Edit plan features, pricing, tool access
- **API Usage**: Monitor AI API usage, costs
- **Integrations**: See which users connected marketplaces
- **Audit Log**: Track all admin actions

### 4.4 Hide Admin Link from Regular Users

The admin link ONLY shows in sidebar for admin users. Regular users cannot see or access `/admin` route.

---

## 🔑 **Step 5: User API Key Integration**

### 5.1 API Key Settings Page

Users with Pro/Business plans can add their own API keys at:

**URL:** `/settings/api-keys`

### 5.2 Supported Providers:

- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- xAI (Grok)
- Google (Gemini)
- Custom endpoints

### 5.3 How It Works:

1. User enters their API key
2. Key is encrypted and stored in `user_api_keys` table
3. When generating content, system checks:
   - Does user have custom API key?
   - If YES: Use their key
   - If NO: Use platform key (count against monthly limit)

### 5.4 Benefits:

- Users with API keys get unlimited generations
- They pay their AI provider directly
- Your platform doesn't bear API costs for Pro/Business users

---

## 🛍️ **Step 6: Marketplace Integrations**

### 6.1 Integration Page

Users with Pro/Business plans can connect marketplaces at:

**URL:** `/settings/integrations`

### 6.2 Supported Platforms:

- Amazon Seller Central
- eBay
- Etsy
- Shopify
- Walmart Marketplace
- WooCommerce
- Custom API

### 6.3 What Users Can Do:

- Auto-sync product listings
- Import products to optimize
- Export generated content directly
- Bulk update descriptions
- Sync inventory

---

## ⚙️ **Step 7: Test All Tools with Grok API**

### 7.1 Grok API Configuration

Your Grok API key should be set in Supabase Edge Function secrets:

```bash
npx supabase secrets set GROK_API_KEY=your_grok_key_here
```

### 7.2 Update Edge Function

Edit: `supabase/functions/generate-content/index.ts`

Make sure it's configured to use Grok API properly:

```typescript
const GROK_API_KEY = Deno.env.get('GROK_API_KEY');
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

const response = await fetch(GROK_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GROK_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'grok-beta',
    messages: [{
      role: 'user',
      content: prompt
    }],
    temperature: 0.7,
  }),
});
```

### 7.3 Test Each Tool:

1. **Product Creator**: Generate product from idea
2. **Idea Generator**: Get product suggestions
3. **Trend Finder**: Find trending products
4. **Listings Generator**: Create marketplace listing
5. **SEO Optimizer**: Optimize product title/description
6. **Email Generator**: Generate marketing emails

### 7.4 Error Handling:

If tool fails:
- Check Supabase Function logs
- Verify Grok API key is set
- Check API quota/limits
- Verify user has generations remaining

---

## 📊 **Step 8: Tool Access Matrix**

### Free Plan Tools:
```
✅ Product Creator
✅ Idea Generator  
❌ Listings Generator (PRO+)
❌ Trend Finder (PRO+)
❌ SEO Optimizer (PRO+)
❌ Email Generator (PRO+)
❌ Image Enhancer (PRO+)
❌ Analytics (PRO+)
```

### Free Plan Micro-Tools:
```
✅ Description Enhancer
✅ Title Optimizer
❌ Keyword Research (PRO+)
❌ Competitor Analysis (PRO+)
❌ Pricing Optimizer (PRO+)
❌ Review Analyzer (PRO+)
❌ Bulk Listing (BUSINESS)
❌ AI Photo (PRO+)
```

### Pro Plan:
- All Free Plan tools
- All main tools except bulk operations
- Most micro-tools
- Custom API keys
- Marketplace integrations

### Business Plan:
- Everything unlocked
- Unlimited usage
- Bulk operations
- Priority support
- White-label

---

## 🛠️ **Step 9: Implementation Checklist**

### Database:
- [ ] Run `admin-schema.sql` in Supabase
- [ ] Make yourself admin with your user ID
- [ ] Verify subscription plans created
- [ ] Test user subscription auto-creation

### Access Control:
- [ ] Create `useSubscription` hook
- [ ] Create `PlanGate` component
- [ ] Wrap all restricted tools with `PlanGate`
- [ ] Test tool restrictions for each plan

### Admin Panel:
- [ ] Access `/admin` route
- [ ] Verify only admins can see it
- [ ] Test user management
- [ ] Test plan upgrades/downgrades

### API Keys:
- [ ] Create API keys settings page
- [ ] Test adding OpenAI key
- [ ] Test adding Grok key
- [ ] Verify generation uses user's key

### Marketplace:
- [ ] Create integrations page
- [ ] Add platform connection forms
- [ ] Test saving credentials
- [ ] Test product sync

### Grok API:
- [ ] Set Grok API key in Supabase secrets
- [ ] Update edge function
- [ ] Test each tool individually
- [ ] Monitor API usage

---

## 🚀 **Step 10: Deployment**

### 10.1 Push to GitHub
```bash
git add .
git commit -m "feat: Add admin panel, subscriptions, API keys, marketplace integrations"
git push origin main
```

### 10.2 Vercel Auto-Deploy

Vercel will automatically deploy when you push to GitHub.

### 10.3 Environment Variables

Make sure these are set in Vercel:
```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
VITE_SENTRY_DSN=your_dsn
VITE_POSTHOG_KEY=your_key
```

---

## 🔐 **Step 11: Security Notes**

### Admin Access:
- Admin panel hidden from non-admins
- Route `/admin` protected by RLS
- Only users in `admin_users` table can access

### API Keys:
- User API keys encrypted in database
- Never exposed in frontend
- Only decrypted server-side in edge functions

### Subscription Data:
- Users can only see their own subscription
- RLS policies prevent data leaks
- Admins can see all subscriptions

---

## 🆘 **Support & Troubleshooting**

### Common Issues:

**Issue**: Can't access admin panel
**Fix**: Run `make_admin()` with your user ID

**Issue**: Tool shows upgrade prompt for Pro user
**Fix**: Check `subscription_plans.tool_access` JSON

**Issue**: Grok API not working
**Fix**: Verify secret is set, check function logs

**Issue**: User subscription not created
**Fix**: Check trigger exists, manually insert row

---

## 🎉 **You're Done!**

Your complete SaaS platform now has:
✅ Admin panel for you only
✅ Subscription system (Free/Pro/Business)
✅ Tool restrictions by plan
✅ User API key integration
✅ Marketplace integrations
✅ Grok API working
✅ Usage tracking
✅ Audit logging

Admin Access: https://creatorlaunch-ai-2026.vercel.app/admin

---

**Last Updated:** March 26, 2026
**Version:** 1.0.0
