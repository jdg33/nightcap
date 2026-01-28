import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useDarkModeStore } from '../store/darkModeStore';

export default function Auth() {
  const navigate = useNavigate();
  const { session, error, clearError } = useAuthStore();
  const { isDarkMode } = useDarkModeStore();

  useEffect(() => {
    // Only redirect if we have a confirmed session
    if (session?.user?.id) {
      navigate('/');
    }
  }, [session, navigate]);

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Welcome to Nightcap</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
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
            theme: isDarkMode ? ThemeSupa.Dark : ThemeSupa,
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
              label: 'block text-sm font-medium text-gray-700 dark:text-gray-300',
              input: 'mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-700 dark:text-white',
            }
          }}
          providers={[]}
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
}