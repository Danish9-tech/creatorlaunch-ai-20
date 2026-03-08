// Construct Supabase URL from project ID env var
// VITE_SUPABASE_PROJECT_ID is always available in Lovable Cloud projects
const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
  || (projectId ? `https://${projectId}.supabase.co` : undefined);

export const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
