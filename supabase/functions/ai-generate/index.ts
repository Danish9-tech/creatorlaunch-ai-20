// supabase/functions/ai-generate/index.ts
// CreatorLaunch AI - Main Edge Function (renamed from generate-tool)
// Fixes: NaN credits_used bug, proper auth, credit deduction
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const systemPrompts: Record<string, string> = {
  research: `You are an expert digital product researcher. Analyze markets, trends, and niches. Provide actionable insights with:
- Specific product ideas with demand scores (1-10)
- Competition analysis
- Profit potential estimates
- Target audience details
Be specific, data-driven, and practical.`,
  creation: `You are an expert digital product creator and copywriter. Create compelling, conversion-optimized content:
- Engaging titles and descriptions
- Clear value propositions
- Benefit-focused copy
- SEO-optimized text
Make content professional and ready to publish.`,
  listing: `You are an expert marketplace listing optimizer. Create listings that rank and convert:
- Platform-specific optimization
- Keyword-rich titles and descriptions
- Bullet points highlighting benefits
- Pricing strategy suggestions
Focus on maximizing visibility and sales.`,
  marketing: `You are an expert digital marketing strategist. Create data-driven marketing strategies:
- Multi-channel campaign plans
- Content calendar suggestions
- Audience targeting strategies
- ROI optimization tips
Provide actionable, measurable strategies.`,
  seo: `You are an expert SEO specialist for digital products. Optimize for search visibility with keyword research, meta optimization, and search intent analysis.`,
  social: `You are an expert social media content creator. Create engaging platform-specific content with hooks, hashtag strategies, and viral-worthy CTAs.`,
  email: `You are an expert email marketing copywriter. Create high-converting emails with compelling subject lines, personalized hooks, and strong CTAs.`,
  default: `You are an expert digital product business consultant. Provide professional, actionable advice tailored to digital product creators selling on platforms like Gumroad, Etsy, Shopify, and Creative Market. Be specific, practical, and results-focused.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── 1. Auth ──────────────────────────────────────────────────
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

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please sign in." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 2. Credit pre-check (FIX: defaults to 0 if null/undefined) ─
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits, credits_used, plan")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found. Please contact support." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // FIX: Use nullish coalescing to prevent NaN bug
    // Before: credits_used + 1 would be NaN if credits_used was undefined
    const currentCredits = profile.credits ?? 50;
    const currentCreditsUsed = profile.credits_used ?? 0;

    if (currentCredits < 1) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits. Please upgrade your plan to continue.", code: "CREDITS_EXHAUSTED" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 3. Parse request body ────────────────────────────────────
    const { toolTitle, toolDescription, category, fields, tool } = await req.json();

    if (!toolTitle || !fields || typeof fields !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid request: toolTitle and fields are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 4. Grok API key ─────────────────────────────────────────
    const grokApiKey = Deno.env.get("GROK_API_KEY");
    if (!grokApiKey) {
      return new Response(
        JSON.stringify({ error: "GROK_API_KEY not configured. Add it in Supabase Dashboard > Edge Functions > Secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 5. Build prompt ─────────────────────────────────────────
    const systemPrompt = systemPrompts[category] || systemPrompts.default;
    const fieldsSummary = Object.entries(fields)
      .filter(([, v]) => v && String(v).trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const userMessage = `Tool: ${toolTitle}\nDescription: ${toolDescription || ""}\n\nUser Inputs:\n${fieldsSummary}\n\nProvide detailed, professional results. Use clear sections, bullet points, and actionable recommendations.`;

    // ── 6. Call Grok (streaming) ─────────────────────────────────
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

    // ── 7. Stream response + deduct credits when done ────────────
    const reader = grokResponse.body!.getReader();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }

          // FIX: Both values guaranteed to be numbers now (not undefined/null)
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              credits: currentCredits - 1,
              credits_used: currentCreditsUsed + 1,  // No NaN possible
            })
            .eq("id", user.id);

          if (updateError) {
            console.error("[ai-generate] Failed to decrement credits:", updateError);
          }

          // Log activity
          await supabase.from("activity_logs").insert({
            user_id: user.id,
            action: "tool_generation",
            entity_type: "tool",
            metadata: { tool_slug: tool || category, tool_title: toolTitle },
          }).catch((e: Error) => console.warn("[ai-generate] Activity log failed:", e.message));

        } catch (err) {
          console.error("[ai-generate] Stream error:", err);
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
    console.error("Error in ai-generate function:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
