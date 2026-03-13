// supabase/functions/generate-content/index.ts
// CreatorLaunch AI - Grok (xAI) streaming Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const systemPrompts: Record<string, string> = {
  research: `You are an expert digital product researcher. Provide actionable insights with demand scores, competition analysis, and profit potential estimates.`,
  creation: `You are an expert digital product creator and copywriter. Create compelling, conversion-optimized content with engaging titles, value propositions, and SEO-optimized text.`,
  listing: `You are an expert marketplace listing optimizer. Create listings that rank and convert with keyword-rich titles, bullet points, and pricing strategy suggestions.`,
  marketing: `You are an expert digital marketing strategist. Create data-driven multi-channel marketing strategies with measurable ROI.`,
  seo: `You are an expert SEO specialist for digital products. Optimize for search visibility with keyword research, meta optimization, and search intent analysis.`,
  social: `You are an expert social media content creator. Create engaging platform-specific content with hooks, hashtag strategies, and viral-worthy CTAs.`,
  email: `You are an expert email marketing copywriter. Create high-converting emails with compelling subject lines, personalized hooks, and strong CTAs.`,
  default: `You are an expert digital product business consultant. Provide professional, actionable advice for creators selling on Gumroad, Etsy, Shopify, and Creative Market.`,
};

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string, maxRequests = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("x-forwarded-for") || "unknown";
    const identifier = authHeader.substring(0, 50);

    if (!checkRateLimit(identifier)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait 60 seconds." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }

    const { toolTitle, toolDescription, category, fields } = await req.json();

    if (!toolTitle || !fields || typeof fields !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid request: toolTitle and fields are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const grokApiKey = Deno.env.get("GROK_API_KEY");
    if (!grokApiKey) {
      return new Response(
        JSON.stringify({ error: "GROK_API_KEY not configured. Add it in Supabase Dashboard > Edge Functions > Secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = systemPrompts[category] || systemPrompts.default;
    const fieldsSummary = Object.entries(fields)
      .filter(([, v]) => v && String(v).trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const userMessage = `Tool: ${toolTitle}\nDescription: ${toolDescription || ""}\n\nUser Inputs:\n${fieldsSummary}\n\nProvide detailed, professional results. Use clear sections, bullet points, and actionable recommendations.`;

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${grokApiKey}`,
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: true,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
      console.error("Grok API error:", errorData);
      return new Response(
        JSON.stringify({ error: errorData.error?.message || `Grok API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in generate-content:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
