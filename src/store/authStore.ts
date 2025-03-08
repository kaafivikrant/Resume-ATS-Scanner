import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { AuthState, LoginCredentials, RegisterData, User } from '../types';
import * as authApi from '../api/auth';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { token, refreshToken, user } = await authApi.login(credentials);
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { token, refreshToken, user } = await authApi.register(data);
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }

    try {
      // Check if token is expired
      const decoded = jwtDecode<{ exp: number }>(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        // Token is expired
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
        return;
      }

      // Token is valid, get current user
      set({ isLoading: true });
      const user = await authApi.getCurrentUser();
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: 'Session expired. Please login again.'
      });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;