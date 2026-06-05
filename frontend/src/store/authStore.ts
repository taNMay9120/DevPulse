import { create } from 'zustand';
import axios from 'axios';

export const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AuthStore {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isDemo: boolean;
  setToken: (token: string) => void;
  setUser: (user: any) => void;
  loginWithCode: (code: string) => Promise<void>;
  loginWithDemo: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isDemo: false,

  setToken: (token: string) => {
    localStorage.setItem('github_token', token);
    const isDemo = token === 'demo-token';
    localStorage.setItem('is_demo', String(isDemo));
    set({ token, isAuthenticated: true, isDemo });
  },

  setUser: (user: any) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  loginWithCode: async (code: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/github`, { code });
      const { token } = response.data;
      
      localStorage.setItem('github_token', token);
      localStorage.setItem('is_demo', 'false');

      // Fetch user profile info
      const userResponse = await axios.get(`${BACKEND_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.setItem('user', JSON.stringify(userResponse.data));

      set({
        token,
        user: userResponse.data,
        isAuthenticated: true,
        isDemo: false,
        loading: false
      });
    } catch (err: any) {
      console.error('Login code exchange error:', err);
      set({
        error: err.response?.data?.error || 'Authentication failed during code exchange',
        loading: false
      });
      throw err;
    }
  },

  loginWithDemo: async () => {
    set({ loading: true, error: null });
    try {
      const token = 'demo-token';
      localStorage.setItem('github_token', token);
      localStorage.setItem('is_demo', 'true');

      // Fetch mock user info from backend
      const userResponse = await axios.get(`${BACKEND_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.setItem('user', JSON.stringify(userResponse.data));

      set({
        token,
        user: userResponse.data,
        isAuthenticated: true,
        isDemo: true,
        loading: false
      });
    } catch (err: any) {
      console.error('Demo login error:', err);
      set({
        error: 'Failed to authenticate in demo mode',
        loading: false
      });
    }
  },

  loginWithToken: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const isDemo = token === 'demo-token';
      
      // Fetch user profile info
      const userResponse = await axios.get(`${BACKEND_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.setItem('github_token', token);
      localStorage.setItem('is_demo', String(isDemo));
      localStorage.setItem('user', JSON.stringify(userResponse.data));

      set({
        token,
        user: userResponse.data,
        isAuthenticated: true,
        isDemo,
        loading: false
      });
    } catch (err: any) {
      console.error('Token validation error:', err);
      set({
        error: 'Failed to validate GitHub token',
        loading: false
      });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('github_token');
    localStorage.removeItem('user');
    localStorage.removeItem('is_demo');
    set({ token: null, user: null, isAuthenticated: false, isDemo: false, error: null });
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('github_token');
    const user = localStorage.getItem('user');
    const isDemoStr = localStorage.getItem('is_demo');
    
    if (token) {
      set({
        token,
        isAuthenticated: true,
        isDemo: isDemoStr === 'true',
        user: user ? JSON.parse(user) : null
      });
    }
  },
}));
