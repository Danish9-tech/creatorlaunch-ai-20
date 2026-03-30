import { useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Lock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PlanGateProps {
  toolId: string;
  children: ReactNode;
}

interface Profile {
  plan: string;
  plan_type: string;
  credits: number;
  role: string;
}

// Tools accessible on free plan
const FREE_TOOLS = [
  "idea-generator", "niche-finder", "product-name-generator",
  "title-optimizer", "description-enhancer", "tag-generator",
];

export function PlanGate({ toolId, children }: PlanGateProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("plan, plan_type, credits, role")
        .single();
      setProfile(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 rounded-full gradient-primary animate-pulse" />
      </div>
    );
  }

  // Admin and pro/business users get full access
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Lock className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold">Upgrade Required</h3>
        <p className="text-muted-foreground max-w-sm">
          Your account profile is still being set up or could not be loaded.
          Please refresh the page or sign out and back in.
        </p>
        <span className="text-xs px-3 py-1 bg-muted rounded-full">Current plan: Free</span>
        <Button className="gradient-primary text-primary-foreground" onClick={() => navigate("/settings")}>
          <Zap className="w-4 h-4 mr-2" /> Upgrade Plan
        </Button>
      </div>
    );
  }

  const plan = profile.plan || profile.plan_type || "free";
  const isAdmin = profile.role === "admin" || profile.role === "super_admin";
  const isPro = plan === "pro" || plan === "business";

  // Full access for admin and pro/business
  if (isAdmin || isPro) {
    return <>{children}</>;
  }

  // Free plan — check if tool is allowed
  if (FREE_TOOLS.includes(toolId)) {
    return <>{children}</>;
  }

  // Blocked — show upgrade UI
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center p-8">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <Lock className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold">Pro Feature</h3>
      <p className="text-muted-foreground max-w-sm">
        This tool requires a Pro or Business plan. Upgrade to unlock all 50+ AI tools with unlimited generations.
      </p>
      <span className="text-xs px-3 py-1 bg-muted rounded-full">Current plan: {plan}</span>
      <Button className="gradient-primary text-primary-foreground" onClick={() => navigate("/settings")}>
        <Zap className="w-4 h-4 mr-2" /> Upgrade to Pro
      </Button>
    </div>
  );
}
