import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export default function Auth() {
  const navigate = useNavigate();
  const { session, error, clearError } = useAuthStore();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
    
    // Clear any existing sessions on mount
    const clearExistingSessions = async () => {
      await supabase.auth.signOut();
    };
    
    clearExistingSessions();
  }, [session, navigate]);

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Welcome to Nightcap</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            <p>{error}</p>
            <button 
              onClick={clearError}
              className="text-sm underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}
        
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#9333ea',
                  brandAccent: '#7e22ce',
                }
              }
            },
            className: {
              container: 'space-y-4',
              button: 'w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700',
              label: 'block text-sm font-medium text-gray-700',
              input: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500',
            }
          }}
          providers={[]}
          redirectTo={`${window.location.origin}/`}
        />
      </div>
    </div>
  );
}