# 🚀 CreatorLaunch AI - Deployment Guide

## 📋 Overview
This guide covers the complete setup and deployment process for CreatorLaunch AI SaaS platform.

---

## 🔧 Prerequisites

### Required Accounts
1. **Supabase Account** - Backend & Database
2. **Sentry Account** - Error Monitoring
3. **PostHog Account** - Analytics
4. **OpenAI/Grok API** - AI Generation
5. **Vercel/Netlify Account** - Hosting (optional)

---

## ⚙️ Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `creatorlaunch-ai`
   - Database Password: (save this securely)
   - Region: Choose closest to your users

### 1.2 Get API Keys
1. Go to Project Settings → API
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 1.3 Setup Database Schema
1. Go to SQL Editor in Supabase Dashboard
2. Copy content from `supabase/schema.sql` in this repo
3. Paste and click "Run"
4. Verify tables are created:
   - `user_profiles`
   - `ai_generations`
   - `user_credits`
   - `rate_limits`

### 1.4 Deploy Edge Functions
1. Install Supabase CLI (if not already):
   ```bash
   npx supabase init
   npx supabase login
   ```

2. Link to your project:
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_ID
   ```

3. Deploy edge functions:
   ```bash
   npx supabase functions deploy generate-content
   ```

4. Set environment secrets:
   ```bash
   npx supabase secrets set OPENAI_API_KEY=your_openai_key_here
   npx supabase secrets set GROK_API_KEY=your_grok_key_here
   ```

---

## 🔐 Step 2: Environment Variables

### 2.1 Create .env File
Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Sentry Configuration (Error Monitoring)
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
VITE_SENTRY_ENVIRONMENT=production

# PostHog Configuration (Analytics)
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxx
VITE_POSTHOG_HOST=https://app.posthog.com

# App Configuration
VITE_APP_NAME=CreatorLaunch AI
VITE_APP_URL=https://creatorlaunch-ai.vercel.app
```

---

## 🛡️ Step 3: Sentry Setup (Error Monitoring)

### 3.1 Create Sentry Project
1. Go to [https://sentry.io](https://sentry.io)
2. Click "Create Project"
3. Select:
   - Platform: **React**
   - Alert frequency: **On every new issue**
4. Copy the **DSN** (looks like: `https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`)
5. Add DSN to `.env` as `VITE_SENTRY_DSN`

### 3.2 Configure Alerts
1. Go to **Settings → Projects → Your Project → Alerts**
2. Enable:
   - Email notifications
   - Slack integration (optional)
3. Set thresholds for error frequency

---

## 📊 Step 4: PostHog Setup (Analytics)

### 4.1 Create PostHog Project
1. Go to [https://posthog.com](https://posthog.com)
2. Create new project: `CreatorLaunch AI`
3. Go to **Project Settings**
4. Copy **Project API Key** (starts with `phc_`)
5. Add to `.env` as `VITE_POSTHOG_KEY`

### 4.2 Enable Features
1. Enable **Session Recording**
2. Enable **Feature Flags** (for A/B testing)
3. Create custom events:
   - `ai_generation_started`
   - `ai_generation_completed`
   - `credit_purchased`
   - `user_signup`

---

## 🤖 Step 5: AI API Keys

### 5.1 OpenAI API
1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Navigate to **API Keys**
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Add to Supabase secrets:
   ```bash
   npx supabase secrets set OPENAI_API_KEY=sk-xxxxx
   ```

### 5.2 Grok API (Optional)
1. Go to [https://console.x.ai](https://console.x.ai)
2. Create API key
3. Add to Supabase secrets:
   ```bash
   npx supabase secrets set GROK_API_KEY=your_grok_key
   ```

---

## 🏗️ Step 6: Build & Deploy

### 6.1 Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser at http://localhost:5173
```

### 6.2 Production Build
```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

### 6.3 Deploy to Vercel
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel Dashboard:
   - Go to **Settings → Environment Variables**
   - Add all variables from `.env`

4. Redeploy:
   ```bash
   vercel --prod
   ```

### 6.4 Deploy to Netlify (Alternative)
1. Connect GitHub repo to Netlify
2. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Add environment variables in **Site Settings → Environment**
4. Deploy

---

## ✅ Step 7: Verification Checklist

### Backend Verification
- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Edge functions deployed
- [ ] API keys set in Supabase secrets
- [ ] RLS policies enabled

### Frontend Verification
- [ ] All environment variables configured
- [ ] Sentry error tracking working
- [ ] PostHog analytics tracking
- [ ] User authentication working
- [ ] AI generation functional

### Production Verification
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Performance optimized
- [ ] SEO meta tags set
- [ ] Error monitoring active

---

## 🔍 Step 8: Testing

### 8.1 Test User Registration
1. Go to `/register`
2. Create test account
3. Verify email confirmation
4. Check Supabase dashboard for user entry

### 8.2 Test AI Generation
1. Login to dashboard
2. Select any AI tool
3. Enter test input
4. Verify:
   - Loading state
   - API call to edge function
   - Response displayed
   - Credits deducted
   - Generation saved to database

### 8.3 Test Error Tracking
1. Trigger intentional error
2. Check Sentry dashboard
3. Verify error captured with:
   - Stack trace
   - User context
   - Browser info

### 8.4 Test Analytics
1. Navigate through app
2. Check PostHog dashboard
3. Verify events captured:
   - Page views
   - Button clicks
   - AI generations

---

## 🐛 Troubleshooting

### Issue: Supabase Connection Failed
**Solution:**
- Verify `VITE_SUPABASE_URL` is correct
- Check `VITE_SUPABASE_ANON_KEY` matches dashboard
- Ensure RLS policies allow access

### Issue: Edge Function Timeout
**Solution:**
- Increase function timeout in Supabase settings
- Optimize API calls
- Add retry logic

### Issue: Sentry Not Capturing Errors
**Solution:**
- Verify DSN is correct
- Check environment is set
- Ensure Sentry is initialized before app

### Issue: Build Fails
**Solution:**
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

---

## 📈 Monitoring & Maintenance

### Daily Checks
- Monitor Sentry for new errors
- Check PostHog for unusual traffic
- Review Supabase usage

### Weekly Checks
- Review error trends
- Analyze user behavior
- Check API quota usage
- Backup database

### Monthly Checks
- Update dependencies
- Review security patches
- Optimize database queries
- Review and archive old data

---

## 🆘 Support

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Sentry Docs](https://docs.sentry.io)
- [PostHog Docs](https://posthog.com/docs)
- [Vite Docs](https://vitejs.dev)

### Get Help
- GitHub Issues: Report bugs
- Email: support@creatorlaunch.ai
- Discord: Join community

---

## 🎉 Success!

Your CreatorLaunch AI SaaS is now live! 🚀

Next steps:
- Configure payment processing
- Add more AI tools
- Implement premium features
- Scale infrastructure

---

**Last Updated:** 2025-01-15
