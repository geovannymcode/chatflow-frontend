import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services/authService';
import { storage } from '../lib/storage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
  setUser: (user: User) => void;
  clearError: () => void;
  initialize: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login(credentials);
          
          storage.setAccessToken(response.accessToken);
          storage.setRefreshToken(response.refreshToken);
          
          set({
            user: response.user as User,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          await authService.register(data);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        storage.clearAuth();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshAuth: async () => {
        const refreshToken = get().refreshToken || storage.getRefreshToken();
        
        if (!refreshToken) {
          get().logout();
          return false;
        }

        try {
          const response = await authService.refresh(refreshToken);
          
          storage.setAccessToken(response.accessToken);
          storage.setRefreshToken(response.refreshToken);
          
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
          });
          
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      setUser: (user) => {
        set({ user });
      },

      clearError: () => {
        set({ error: null });
      },

      initialize: () => {
        const accessToken = storage.getAccessToken();
        const refreshToken = storage.getRefreshToken();
        const user = storage.getUser<User>();

        if (accessToken && user) {
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);