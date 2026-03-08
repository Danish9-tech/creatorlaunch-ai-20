// Supabase connection - uses env vars injected by Lovable Cloud
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
export const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
