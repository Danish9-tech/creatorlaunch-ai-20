import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Tool-specific prompts that force the exact JSON structure each frontend expects
const toolPrompts: Record<string, { system: string; userTemplate: string }> = {
  "idea-generator": {
    system: "You are a creative digital product expert. Always respond with ONLY valid JSON - no markdown, no explanation.",
    userTemplate: (fields: Record<string, string>) =>
      `Generate 6 digital product ideas for niche: ${fields.niche}, target audience: ${fields.audience}, product type: ${fields.type}.
Return ONLY this JSON array:
[{"name":"Product Name","description":"Brief description","price":"$X-$Y","demand":"High/Medium/Low","competition":"High/Medium/Low"}]`,
  },
  "trend-finder": {
    system: "You are a digital market researcher. Always respond with ONLY valid JSON - no markdown, no explanation.",
    userTemplate: (fields: Record<string, string>) =>
      `Find 6 trending topics for niche: ${fields.niche}, timeframe: ${fields.timeframe}.
Return ONLY this JSON array:
[{"trend":"Trend Name","description":"Brief description","potential":"High/Medium/Low"}]`,
  },
  "competitor-analyzer": {
    system: "You are a market research analyst. Always respond with ONLY valid JSON - no markdown, no explanation.",
    userTemplate: (fields: Record<string, string>) =>
      `Analyze 5 top competitors in niche: ${fields.niche} on platform: ${fields.platform}.
Return ONLY this JSON array:
[{"name":"Competitor/Shop Name","strength":"Key strength","weakness":"Key weakness","price":"$X-$Y"}]`,
  },
  "listings-generator": {
    system: "You are an SEO specialist for digital product marketplaces. Always respond with ONLY valid JSON - no markdown, no explanation.",
    userTemplate: (fields: Record<string, string>) =>
      `Create a complete optimized listing for product: ${fields.product} on platform: ${fields.platform}.
Return ONLY this JSON object:
{"title":"SEO optimized title","category":"Best category","description":"Full compelling description (3-4 paragraphs)","tags":"tag1, tag2, tag3, tag4, tag5, tag6, tag7, tag8, tag9, tag10, tag11, tag12, tag13","pricingOptions":"Recommended pricing tiers","seoKeywords":"keyword1, keyword2, keyword3, keyword4, keyword5","targetAudience":"Who this is for","imageIdeas":"7 image ideas for the listing","policies":"Recommended policies","uniqueAngle":"Your competitive advantage","publishingChecklist":"Step by step publishing checklist"}`,
  },
  "marketing-generator": {
    system: "You are a marketing copywriter. Always respond with ONLY valid JSON - no markdown, no explanation.",
    userTemplate: (fields: Record<string, string>) =>
      `Create marketing copy for product: ${fields.product}, target audience: ${fields.audience}, platform: ${fields.platform}.
Return ONLY this JSON object:
{"headline":"Compelling headline","emailSubject":"Email subject line","instagramCaption":"Full Instagram caption with hashtags","twitterPost":"Twitter/X post under 280 chars","pinterestDescription":"Pinterest description"}`,
  },
  "seo-tools": {
    system: "You are an SEO expert. Always respond with ONLY valid JSON - no markdown, no explanation.",
    userTemplate: (fields: Record<string, string>) =>
      `Optimize SEO for product: ${fields.product}, keywords: ${fields.keywords}, platform: ${fields.platform}.
Return ONLY this JSON object:
{"title":"SEO optimized title tag","metaDescription":"Meta description under 160 chars","keywords":"keyword1, keyword2, keyword3, keyword4, keyword5, keyword6, keyword7, keyword8","h1Tags":"Primary H1 tag suggestion"}`,
  },
  "pricing-optimizer": {
    system: "You are a pricing strategist. Always respond with ONLY valid JSON - no markdown, no explanation.",
    userTemplate: (fields: Record<string, string>) =>
      `Optimize pricing for product: ${fields.product}, niche: ${fields.niche}, current price: $${fields.currentPrice}.
Return ONLY this JSON object:
{"recommendedPrice":"$XX.XX","priceRange":{"min":"$X","max":"$XX"},"reasoning":"Detailed pricing rationale and strategy"}`,
  },
};

function buildPrompt(toolSlug: string, fields: Record<string, string>): { system: string; user: string } {
  const config = toolPrompts[toolSlug];
  if (config) {
    return {
      system: config.system,
      user: (config.userTemplate as any)(fields),
    };
  }
  // Generic fallback
  const fieldEntries = Object.entries(fields)
    .filter(([, v]) => v !== "" && v !== null && v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return {
    system: "You are a professional digital consultant. Provide clear, actionable advice.",
    user: `Tool: ${toolSlug}\n\nInputs:\n${fieldEntries}\n\nProvide a comprehensive response.`,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token || "");

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const toolSlug: string = body.tool || "";
    const fields: Record<string, string> = body.fields || body.inputs || {};

    const userHasOwnKey = profile.user_api_key && profile.user_api_key.trim() !== "";

    if (!userHasOwnKey) {
      const plan = profile.plan || "free";
      const creditsUsed = profile.credits_used || 0;
      const planLimits: Record<string, number> = { free: 10, pro: 100, premium: 999999 };
      const limit = planLimits[plan] || 10;
      if (creditsUsed >= limit) {
        return new Response(
          JSON.stringify({ error: `Generation limit reached. You've used ${creditsUsed}/${limit} generations. Upgrade your plan or add your own API key.` }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let apiKey: string;
    if (userHasOwnKey) {
      apiKey = profile.user_api_key;
    } else {
      apiKey = Deno.env.get("GROQ_API_KEY") || "";
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { system, user: userMsg } = buildPrompt(toolSlug, fields);

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: system },
            { role: "user", content: userMsg },
          ],
          stream: false,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    );

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq API error:", groqResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "AI generation failed. Check your API key." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const groqData = await groqResponse.json();
    const content: string = groqData.choices?.[0]?.message?.content || "";

    if (!userHasOwnKey) {
      await supabase.rpc("increment_generation_count", { user_uuid: user.id });
    }

    // Extract JSON from the response (strip markdown code fences if present)
    let result: unknown = content;
    try {
      // Remove markdown code fences
      const cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();
      // Try direct parse first
      result = JSON.parse(cleaned);
    } catch {
      try {
        // Try to extract JSON array or object
        const jsonMatch = content.match(/(\[\s*\{[\s\S]*\}\s*\]|\{[\s\S]*\})/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Keep as text string
      }
    }

    return new Response(
      JSON.stringify({ result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
