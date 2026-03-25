import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionPlan {
  slug: string;
  name: string;
  ai_generations_limit: number;
  products_limit: number;
  platforms_limit: number;
  custom_api_keys: boolean;
  marketplace_integrations: boolean;
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
        .single();

      if (error) throw error;
      return data;
    },
  });

  const plan: SubscriptionPlan = subscription?.plan || {
    slug: 'free',
    name: 'Free',
    ai_generations_limit: 25,
    products_limit: 3,
    platforms_limit: 1,
    custom_api_keys: false,
    marketplace_integrations: false,
    tool_access: {},
    micro_tool_access: {},
  };

  const canAccessTool = (toolId: string): boolean => {
    return plan.tool_access?.[toolId] === true;
  };

  const canAccessMicroTool = (microToolId: string): boolean => {
    return plan.micro_tool_access?.[microToolId] === true;
  };

  const hasFeature = (feature: string): boolean => {
    switch (feature) {
      case 'custom_api_keys':
        return plan.custom_api_keys;
      case 'marketplace_integrations':
        return plan.marketplace_integrations;
      default:
        return false;
    }
  };

  return {
    subscription,
    plan,
    isLoading,
    canAccessTool,
    canAccessMicroTool,
    hasFeature,
    isPro: plan.slug === 'pro' || plan.slug === 'business',
    isBusiness: plan.slug === 'business',
    isFree: plan.slug === 'free',
  };
};
