import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionPlan {
  slug: string;
  name: string;
  credits: number;
  custom_api_keys: boolean;
  marketplace_integrations: boolean;
  priority_support: boolean;
  features: Record<string, boolean>;
  tool_access: Record<string, boolean>;
  micro_tool_access: Record<string, boolean>;
}

export const useSubscription = () => {
  const { data: user } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: isAdmin } = useQuery({
    queryKey: ['user-role', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id)
        .eq('role', 'admin')
        .maybeSingle();
      return !!data;
    },
  });

  const plan: SubscriptionPlan = subscription?.plan || {
    slug: 'free',
    name: 'Free',
    credits: 10,
    custom_api_keys: false,
    marketplace_integrations: false,
    priority_support: false,
    features: {},
    tool_access: {},
    micro_tool_access: {},
  };

  const canAccessTool = (toolId: string): boolean => {
    if (isAdmin) return true;
    if (plan.slug === 'business' || plan.slug === 'pro') return true;
    return plan.tool_access?.[toolId] === true;
  };

  const canAccessMicroTool = (microToolId: string): boolean => {
    if (isAdmin) return true;
    if (plan.slug === 'business' || plan.slug === 'pro') return true;
    return plan.micro_tool_access?.[microToolId] === true;
  };

  const hasFeature = (feature: string): boolean => {
    if (isAdmin) return true;
    switch (feature) {
      case 'custom_api_keys':
        return plan.custom_api_keys;
      case 'marketplace_integrations':
        return plan.marketplace_integrations;
      case 'priority_support':
        return plan.priority_support;
      default:
        return plan.features?.[feature] === true;
    }
  };

  return {
    subscription,
    plan,
    isLoading,
    isAdmin: !!isAdmin,
    canAccessTool,
    canAccessMicroTool,
    hasFeature,
    isPro: plan.slug === 'pro' || plan.slug === 'business',
    isBusiness: plan.slug === 'business',
    isFree: plan.slug === 'free',
    creditsRemaining: subscription?.credits_remaining ?? 10,
  };
};
