import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Plan = "free" | "pro" | "business";

export interface UsePlanGateOptions {
  toolId?: string;
  requiredPlan?: Plan;
}

export interface UsePlanGateResult {
  allowed: boolean;
  loading: boolean;
  plan: Plan;
  credits: number;
  creditsExhausted: boolean;
  reason: string;
  upgradeUrl: string;
  isAdmin: boolean;
}

const FREE_TOOLS = [
  "idea-generator",
  "niche-finder",
  "product-name-generator",
  "title-optimizer",
  "tag-generator",
  "faq-generator",
];

const PLAN_HIERARCHY: Record<Plan, number> = {
  free: 0,
  pro: 1,
  business: 2,
};

export function usePlanGate({ toolId, requiredPlan }: UsePlanGateOptions = {}): UsePlanGateResult {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan>("free");
  const [credits, setCredits] = useState(10);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Step 1: Check admin role — ISOLATED so failures don't stop plan check
        try {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin")
            .maybeSingle();
          if (roleData) {
            setIsAdmin(true);
            setPlan("business"); // Admins always get business-level access
            setCredits(-1);
            setLoading(false);
            return; // Admin: skip further checks
          }
        } catch (adminErr) {
          console.warn("[usePlanGate] Admin check failed (non-fatal):", adminErr);
        }

        // Step 2: Check active subscription — use plan_slug directly (no join)
        try {
          const { data: subData, error: subError } = await supabase
            .from("user_subscriptions")
            .select("credits_remaining, plan_slug")
            .eq("user_id", user.id)
            .eq("status", "active")
            .maybeSingle();

          if (!subError && subData?.plan_slug) {
            const planSlug = subData.plan_slug as Plan;
            setPlan(planSlug);
            setCredits(subData.credits_remaining ?? 0);
            setLoading(false);
            return;
          }
        } catch (subErr) {
          console.warn("[usePlanGate] Subscription check failed (non-fatal):", subErr);
        }

        // Step 3: Final fallback — read plan directly from profiles table
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("plan, credits")
            .eq("id", user.id)
            .maybeSingle();

          if (profileData?.plan) {
            setPlan((profileData.plan || "free") as Plan);
            setCredits(profileData.credits ?? 0);
          }
        } catch (profileErr) {
          console.warn("[usePlanGate] Profile check failed:", profileErr);
        }
      } catch (err) {
        console.warn("[usePlanGate] Auth error:", err);
      }

      setLoading(false);
    };

    load();
  }, []);

  const isPro = PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY["pro"];
  const isBusiness = plan === "business";

  // credits === -1 means unlimited (business/admin)
  const creditsExhausted = credits === 0 && plan === "free";

  let allowed = false;
  let reason = "";

  if (isAdmin || isBusiness) {
    // Admins and Business users bypass all limits
    allowed = true;
  } else if (isPro) {
    allowed = credits > 0 || credits === -1;
    if (!allowed) reason = "You've used all your Pro credits this month. Credits reset monthly.";
  } else if (toolId && FREE_TOOLS.includes(toolId)) {
    allowed = !creditsExhausted;
    if (creditsExhausted) reason = "You have used all your free credits. Upgrade to Pro for 500 generations/month.";
  } else if (requiredPlan) {
    allowed = PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY[requiredPlan];
    if (!allowed) reason = `This feature requires the ${requiredPlan} plan or higher.`;
  } else {
    allowed = !creditsExhausted;
    if (creditsExhausted)
      reason = "You have used all your free credits (10). Upgrade to Pro for 500 credits.";
    else if (!isPro) {
      allowed = false;
      reason = "This tool requires a Pro or Business plan.";
    }
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
    isAdmin,
  };
}
