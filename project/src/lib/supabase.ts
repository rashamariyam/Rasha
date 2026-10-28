import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

/**
 * Returns connection status and setup guidance
 */
export function getDatabaseStatus(): {
  provider: 'supabase' | 'local_storage';
  configured: boolean;
  message: string;
} {
  if (isSupabaseConfigured) {
    return {
      provider: 'supabase',
      configured: true,
      message: 'Connected to Supabase PostgreSQL database with Row Level Security (RLS).',
    };
  }
  return {
    provider: 'local_storage',
    configured: true,
    message:
      'Running in offline-first mode with browser persistent storage & salted SHA-256 password hashing. Supabase can be connected by adding VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.',
  };
}
