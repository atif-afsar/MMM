import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user for boilerplate testing when Supabase is not yet connected
const DEMO_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  app_metadata: {},
  user_metadata: { name: 'Wedding Admin' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'admin@makemymarriage.app',
  role: 'authenticated',
  updated_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Default to demo mode if Supabase credentials are not set
      setUser(DEMO_USER);
      setIsLoading(false);
      return;
    }

    // Check active session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured || isDemoMode) {
      setUser(DEMO_USER);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured || isDemoMode) {
      setUser(DEMO_USER);
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && !isDemoMode) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsDemoMode(false);
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    setUser(DEMO_USER);
  };

  const disableDemoMode = () => {
    setIsDemoMode(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isConfigured: isSupabaseConfigured,
        isDemoMode,
        signIn,
        signUp,
        signOut,
        enableDemoMode,
        disableDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
