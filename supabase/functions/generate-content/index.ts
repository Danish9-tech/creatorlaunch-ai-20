// supabase/functions/generate-content/index.ts
// CreatorLaunch AI - Grok (xAI) streaming Edge Function with credit checks
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // ── 1. Auth: verify JWT and get user ──────────────────────────────────
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server misconfigured: missing SUPABASE_URL or SERVICE_ROLE_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Validate the user token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please sign in." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 2. Rate limit per user ────────────────────────────────────────────
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait 60 seconds." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }

    // ── 3. Credit pre-check ───────────────────────────────────────────────
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits, plan")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found. Please contact support." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (profile.credits < 1) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits. Please upgrade your plan to continue." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 4. Parse request body ─────────────────────────────────────────────
    const { toolTitle, toolDescription, category, fields } = await req.json();

    if (!toolTitle || !fields || typeof fields !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid request: toolTitle and fields are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 5. Grok API key check ─────────────────────────────────────────────
    const grokApiKey = Deno.env.get("GROK_API_KEY");
    if (!grokApiKey) {
      return new Response(
        JSON.stringify({ error: "GROK_API_KEY not configured. Add it in Supabase Dashboard > Edge Functions > Secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 6. Build prompt ───────────────────────────────────────────────────
    const systemPrompt = systemPrompts[category] || systemPrompts.default;
    const fieldsSummary = Object.entries(fields)
      .filter(([, v]) => v && String(v).trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const userMessage = `Tool: ${toolTitle}\nDescription: ${toolDescription || ""}\n\nUser Inputs:\n${fieldsSummary}\n\nProvide detailed, professional results. Use clear sections, bullet points, and actionable recommendations.`;

    // ── 7. Stream from Grok ───────────────────────────────────────────────
    const grokResponse = await fetch("https://api.x.ai/v1/chat/completions", {
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

    if (!grokResponse.ok) {
      const errorData = await grokResponse.json().catch(() => ({ error: { message: "Unknown error" } }));
      console.error("Grok API error:", errorData);
      return new Response(
        JSON.stringify({ error: errorData.error?.message || `Grok API error: ${grokResponse.status}` }),
        { status: grokResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 8. Stream response to client + decrement credits after done ───────
    const encoder = new TextEncoder();
    const reader = grokResponse.body!.getReader();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }

          // Decrement credits after full stream completes
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              credits: profile.credits - 1,
              credits_used: (profile as any).credits_used + 1,
            })
            .eq("id", user.id);

          if (updateError) {
            console.error("[generate-content] Failed to decrement credits:", updateError);
          }
        } catch (err) {
          console.error("[generate-content] Stream error:", err);
          controller.enqueue(encoder.encode("\ndata: [DONE]\n\n"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
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
