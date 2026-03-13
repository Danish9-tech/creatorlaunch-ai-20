import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// ── Lazy-loaded pages (code splitting for performance) ──────────────────────
const Index            = lazy(() => import("./pages/Index"));
const NotFound         = lazy(() => import("./pages/NotFound"));
const SignIn           = lazy(() => import("./pages/SignIn"));
const SignUp           = lazy(() => import("./pages/SignUp"));
const ForgotPassword   = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword    = lazy(() => import("./pages/ResetPassword"));
const Dashboard        = lazy(() => import("./pages/Dashboard"));
const Products         = lazy(() => import("./pages/Products"));
const Analytics        = lazy(() => import("./pages/Analytics"));
const Onboarding       = lazy(() => import("./pages/Onboarding"));
const ProductCreator   = lazy(() => import("./pages/ProductCreator"));
const IdeaGenerator    = lazy(() => import("./pages/IdeaGenerator"));
const TrendFinder      = lazy(() => import("./pages/TrendFinder"));
const ListingsGenerator  = lazy(() => import("./pages/ListingsGenerator"));
const MarketingGenerator = lazy(() => import("./pages/MarketingGenerator"));
const MockupsVideos    = lazy(() => import("./pages/MockupsVideos"));
const SeoTools         = lazy(() => import("./pages/SeoTools"));
const CompetitorAnalyzer = lazy(() => import("./pages/CompetitorAnalyzer"));
const PricingOptimizer = lazy(() => import("./pages/PricingOptimizer"));
const BundleBuilder    = lazy(() => import("./pages/BundleBuilder"));
const LicenseGenerator = lazy(() => import("./pages/LicenseGenerator"));
const AffiliateBuilder = lazy(() => import("./pages/AffiliateBuilder"));
const ListingTranslator = lazy(() => import("./pages/ListingTranslator"));
const LaunchChecklist  = lazy(() => import("./pages/LaunchChecklist"));
const ExportTools      = lazy(() => import("./pages/ExportTools"));
const Profile          = lazy(() => import("./pages/Profile"));
const Settings         = lazy(() => import("./pages/Settings"));
const ToolPage         = lazy(() => import("./pages/ToolPage"));

// ── Loading fallback ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full gradient-primary animate-pulse" />
      <p className="text-sm text-muted-foreground animate-pulse">Loading CreatorLaunch AI...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes — require login */}
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/product-creator" element={<ProductCreator />} />
              <Route path="/idea-generator" element={<IdeaGenerator />} />
              <Route path="/trend-finder" element={<TrendFinder />} />
              <Route path="/listings-generator" element={<ListingsGenerator />} />
              <Route path="/marketing-generator" element={<MarketingGenerator />} />
              <Route path="/mockups-videos" element={<MockupsVideos />} />
              <Route path="/seo-tools" element={<SeoTools />} />
              <Route path="/competitor-analyzer" element={<CompetitorAnalyzer />} />
              <Route path="/pricing-optimizer" element={<PricingOptimizer />} />
              <Route path="/bundle-builder" element={<BundleBuilder />} />
              <Route path="/license-generator" element={<LicenseGenerator />} />
              <Route path="/affiliate-builder" element={<AffiliateBuilder />} />
              <Route path="/listing-translator" element={<ListingTranslator />} />
              <Route path="/launch-checklist" element={<LaunchChecklist />} />
              <Route path="/export-tools" element={<ExportTools />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/tool/:slug" element={<ToolPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
