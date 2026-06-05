import { describe, it, expect, beforeEach } from 'vitest';

// Define a simple mock browser LocalStorage since node test environment lacks it
class LocalStorageMock {
  private store: { [key: string]: string } = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

(globalThis as any).localStorage = new LocalStorageMock() as any;

// Dynamically import the store so mock is active
const { useAuthStore } = await import('./authStore.js');

describe('Auth Store (Zustand)', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it('should initialize with default unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isDemo).toBe(false);
  });

  it('should handle setToken and correctly mark demo modes', () => {
    const store = useAuthStore.getState();
    
    // Test Live Token setting
    store.setToken('ghp_testlivekey123');
    expect(useAuthStore.getState().token).toBe('ghp_testlivekey123');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isDemo).toBe(false);
    expect(localStorage.getItem('github_token')).toBe('ghp_testlivekey123');
    expect(localStorage.getItem('is_demo')).toBe('false');

    // Test Demo Token setting
    store.setToken('demo-token');
    expect(useAuthStore.getState().token).toBe('demo-token');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().isDemo).toBe(true);
    expect(localStorage.getItem('github_token')).toBe('demo-token');
    expect(localStorage.getItem('is_demo')).toBe('true');
  });

  it('should clear all credentials and storage keys on logout', () => {
    const store = useAuthStore.getState();
    store.setToken('demo-token');
    store.setUser({ login: 'alex' });

    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isDemo).toBe(false);
    expect(localStorage.getItem('github_token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
