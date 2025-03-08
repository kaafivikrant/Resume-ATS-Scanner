import { supabase } from '../lib/supabase';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET = import.meta.env.VITE_JWT_REFRESH_SECRET || "your-refresh-secret-key";

export const registerUser = async (userData: { name: string; email: string; password: string }) => {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', userData.email)
      .single();
    
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create auth user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error("Failed to create user");
    }

    // Create user profile in our users table
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Get free subscription plan
    const { data: freePlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('plan_id', 'free')
      .single();

    if (planError || !freePlan) {
      throw new Error("Free subscription plan not found");
    }

    // Create subscription for user
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_id: freePlan.id,
        active: true,
      });

    if (subscriptionError) {
      throw new Error(subscriptionError.message);
    }

    // Generate tokens
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionTier: 'free',
        createdAt: user.created_at,
      },
      token,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (credentials: { email: string; password: string }) => {
  try {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError) {
      throw new Error("Invalid email or password");
    }

    if (!authData.user) {
      throw new Error("User not found");
    }

    // Get user profile from our users table
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (error || !user) {
      throw new Error("User profile not found");
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans!inner(*)')
      .eq('user_id', user.id)
      .single();

    const subscriptionTier = subscription?.subscription_plans?.plan_id || 'free';

    // Generate tokens
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionTier,
        createdAt: user.created_at,
      },
      token,
      refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async (token: string) => {
  try {
    // Verify refresh token
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
    
    // Get user profile
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      throw new Error("User not found");
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans!inner(*)')
      .eq('user_id', user.id)
      .single();

    const subscriptionTier = subscription?.subscription_plans?.plan_id || 'free';

    // Generate new tokens
    const newToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const newRefreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscriptionTier,
        createdAt: user.created_at,
      },
      token: newToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async (userId: string) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error("User not found");
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans!inner(*)')
      .eq('user_id', user.id)
      .single();

    const subscriptionTier = subscription?.subscription_plans?.plan_id || 'free';

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      subscriptionTier,
      createdAt: user.created_at,
    };
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: { name?: string; email?: string }) => {
  try {
    // Check if email is already in use
    if (data.email) {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', data.email)
        .neq('id', userId)
        .single();

      if (existingUser) {
        throw new Error("Email is already in use");
      }
    }

    // Update user profile
    const { data: user, error } = await supabase
      .from('users')
      .update({
        name: data.name,
        email: data.email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // If email was updated, update auth email as well
    if (data.email) {
      const { error: authError } = await supabase.auth.updateUser({
        email: data.email,
      });

      if (authError) {
        throw new Error(authError.message);
      }
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at,
    };
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (userId: string, data: { currentPassword: string; newPassword: string }) => {
  try {
    // Update password in Supabase Auth
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    throw error;
  }
};