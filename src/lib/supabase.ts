import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://xyzcompany.supabase.co' &&
  !supabaseUrl.includes('your-project-id')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[Make My Marriage] Supabase credentials not found or set to placeholder. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Create Supabase client (using empty strings fallback to prevent fatal runtime exception on init)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
