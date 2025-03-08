import axios from 'axios';
import { supabase } from '../lib/supabase';

// Base URL for the API
const API_URL = import.meta.env.VITE_API_URL || 'https://api.resumeatsscanner.com/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  async (config) => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      config.headers.Authorization = `Bearer ${data.session.access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the session
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) throw refreshError;
        
        if (data.session) {
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;