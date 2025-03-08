import { create } from 'zustand';
import { SubscriptionPlan, SubscriptionTier } from '../types';
import * as subscriptionApi from '../api/subscription';

interface SubscriptionState {
  plans: SubscriptionPlan[];
  currentPlan: SubscriptionTier;
  isLoading: boolean;
  error: string | null;
}

interface SubscriptionStore extends SubscriptionState {
  fetchPlans: () => Promise<void>;
  fetchCurrentPlan: () => Promise<void>;
  upgradePlan: (planId: SubscriptionTier) => Promise<void>;
  cancelPlan: () => Promise<void>;
  createCheckout: (planId: SubscriptionTier) => Promise<string>;
  clearError: () => void;
}

const defaultPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Basic resume analysis',
      '3 resume uploads',
      '3 job descriptions',
      'Basic keyword matching',
      '7-day analysis history'
    ],
    limits: {
      resumeUploads: 3,
      savedJobDescriptions: 3,
      analysisHistory: 5,
      aiRewrites: false
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    features: [
      'Advanced resume analysis',
      'Unlimited resume uploads',
      'Unlimited job descriptions',
      'Advanced keyword matching',
      'Detailed section analysis',
      '30-day analysis history',
      'AI-powered rewrite suggestions'
    ],
    limits: {
      resumeUploads: Infinity,
      savedJobDescriptions: Infinity,
      analysisHistory: 30,
      aiRewrites: true
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29.99,
    features: [
      'Everything in Pro',
      'Team management',
      'Bulk analysis',
      'API access',
      'Priority support',
      'Custom branding',
      'Unlimited analysis history'
    ],
    limits: {
      resumeUploads: Infinity,
      savedJobDescriptions: Infinity,
      analysisHistory: Infinity,
      aiRewrites: true
    }
  }
];

const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  plans: defaultPlans,
  currentPlan: 'free',
  isLoading: false,
  error: null,

  fetchPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      const plans = await subscriptionApi.getSubscriptionPlans();
      set({ 
        plans: plans.length > 0 ? plans : defaultPlans,
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
      set({ 
        error: 'Failed to fetch subscription plans', 
        isLoading: false,
        plans: defaultPlans
      });
    }
  },

  fetchCurrentPlan: async () => {
    set({ isLoading: true, error: null });
    try {
      const { tier } = await subscriptionApi.getCurrentSubscription();
      set({ 
        currentPlan: tier || 'free',
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch current subscription:', error);
      set({ 
        error: 'Failed to fetch current subscription', 
        isLoading: false,
        currentPlan: 'free'
      });
    }
  },

  upgradePlan: async (planId) => {
    set({ isLoading: true, error: null });
    try {
      await subscriptionApi.upgradeSubscription(planId);
      set({ currentPlan: planId, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upgrade subscription';
      console.error('Failed to upgrade subscription:', error);
      set({ 
        error: message, 
        isLoading: false 
      });
      throw error;
    }
  },

  cancelPlan: async () => {
    set({ isLoading: true, error: null });
    try {
      await subscriptionApi.cancelSubscription();
      set({ currentPlan: 'free', isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
      console.error('Failed to cancel subscription:', error);
      set({ 
        error: message, 
        isLoading: false 
      });
      throw error;
    }
  },

  createCheckout: async (planId) => {
    set({ isLoading: true, error: null });
    try {
      const { checkoutUrl } = await subscriptionApi.createCheckoutSession(planId);
      set({ isLoading: false });
      return checkoutUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create checkout session';
      console.error('Failed to create checkout session:', error);
      set({ 
        error: message, 
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useSubscriptionStore;