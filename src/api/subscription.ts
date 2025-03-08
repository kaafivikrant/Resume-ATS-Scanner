import { supabase } from '../lib/supabase';
import { SubscriptionPlan, SubscriptionTier } from '../types';
import { createCheckoutSession as createStripeCheckout } from './stripe';

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*');
    
    if (error) {
      console.error('Supabase error:', error);
      return [];
    }
    
    return plans.map(plan => ({
      id: plan.plan_id as SubscriptionTier,
      name: plan.name,
      price: parseFloat(plan.price.toString()),
      features: plan.features || [],
      limits: plan.limits || {
        resumeUploads: 3,
        savedJobDescriptions: 3,
        analysisHistory: 5,
        aiRewrites: false
      },
    }));
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }
};

export const getCurrentSubscription = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { tier: 'free' as SubscriptionTier };
    }
    
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        subscription_plans!inner(plan_id)
      `)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (subError || !subscription) {
      return { tier: 'free' as SubscriptionTier };
    }
    
    return {
      id: subscription.id,
      tier: subscription.subscription_plans.plan_id as SubscriptionTier,
      active: subscription.active || false,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return { tier: 'free' as SubscriptionTier };
  }
};

export const createCheckoutSession = async (planId: SubscriptionTier) => {
  try {
    const session = await createStripeCheckout(planId);
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const cancelSubscription = async () => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Authentication required');
    }
    
    const { data: subscription, error: getError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .single();
    
    if (getError || !subscription?.stripe_subscription_id) {
      throw new Error('No active subscription found');
    }

    // Call Stripe API to cancel subscription
    const response = await fetch('/api/cancel-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId: subscription.stripe_subscription_id,
      }),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    return { success: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};