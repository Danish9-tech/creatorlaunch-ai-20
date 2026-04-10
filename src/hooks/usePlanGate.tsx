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
  const [credits, setCredits] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
          if (!cancelled) setLoading(false);
          return;
        }
        const user = authData.user;

        // PRIMARY: Call SECURITY DEFINER RPC to check admin (bypasses RLS completely)
        let adminResult = false;
        try {
          const { data: adminCheck } = await supabase
            .rpc("is_admin", { check_user_id: user.id });
          adminResult = !!adminCheck;
        } catch (_) {
          // RPC failed, try direct table read
          try {
            const { data: roleRow } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", user.id)
              .eq("role", "admin")
              .maybeSingle();
            adminResult = !!roleRow;
          } catch (__) {
            // ignore
          }
        }

        if (adminResult) {
          if (!cancelled) {
            setIsAdmin(true);
            setPlan("business");
            setCredits(-1);
            setLoading(false);
          }
          return;
        }

        // SECONDARY: Read profile for plan (most reliable - profile always exists)
        let profilePlan: Plan = "free";
        let profileCredits = 0;
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("plan, credits")
            .eq("id", user.id)
            .maybeSingle();
          if (profile?.plan) {
            profilePlan = profile.plan as Plan;
            profileCredits = profile.credits ?? 0;
          }
        } catch (_) {
          // ignore
        }

        // TERTIARY: Check active subscription (may override profile)
        try {
          const { data: sub } = await supabase
            .from("user_subscriptions")
            .select("plan_slug, credits_remaining")
            .eq("user_id", user.id)
            .eq("status", "active")
            .maybeSingle();
          if (sub?.plan_slug && sub.plan_slug !== "free") {
            profilePlan = sub.plan_slug as Plan;
            profileCredits = sub.credits_remaining ?? profileCredits;
          }
        } catch (_) {
          // ignore, use profile data
        }

        if (!cancelled) {
          setPlan(profilePlan);
          setCredits(profileCredits);
          setLoading(false);
        }
      } catch (err) {
        console.warn("[usePlanGate] Unexpected error:", err);
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const isPro = PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY["pro"];
  const isBusiness = plan === "business";
  const creditsExhausted = credits === 0 && plan === "free";

  let allowed = false;
  let reason = "";

  if (isAdmin || isBusiness) {
    allowed = true;
  } else if (isPro) {
    allowed = credits > 0 || credits === -1;
    if (!allowed) reason = "You've used all your Pro credits this month.";
  } else if (toolId && FREE_TOOLS.includes(toolId)) {
    allowed = !creditsExhausted;
    if (creditsExhausted) reason = "You have used all your free credits. Upgrade to Pro.";
  } else if (requiredPlan) {
    allowed = PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY[requiredPlan];
    if (!allowed) reason = `This feature requires the ${requiredPlan} plan or higher.`;
  } else {
    if (creditsExhausted) {
      allowed = false;
      reason = "You have used all your free credits. Upgrade to Pro.";
    } else if (!isPro) {
      allowed = false;
      reason = "This tool requires a Pro or Business plan.";
    } else {
      allowed = true;
    }
  }

  if (!allowed && !reason) {
    reason = `This tool requires a Pro or Business plan. You're currently on the ${plan} plan.`;
  }

  return { allowed, loading, plan, credits, creditsExhausted, reason, upgradeUrl: "/settings", isAdmin };
}
