import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';
import { SubscriptionTier } from '../types';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const createCheckoutSession = async (planId: SubscriptionTier) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get the plan details from the database
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('plan_id', planId)
      .single();

    if (planError || !plan) {
      throw new Error('Plan not found');
    }

    // Create a checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: plan.price,
        userId: user.id,
        customerEmail: user.email,
      }),
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    // Redirect to Stripe Checkout
    const stripe = await stripePromise;
    const { error } = await stripe!.redirectToCheckout({
      sessionId: session.id,
    });

    if (error) {
      throw new Error(error.message);
    }

    return session;
  } catch (error) {
    throw error;
  }
};

export const createPortalSession = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
      }),
    });

    const session = await response.json();

    if (session.error) {
      throw new Error(session.error);
    }

    window.location.href = session.url;
  } catch (error) {
    throw error;
  }
};

export const handleStripeWebhook = async (event: any) => {
  const signature = event.headers['stripe-signature'];
  const webhookSecret = import.meta.env.VITE_STRIPE_WEBHOOK_SECRET;
  const stripe = require('stripe')(import.meta.env.VITE_STRIPE_SECRET_KEY);

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      signature,
      webhookSecret
    );

    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(stripeEvent.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;
    }

    return { statusCode: 200 };
  } catch (error) {
    console.error('Webhook error:', error);
    return { statusCode: 400, body: `Webhook Error: ${error.message}` };
  }
};

const handleCheckoutComplete = async (session: any) => {
  const { client_reference_id: userId, subscription: subscriptionId } = session;

  try {
    // Update subscription in database
    const { error } = await supabase
      .from('subscriptions')
      .update({
        stripe_subscription_id: subscriptionId,
        stripe_customer_id: session.customer,
        active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

const handleSubscriptionUpdated = async (subscription: any) => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        active: subscription.status === 'active',
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

const handleSubscriptionDeleted = async (subscription: any) => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        active: false,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};