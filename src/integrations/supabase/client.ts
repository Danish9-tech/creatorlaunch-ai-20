import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

export const supabaseUrl = SUPABASE_URL;
export const supabaseKey = SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
