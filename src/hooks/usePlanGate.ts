// src/hooks/usePlanGate.ts
// Plan gating hook for CreatorLaunch AI
// Reads from profiles table (credits, plan) to determine access
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

// ================================================================
// Plan hierarchy and tool access matrix
// ================================================================
export type Plan = "free" | "starter" | "pro" | "agency";

const PLAN_HIERARCHY: Record<Plan, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  agency: 3,
};

// Maps minimum plan required per tool category
const TOOL_PLAN_REQUIREMENTS: Record<string, Plan> = {
  // Free tools - accessible to everyone
  "product-idea-generator": "free",
  "niche-research": "free",
  "title-generator": "free",
  // Starter tools
  "listing-optimizer": "starter",
  "seo-optimizer": "starter",
  "email-sequence": "starter",
  // Pro tools
  "marketing-campaign": "pro",
  "competitor-analysis": "pro",
  "social-content-pack": "pro",
  "launch-strategy": "pro",
  // Agency tools
  "bulk-generator": "agency",
  "white-label-kit": "agency",
};

const PLAN_UPGRADE_URLS: Record<Plan, string> = {
  free: "/pricing",
  starter: "/pricing",
  pro: "/pricing",
  agency: "/pricing",
};

export interface PlanGateResult {
  /** Whether the user can access this feature */
  allowed: boolean;
  /** Why access was denied */
  reason: string | null;
  /** URL to redirect to for upgrade */
  upgradeUrl: string;
  /** User's current plan */
  plan: Plan;
  /** Remaining credits */
  credits: number;
  /** Credits used so far */
  creditsUsed: number;
  /** Whether we are loading profile data */
  loading: boolean;
  /** Whether credits are exhausted regardless of plan */
  creditsExhausted: boolean;
}

interface UsePlanGateOptions {
  /** The tool slug to check access for. If omitted, only checks credits. */
  toolId?: string;
  /** Minimum plan required. Overrides the TOOL_PLAN_REQUIREMENTS lookup. */
  requiredPlan?: Plan;
}

/**
 * usePlanGate
 * -----------
 * Central hook for feature gating.
 * Checks the user's plan and credit balance against the required access level.
 *
 * Usage:
 *   const { allowed, reason, upgradeUrl } = usePlanGate({ toolId: 'seo-optimizer' });
 *
 * This hook reads from useAuth() which already fetches the profile.
 * No extra DB call needed.
 */
export function usePlanGate({
  toolId,
  requiredPlan,
}: UsePlanGateOptions = {}): PlanGateResult {
  const { profile, loading } = useAuth();

  const compute = useCallback((): PlanGateResult => {
    if (loading) {
      return {
        allowed: false,
        reason: null,
        upgradeUrl: "/pricing",
        plan: "free",
        credits: 0,
        creditsUsed: 0,
        loading: true,
        creditsExhausted: false,
      };
    }

    if (!profile) {
      return {
        allowed: false,
        reason: "Your account profile is still being set up or could not be loaded. Please refresh the page or sign out and back in.",
        upgradeUrl: "/dashboard",
        plan: "free",
        credits: 0,
        creditsUsed: 0,
        loading: false,
        creditsExhausted: false,
      };
    }

    const userPlan = (profile.subscription_tier as Plan) ?? "free";
    // FIX: Use ?? to handle null/undefined credits (same root cause as NaN bug)
    const credits = profile.credits ?? 50;
    const creditsUsed = profile.credits_used ?? 0;
    const creditsExhausted = credits < 1;

    // Determine required plan from prop or tool registry
    const minPlan: Plan =
      requiredPlan ??
      (toolId ? TOOL_PLAN_REQUIREMENTS[toolId] ?? "free" : "free");

    const userLevel = PLAN_HIERARCHY[userPlan] ?? 0;
    const requiredLevel = PLAN_HIERARCHY[minPlan] ?? 0;

    const planInsufficient = userLevel < requiredLevel;

    if (planInsufficient) {
      return {
        allowed: false,
        reason: `This tool requires the ${minPlan.charAt(0).toUpperCase() + minPlan.slice(1)} plan or higher. You are on the ${userPlan} plan.`,
        upgradeUrl: PLAN_UPGRADE_URLS[minPlan],
        plan: userPlan,
        credits,
        creditsUsed,
        loading: false,
        creditsExhausted,
      };
    }

    if (creditsExhausted) {
      return {
        allowed: false,
        reason: "You've used all your credits for this period. Upgrade your plan or wait for the next billing cycle.",
        upgradeUrl: "/pricing",
        plan: userPlan,
        credits,
        creditsUsed,
        loading: false,
        creditsExhausted: true,
      };
    }

    return {
      allowed: true,
      reason: null,
      upgradeUrl: "/pricing",
      plan: userPlan,
      credits,
      creditsUsed,
      loading: false,
      creditsExhausted: false,
    };
  }, [profile, loading, toolId, requiredPlan]);

  const [result, setResult] = useState<PlanGateResult>(() => compute());

  useEffect(() => {
    setResult(compute());
  }, [compute]);

  return result;
}
