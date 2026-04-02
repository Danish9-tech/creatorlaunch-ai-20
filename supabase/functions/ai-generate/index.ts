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

    if (!user) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    // 1. Credit Check
    const { data: profile } = await supabase.from("profiles").select("credits").eq("id", user.id).single();
    if (!profile || (profile.credits ?? 0) <= 0) {
      return new Response(JSON.stringify({ error: "No credits left" }), { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    const toolSlug = body.tool;
    const systemPrompt = categoryPrompts[toolToCategory[toolSlug] || "default"];

    // 2. Key Selection Logic
    const { data: userKey } = await supabase.from("user_api_keys").select("*").eq("user_id", user.id).eq("is_active", true).maybeSingle();
    
    let apiKey = Deno.env.get("GROQ_API_KEY"); // Default Platform Key
    let apiUrl = "https://api.groq.com/openai/v1/chat/completions";
    let model = "llama-3.3-70b-versatile";

    if (userKey) {
       // Logic to use User's specific Provider (OpenAI, Gemini, etc.)
       // For brevity in this example, we assume they are OpenAI-compatible
       apiKey = "DECRYPTED_USER_KEY_LOGIC_HERE"; 
       model = userKey.model_preference || "gpt-4o-mini";
       apiUrl = userKey.provider === "openai" ? "https://api.openai.com/v1/chat/completions" : apiUrl;
    }

    // 3. Initiate Streaming Request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: JSON.stringify(body.fields) }],
        stream: true, // Crucial for responsive feel
      }),
    });

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

        // 5. Post-Generation Credit Deduction
        if (!userKey) {
          await supabase.from("profiles").update({ credits: profile.credits - 1 }).eq("id", user.id);
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: corsHeaders });
  }
});
