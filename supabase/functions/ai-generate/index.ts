import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// --- Full Tool Registry Mapping ---
const toolToCategory: Record<string, string> = {
  "niche-finder": "research", "trending-keywords": "research", "low-competition": "research",
  "best-selling-analyzer": "research", "market-demand-score": "research", "seasonal-ideas": "research",
  "product-name": "creation", "feature-generator": "creation", "benefit-generator": "creation",
  "structure-builder": "creation", "roadmap-generator": "creation",
  "title-optimizer": "listing", "tag-generator": "listing", "description-improver": "listing",
  "slug-generator": "listing", "faq-generator": "listing", "summary-generator": "listing",
  "cover-prompt": "visual", "thumbnail-prompt": "visual", "hero-prompt": "visual", "social-prompt": "visual",
  "short-ad-script": "video", "youtube-script": "video", "tiktok-reels-script": "video",
  "launch-plan": "marketing", "sales-page-copy": "marketing", "landing-page-headlines": "marketing",
  "cta-generator": "marketing", "limited-offer-generator": "marketing",
  "profit-calculator": "pricing", "price-testing": "pricing", "upsell-ideas": "pricing", "cross-sell-ideas": "pricing",
  "global-pricing": "growth", "localization-suggestions": "growth",
  "content-calendar": "business", "improvement-ideas": "business", "brand-name-generator": "business", "store-bio": "business",
  "quality-score": "bonus", "viral-predictor": "bonus", "avatar-builder": "bonus"
};

const categoryPrompts: Record<string, string> = {
  research: "Expert digital market researcher. Focus on data-driven niche insights.",
  creation: "Expert digital product architect. Focus on high-value structured outlines.",
  listing: "Elite marketplace SEO specialist. Optimize for Etsy and Gumroad algorithms.",
  marketing: "Direct-response marketing strategist. Write high-conversion sales copy.",
  visual: "Creative director. Generate photorealistic AI image prompts.",
  video: "Viral video strategist. Write scripts for TikTok, Reels, and YouTube ads.",
  default: "Professional digital product consultant. Provide actionable advice."
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "")!;
    const { data: { user } } = await supabase.auth.getUser(authHeader);

    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // 1. Check subscription and credits
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("credits_remaining, plan:subscription_plans(slug, credits)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    const planSlug = (subscription?.plan as any)?.slug || "free";
    const creditsRemaining = subscription?.credits_remaining ?? 0;

    // Check admin role (bypass all limits)
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!adminRole;
    const isBusiness = planSlug === "business";
    const hasUnlimited = isAdmin || isBusiness || creditsRemaining === -1;

    if (!hasUnlimited && creditsRemaining <= 0) {
      return new Response(JSON.stringify({ error: "No credits left. Upgrade your plan for more." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const toolSlug = body.tool;
    const systemPrompt = categoryPrompts[toolToCategory[toolSlug] || "default"];

    // 2. Hybrid API Key Logic: Check user's own key first, then fallback to platform
    const { data: userKey } = await supabase
      .from("user_api_keys")
      .select("api_key_encrypted, provider, model_preference, is_active")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    let apiKey = Deno.env.get("LOVABLE_API_KEY") || Deno.env.get("GROQ_API_KEY");
    let apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
    let model = "google/gemini-3-flash-preview";
    let usingUserKey = false;

    // If user has their own Groq key stored, use it directly
    if (userKey && userKey.provider === "grok" && userKey.api_key_encrypted) {
      // Decrypt user key (simplified — in production use proper encryption)
      try {
        const encryptionSecret = Deno.env.get("USER_API_KEYS_ENCRYPTION_SECRET");
        if (encryptionSecret) {
          // Use the manage-api-keys decryption logic
          const [ivBase64, cipherBase64] = userKey.api_key_encrypted.split(".");
          if (ivBase64 && cipherBase64) {
            const secretBytes = new TextEncoder().encode(encryptionSecret);
            const digest = await crypto.subtle.digest("SHA-256", secretBytes);
            const key = await crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["decrypt"]);

            const normalize = (s: string) => s.replace(/-/g, "+").replace(/_/g, "/");
            const pad = (s: string) => s + "=".repeat((4 - (s.length % 4 || 4)) % 4);
            const decode = (s: string) => Uint8Array.from(atob(pad(normalize(s))), c => c.charCodeAt(0));

            const iv = decode(ivBase64);
            const cipher = decode(cipherBase64);
            const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
            const decryptedKey = new TextDecoder().decode(plainBuffer);

            apiKey = decryptedKey;
            apiUrl = "https://api.groq.com/openai/v1/chat/completions";
            model = userKey.model_preference || "llama-3.3-70b-versatile";
            usingUserKey = true;
          }
        }
      } catch (e) {
        console.warn("Could not decrypt user key, falling back to platform key:", e);
      }
    }

    // 3. Initiate Streaming Request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(body.fields) },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI API error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Pass-through the Stream to Frontend
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) return;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }

        // 5. Post-Generation Credit Deduction (only if using platform key)
        if (!usingUserKey && !hasUnlimited && subscription) {
          await supabase
            .from("user_subscriptions")
            .update({ credits_remaining: creditsRemaining - 1 })
            .eq("user_id", user.id)
            .eq("status", "active");
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
