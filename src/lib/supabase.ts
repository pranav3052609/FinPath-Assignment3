/**
 * Supabase client for frontend authentication.
 *
 * Uses the public anon key — this is safe because Supabase Row Level Security (RLS)
 * policies ensure users can only access their own data. The service-role key is
 * NEVER included here.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. ' +
    'Create a .env file based on .env.example and restart the dev server.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)