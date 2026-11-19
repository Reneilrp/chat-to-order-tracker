import type { UserProfile, SellerProfile, SyncMutation } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

export interface AuthResponse {
  token: string;
  user: UserProfile;
  seller: SellerProfile;
}

export interface SyncResponse {
  synced_at: string;
  changes: {
    orders: any[];
    order_items: any[];
    menu_items: any[];
  };
}

export const apiClient = {
  async register(payload: {
    shop_name: string;
    name: string;
    email: string;
    password: string;
    currency_symbol?: string;
    payment_instructions?: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = data.message || Object.values(data.errors || {})[0] || 'Registration failed';
      throw new Error(String(msg));
    }
    return data;
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      const msg = data.message || Object.values(data.errors || {})[0] || 'Login failed';
      throw new Error(String(msg));
    }
    return data;
  },

  async me(token: string): Promise<{ user: UserProfile; seller: SellerProfile }> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  async logout(token: string): Promise<void> {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }).catch(() => {});
  },

  async sync(
    token: string,
    lastSyncedAt: string | null,
    mutations: SyncMutation[]
  ): Promise<SyncResponse> {
    const res = await fetch(`${API_BASE_URL}/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        last_synced_at: lastSyncedAt,
        mutations
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Sync failed');
    }
    return data;
  }
};
