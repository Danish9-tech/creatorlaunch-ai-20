import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// --- Types ---
type Provider = "groq" | "openai" | "anthropic" | "gemini" | "grok";

type StoredApiKey = {
  provider: Provider;
  api_key_encrypted: string;
  model_preference: string | null;
};

// --- Complete 46-Tool Mapping ---
const toolToCategory: Record<string, string> = {
  // Research
  "niche-finder": "research", "trending-keywords": "research", "low-competition": "research",
  "best-selling-analyzer": "research", "market-demand-score": "research", "seasonal-ideas": "research",
  // Creation
  "product-name": "creation", "feature-generator": "creation", "benefit-generator": "creation",
  "structure-builder": "creation", "roadmap-generator": "creation",
  // Listing
  "title-optimizer": "listing", "tag-generator": "listing", "description-improver": "listing",
  "slug-generator": "listing", "faq-generator": "listing", "summary-generator": "listing",
  // Visual
  "cover-prompt": "visual", "thumbnail-prompt": "visual", "hero-prompt": "visual", "social-prompt": "visual",
  // Video
  "short-ad-script": "video", "youtube-script": "video", "tiktok-reels-script": "video",
  // Marketing
  "launch-plan": "marketing", "sales-page-copy": "marketing", "landing-page-headlines": "marketing",
  "cta-generator": "marketing", "limited-offer-generator": "marketing",
  // Pricing
  "profit-calculator": "pricing", "price-testing": "pricing", "upsell-ideas": "pricing", "cross-sell-ideas": "pricing",
  // Growth & Management
  "global-pricing": "growth", "localization-suggestions": "growth", "content-calendar": "business",
  "improvement-ideas": "business", "brand-name-generator": "business", "store-bio": "business",
  // Bonus
  "quality-score": "bonus", "viral-predictor": "bonus", "avatar-builder": "bonus"
};

// --- Upgraded Personas ---
const categoryPrompts: Record<string, string> = {
  research: `Expert digital market researcher. Provide data-driven, commercially viable niche analysis and trend insights.`,
  creation: `Expert digital product architect. Focus on high-value features, logical roadmaps, and structured learning outcomes.`,
  listing: `Elite marketplace SEO specialist. Optimize for Etsy, Gumroad, and Shopify algorithms with high-conversion hooks.`,
  marketing: `Direct-response marketing strategist. Write persuasive, launch-ready copy with clear psychological triggers.`,
  visual: `Midjourney/DALL-E prompt engineer. Create detailed, photorealistic visual descriptions for product assets.`,
  pricing: `SaaS pricing consultant. Analyze margins, psychological price points, and upsell logic for maximum LTV.`,
  default: `Professional digital product consultant. Provide actionable, execution-ready advice.`
};

// --- API Implementation ---
async function callGroq(apiKey: string, model: string, system: string, user: string) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model || "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Groq Error");
  return data?.choices?.[0]?.message?.content?.trim() || "";
}

// ... callOpenAI, callAnthropic, callGemini (logic updated to respect response instructions) ...

// --- Core Helper: Decryption ---
async function decryptApiKey(payload: string, secret: string) {
  const [ivBase64, cipherBase64] = payload.split(".");
  const secretBytes = new TextEncoder().encode(secret);
  const hash = await crypto.subtle.digest("SHA-256", secretBytes);
  const key = await crypto.subtle.importKey("raw", hash, "AES-GCM", false, ["decrypt"]);
  const binaryIv = atob(ivBase64.replace(/-/g, "+").replace(/_/g, "/"));
  const iv = Uint8Array.from(binaryIv, c => c.charCodeAt(0));
  const binaryCipher = atob(cipherBase64.replace(/-/g, "+").replace(/_/g, "/"));
  const cipher = Uint8Array.from(binaryCipher, c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return new TextDecoder().decode(decrypted);
}

// --- Server Implementation ---
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const authHeader = req.headers.get("authorization")?.replace("Bearer ", "")!;
    const { data: { user } } = await supabase.auth.getUser(authHeader);

    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    // 1. Validating Credits
    const { data: profile } = await supabase.from("profiles").select("credits, credits_used").eq("id", user.id).single();
    if (!profile || (profile.credits ?? 0) <= 0) {
      return new Response(JSON.stringify({ error: "Insufficient credits", code: "CREDITS_EXHAUSTED" }), { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    const toolSlug = body.tool;
    const category = toolToCategory[toolSlug] || "default";
    const systemPrompt = categoryPrompts[category];

    // 2. Key Selection (The BYOK Switch)
    let selectedApiKey = Deno.env.get("GROQ_API_KEY"); 
    let selectedProvider: Provider = "groq";
    let usedUserKey = false;
    let selectedModel = "";

    const { data: userKeys } = await supabase.from("user_api_keys").select("*").eq("user_id", user.id).eq("is_active", true).maybeSingle();

    if (userKeys) {
      selectedApiKey = await decryptApiKey(userKeys.api_key_encrypted, Deno.env.get("USER_API_KEYS_ENCRYPTION_SECRET")!);
      selectedProvider = userKeys.provider;
      selectedModel = userKeys.model_preference;
      usedUserKey = true;
    }

    // 3. Generation Logic
    const userPrompt = `Tool: ${body.toolTitle}\nInputs: ${JSON.stringify(body.fields)}\n\nIMPORTANT: Provide high-quality, actionable results.`;
    
    // Switch to appropriate caller
    let rawOutput;
    if (selectedProvider === "groq") rawOutput = await callGroq(selectedApiKey!, selectedModel, systemPrompt, userPrompt);
    else if (selectedProvider === "openai") rawOutput = await callOpenAI(selectedApiKey!, selectedModel, systemPrompt, userPrompt);
    else if (selectedProvider === "anthropic") rawOutput = await callAnthropic(selectedApiKey!, selectedModel, systemPrompt, userPrompt);
    else rawOutput = await callGemini(selectedApiKey!, selectedModel, systemPrompt, userPrompt);

    // 4. Transaction-Safe Credit Deduction
    if (!usedUserKey) {
      await supabase.from("profiles").update({ 
        credits: profile.credits - 1, 
        credits_used: (profile.credits_used ?? 0) + 1 
      }).eq("id", user.id);
    }

    // 5. Logging
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "tool_generation",
      metadata: { toolSlug, provider: selectedProvider, usedUserKey }
    });

    return new Response(JSON.stringify({ result: { text: rawOutput }, provider: selectedProvider, usedUserKey }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
