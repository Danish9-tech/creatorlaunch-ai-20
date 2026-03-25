// src/components/PlanGate.tsx
// Higher-Order Component wrapper for plan gating.
// Use this instead of pasting usePlanGate into every tool page.
//
// USAGE (single tool page):
//   <PlanGate toolId="seo-optimizer">
//     <SeoToolUI />
//   </PlanGate>
//
// USAGE (in a layout to gate entire section):
//   <PlanGate requiredPlan="starter">
//     <Outlet />
//   </PlanGate>
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Loader2, Lock, Zap, CreditCard } from "lucide-react";
import { usePlanGate } from "@/hooks/usePlanGate";
import type { Plan } from "@/hooks/usePlanGate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PlanGateProps {
  /** Tool slug to check access for */
  toolId?: string;
  /** Minimum plan required (overrides toolId lookup) */
  requiredPlan?: Plan;
  /** Content to render when access is granted */
  children: ReactNode;
  /** Optional: show a compact inline badge instead of full block */
  compact?: boolean;
}

/**
 * PlanGate
 * --------
 * Wraps any content and blocks rendering if the user's plan
 * or credit balance doesn't permit access.
 *
 * Replaces the need to copy usePlanGate into 40+ tool files.
 * Place it once in a layout (DashboardLayout or ToolsLayout) or
 * per tool if fine-grained control is needed.
 */
export function PlanGate({ toolId, requiredPlan, children, compact = false }: PlanGateProps) {
  const { allowed, reason, upgradeUrl, loading, creditsExhausted, plan, credits } = usePlanGate({
    toolId,
    requiredPlan,
  });

  // ── Loading state ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Checking plan...</span>
      </div>
    );
  }

  // ── Access granted ─────────────────────────────────────────────
  if (allowed) {
    return <>{children}</>;
  }

  // ── Compact mode (small inline badge) ─────────────────────────────
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Lock className="w-3.5 h-3.5" />
        <span>{creditsExhausted ? "Credits exhausted" : "Plan upgrade required"}</span>
        <Link to={upgradeUrl} className="text-primary hover:underline font-medium">
          Upgrade
        </Link>
      </div>
    );
  }

  // ── Full block gate UI ───────────────────────────────────────────
  return (
    <Card className="border-dashed border-2 border-muted">
      <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center gap-6">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          {creditsExhausted ? (
            <CreditCard className="w-7 h-7 text-muted-foreground" />
          ) : (
            <Lock className="w-7 h-7 text-muted-foreground" />
          )}
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h3 className="text-xl font-display font-semibold">
            {creditsExhausted ? "Credits Exhausted" : "Upgrade Required"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {reason}
          </p>
        </div>

        {/* Current plan badge */}
        <div className="text-xs font-medium bg-muted px-3 py-1 rounded-full text-muted-foreground">
          Current plan: <span className="capitalize font-semibold">{plan}</span>
          {creditsExhausted && (
            <span className="ml-2">· {credits} credits remaining</span>
          )}
        </div>

        {/* CTA */}
        <Link to={upgradeUrl}>
          <Button className="gradient-primary text-primary-foreground">
            <Zap className="w-4 h-4 mr-2" />
            {creditsExhausted ? "Get More Credits" : "Upgrade Plan"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
