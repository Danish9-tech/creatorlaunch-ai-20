import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Plan = "free" | "starter" | "pro" | "business";

interface UsePlanGateOptions {
  toolId?: string;
  requiredPlan?: Plan;
}

interface UsePlanGateResult {
  allowed: boolean;
  loading: boolean;
  plan: Plan;
  credits: number;
  creditsExhausted: boolean;
  reason: string;
  upgradeUrl: string;
}

const FREE_TOOLS = [
  "idea-generator", "niche-finder", "product-name-generator",
  "title-optimizer", "tag-generator", "faq-generator",
];

const PLAN_HIERARCHY: Record<Plan, number> = {
  free: 0, starter: 1, pro: 2, business: 3,
};

export function usePlanGate({ toolId, requiredPlan }: UsePlanGateOptions = {}): UsePlanGateResult {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan>("free");
  const [credits, setCredits] = useState(0);
  const [role, setRole] = useState("user");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("plan, plan_type, credits, role")
        .single();

      if (data) {
        const userPlan = (data.plan || data.plan_type || "free") as Plan;
        setPlan(userPlan);
        setCredits(data.credits || 0);
        setRole(data.role || "user");
      }
      setLoading(false);
    };
    load();
  }, []);

  const isAdmin = role === "admin" || role === "super_admin";
  const isPro = PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY["pro"];
  const creditsExhausted = credits <= 0 && plan === "free";

  let allowed = false;
  let reason = "";

  if (isAdmin || isPro) {
    allowed = true;
  } else if (toolId && FREE_TOOLS.includes(toolId)) {
    allowed = !creditsExhausted;
    if (creditsExhausted) reason = "You have used all your free credits. Upgrade to Pro for unlimited generations.";
  } else if (requiredPlan) {
    allowed = PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY[requiredPlan];
    if (!allowed) reason = `This feature requires the ${requiredPlan} plan or higher.`;
  } else {
    allowed = !creditsExhausted;
    if (!allowed) reason = "You have used all your free credits. Upgrade to Pro for unlimited access to all tools.";
    else if (!isPro) reason = "This tool requires a Pro or Business plan.";
  }

  if (!allowed && !reason) {
    reason = `This tool requires a Pro or Business plan. You're currently on the ${plan} plan.`;
  }

  return {
    allowed,
    loading,
    plan,
    credits,
    creditsExhausted,
    reason,
    upgradeUrl: "/settings",
  };
}
