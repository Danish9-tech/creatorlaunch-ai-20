import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Provider = "grok" | "openai" | "anthropic" | "gemini";

function decodeBase64(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encodeBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function getEncryptionKey(secret: string) {
  const secretBytes = new TextEncoder().encode(secret);
  const digest = await crypto.subtle.digest("SHA-256", secretBytes);
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function encryptApiKey(apiKey: string, secret: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getEncryptionKey(secret);
  const plainBytes = new TextEncoder().encode(apiKey);
  const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plainBytes);
  return `${encodeBase64(iv)}.${encodeBase64(new Uint8Array(cipherBuffer))}`;
}

async function decryptApiKey(payload: string, secret: string) {
  const [ivBase64, cipherBase64] = payload.split(".");
  const key = await getEncryptionKey(secret);
  const iv = decodeBase64(ivBase64);
  const cipher = decodeBase64(cipherBase64);
  const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return new TextDecoder().decode(plainBuffer);
}

function maskApiKey(apiKey: string) {
  if (apiKey.length <= 8) return "********";
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const encryptionSecret = Deno.env.get("USER_API_KEYS_ENCRYPTION_SECRET")!;

    if (!supabaseUrl || !serviceRoleKey || !encryptionSecret) {
      return new Response(
        JSON.stringify({ error: "Server misconfigured: missing Supabase or encryption secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please sign in." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const action = typeof body.action === "string" ? body.action : "list";

    if (action === "list") {
      const { data, error } = await supabase
        .from("user_api_keys")
        .select("provider, model_preference, is_active, api_key_encrypted, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const keys = await Promise.all((data || []).map(async (entry) => {
        let masked = "Saved";
        try {
          const plainKey = await decryptApiKey(entry.api_key_encrypted, encryptionSecret);
          masked = maskApiKey(plainKey);
        } catch {
          masked = "Saved";
        }

        return {
          provider: entry.provider,
          modelPreference: entry.model_preference,
          isActive: entry.is_active ?? false,
          hasKey: true,
          maskedKey: masked,
        };
      }));

      return new Response(
        JSON.stringify({ keys }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "save") {
      const provider = body.provider as Provider;
      const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
      const modelPreference = typeof body.modelPreference === "string" ? body.modelPreference.trim() : null;
      const isActive = body.isActive !== false;

      if (!provider || !apiKey) {
        return new Response(
          JSON.stringify({ error: "Provider and API key are required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const encrypted = await encryptApiKey(apiKey, encryptionSecret);

      if (isActive) {
        await supabase
          .from("user_api_keys")
          .update({ is_active: false })
          .eq("user_id", user.id);
      }

      const { error } = await supabase
        .from("user_api_keys")
        .upsert({
          user_id: user.id,
          provider,
          api_key_encrypted: encrypted,
          model_preference: modelPreference,
          is_active: isActive,
          updated_at: new Date().toISOString(),
          last_used_at: null,
        }, { onConflict: "user_id,provider" });

      if (error) throw error;

      return new Response(
        JSON.stringify({
          success: true,
          key: {
            provider,
            modelPreference,
            isActive,
            hasKey: true,
            maskedKey: maskApiKey(apiKey),
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "delete") {
      const provider = body.provider as Provider;
      if (!provider) {
        return new Response(
          JSON.stringify({ error: "Provider is required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const { error } = await supabase
        .from("user_api_keys")
        .delete()
        .eq("user_id", user.id)
        .eq("provider", provider);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "set-active") {
      const provider = body.provider as Provider;
      if (!provider) {
        return new Response(
          JSON.stringify({ error: "Provider is required." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      await supabase
        .from("user_api_keys")
        .update({ is_active: false })
        .eq("user_id", user.id);

      const { error } = await supabase
        .from("user_api_keys")
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("provider", provider);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "Unsupported action." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in manage-api-keys function:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
