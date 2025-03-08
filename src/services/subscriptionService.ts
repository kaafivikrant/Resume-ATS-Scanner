import { supabase } from '../lib/supabase';
import { SubscriptionTier } from '../types';

export const getSubscriptionPlans = async () => {
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*');
    
    if (error) {
      throw new Error(`Failed to get subscription plans: ${error.message}`);
    }
    
    return plans.map(plan => ({
      id: plan.plan_id as SubscriptionTier,
      name: plan.name,
      price: parseFloat(plan.price.toString()),
      features: plan.features,
      limits: plan.limits,
    }));
  } catch (error) {
    throw error;
  }
};

export const getCurrentSubscription = async (userId: string) => {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_plans:plan_id (plan_id)
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no subscription found, return free tier
      return { tier: "free" as SubscriptionTier };
    }

    return {
      id: subscription.id,
      tier: subscription.subscription_plans.plan_id as SubscriptionTier,
      active: subscription.active,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
  } catch (error) {
    throw error;
  }
};

export const upgradeSubscription = async (userId: string, planId: SubscriptionTier) => {
  try {
    // Get the plan ID from subscription_plans
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select
  }
}