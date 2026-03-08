import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ProductCreator from "./pages/ProductCreator";
import IdeaGenerator from "./pages/IdeaGenerator";
import TrendFinder from "./pages/TrendFinder";
import ListingsGenerator from "./pages/ListingsGenerator";
import MarketingGenerator from "./pages/MarketingGenerator";
import MockupsVideos from "./pages/MockupsVideos";
import SeoTools from "./pages/SeoTools";
import CompetitorAnalyzer from "./pages/CompetitorAnalyzer";
import PricingOptimizer from "./pages/PricingOptimizer";
import BundleBuilder from "./pages/BundleBuilder";
import LicenseGenerator from "./pages/LicenseGenerator";
import AffiliateBuilder from "./pages/AffiliateBuilder";
import ListingTranslator from "./pages/ListingTranslator";
import LaunchChecklist from "./pages/LaunchChecklist";
import ExportTools from "./pages/ExportTools";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import ToolPage from "./pages/ToolPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
