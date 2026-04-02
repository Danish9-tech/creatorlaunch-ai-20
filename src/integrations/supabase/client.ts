import { createClient } from "@supabase/supabase-js";

// ============================================================
// SECURITY FIX: Keys must ONLY come from environment variables.
// Never hardcode Supabase URL or keys here.
// Set these in:
//   Local: .env.local
//   Vercel: Settings > Environment Variables
// ============================================================
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "[CreatorWand] Missing Supabase env vars.\n" +
    "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local"
  );
}

export const supabaseUrl = SUPABASE_URL ?? "";
export const supabaseKey = SUPABASE_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
