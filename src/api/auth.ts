import api from './axios';
import { LoginCredentials, RegisterData, User } from '../types';
import { supabase } from '../lib/supabase';

export const login = async (credentials: LoginCredentials) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    
    if (error) throw new Error(error.message);
    
    // Get user profile from our database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) throw new Error('User profile not found');
    
    // Get subscription info
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans!inner(plan_id)')
      .eq('user_id', data.user.id)
      .single();
    
    const subscriptionTier = subscription?.subscription_plans?.plan_id || 'free';
    
    // Store tokens in localStorage
    localStorage.setItem('token', data.session.access_token);
    localStorage.setItem('refreshToken', data.session.refresh_token);
    
    return {
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        subscriptionTier,
        createdAt: userData.created_at,
      }
    };
  } catch (error) {
    throw error.message || 'Login failed';
  }
};

export const register = async (data: RegisterData) => {
  try {
    // Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });
    
    if (authError) throw new Error(authError.message);
    
    if (!authData.user) throw new Error('Failed to create user');
    
    // Create user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name: data.name,
        email: data.email,
      })
      .select()
      .single();
    
    if (userError) throw new Error(userError.message);
    
    // Get free subscription plan
    const { data: freePlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('plan_id', 'free')
      .single();
    
    if (planError) throw new Error('Free subscription plan not found');
    
    // Create subscription for user
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userData.id,
        plan_id: freePlan.id,
        active: true,
      });
    
    if (subError) throw new Error(subError.message);
    
    // Store tokens in localStorage
    localStorage.setItem('token', authData.session.access_token);
    localStorage.setItem('refreshToken', authData.session.refresh_token);
    
    return {
      token: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        subscriptionTier: 'free',
        createdAt: userData.created_at,
      }
    };
  } catch (error) {
    throw error.message || 'Registration failed';
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    // Remove tokens from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    return { success: true };
  } catch (error) {
    // Still remove tokens even if API call fails
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    throw error.message || 'Logout failed';
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    if (!data.user) throw new Error('User not found');
    
    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) throw new Error('User profile not found');
    
    // Get subscription info
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans!inner(plan_id)')
      .eq('user_id', data.user.id)
      .single();
    
    const subscriptionTier = subscription?.subscription_plans?.plan_id || 'free';
    
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      subscriptionTier,
      createdAt: userData.created_at,
    };
  } catch (error) {
    throw error.message || 'Failed to get current user';
  }
};

export const updateProfile = async (data: Partial<User>) => {
  try {
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    
    if (!authUser.user) throw new Error('User not found');
    
    // Update user profile
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        name: data.name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.user.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      createdAt: updatedUser.created_at,
    };
  } catch (error) {
    throw error.message || 'Failed to update profile';
  }
};

export const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    throw error.message || 'Failed to change password';
  }
};

export const refreshToken = async (refreshToken: string) => {
  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    
    if (error) throw error;
    
    if (!data.session) throw new Error('Failed to refresh session');
    
    // Update token in localStorage
    localStorage.setItem('token', data.session.access_token);
    
    return {
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  } catch (error) {
    throw error.message || 'Failed to refresh token';
  }
};