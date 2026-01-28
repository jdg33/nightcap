import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  error: string | null;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  error: null,
  setSession: (session) => {
    set({ session, error: null });
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all auth data
      await supabase.auth.clearSession();
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      set({ session: null, error: null });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ error: 'Failed to sign out. Please try clearing your browser cache.' });
    }
  },
  clearError: () => set({ error: null })
}));