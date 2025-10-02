// src/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// Get credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create and export the Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);