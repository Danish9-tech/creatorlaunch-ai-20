import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://lpuoggdzqmlehclbhjfe.supabase.co";

const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwdW9nZ2R6cW1sZWhjbGJoamZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MzkxNjEsImV4cCI6MjA4OTExNTE2MX0.2jzyCtHuOOm4dOYQ5Co4104Ao4oKmEhR7bxmm0BfLu0";

export const supabaseUrl = SUPABASE_URL;
export const supabaseKey = SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
