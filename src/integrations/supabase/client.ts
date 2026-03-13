import { createClient } from "@supabase/supabase-js";

// Support both naming conventions for the Supabase anon key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseUrl = SUPABASE_URL as string | undefined;
export const supabaseKey = SUPABASE_KEY as string | undefined;

// Only create client if env vars are available (avoids crash on missing URL)
export const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storageKey: "cl-auth-token",
        },
      })
    : null;

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
        Insert: Omit<
          Database["public"]["Tables"]["generations"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["generations"]["Row"]
        >;
      };
    };
  };
};
