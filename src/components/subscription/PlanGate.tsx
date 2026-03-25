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
