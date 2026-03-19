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
    storageKey: "cl-auth-token",
  },
});

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          plan: "free" | "starter" | "pro" | "agency";
          credits: number;
          credits_used: number;
          stripe_customer: string | null;
          stripe_sub_id: string | null;
          sub_status: string | null;
          sub_ends_at: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          tool_name: string;
          tool_slug: string;
          prompt: string;
          result: string;
          tokens_used: number;
          is_saved: boolean;
          created_at: string;
        };
        Insert: Omit
          Database["public"]["Tables"]["generations"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial
          Database["public"]["Tables"]["generations"]["Row"]
        >;
      };
    };
  };
};
