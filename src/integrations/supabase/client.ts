// Supabase connection constants for Lovable Cloud
// The project ID is used to construct the Supabase URL
const PROJECT_ID = "06e5749a-28bb-4c9d-8e61-2949482fc9ab";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://${PROJECT_ID}.supabase.co`;
export const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
