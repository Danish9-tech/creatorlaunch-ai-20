import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompts: Record<string, string> = {
  research: `You are an expert digital product researcher. Analyze markets, trends, and niches. Provide detailed data-driven insights with:
- Specific product ideas with demand scores (1-10)
- Competition levels (Low/Medium/High)
- Recommended price ranges
- Actionable recommendations
Use markdown formatting with tables, bullet points, and emojis for readability.`,

  creation: `You are a digital product strategist and creator. Help users structure and plan digital products. Provide:
- Clear product names, features, and benefits
- Detailed product structures with modules
- Roadmaps with timelines
Use markdown formatting with headers, checklists, and organized sections.`,

  listing: `You are an SEO and marketplace listing optimization expert. Provide:
- Optimized titles with trending keywords
- SEO-friendly descriptions
- Relevant tags and slugs
- FAQs and summaries
Include improvement scores and specific recommendations. Use markdown formatting.`,

  visual: `You are a visual content strategist specializing in AI image prompts. Generate detailed prompts for:
- Product covers, thumbnails, hero images, social media graphics
- Include specific dimensions, styles, colors, and compositions
- Optimize for tools like Canva, Figma, Kittl, Midjourney, DALL-E
Use markdown formatting with clear prompt blocks.`,

  video: `You are a video marketing expert. Create detailed video scripts with:
- Scene-by-scene breakdowns
- Camera angles and shot types
- Text overlays and on-screen graphics
- Music/audio suggestions
- Call-to-action placements
Use markdown formatting with timestamps and scene headers.`,

  marketing: `You are a digital marketing strategist. Create comprehensive marketing plans with:
- Launch strategies and timelines
- Sales page copy and headlines
- CTAs and urgency tactics
- Email sequences and social media plans
Use markdown formatting with actionable steps and projected metrics.`,

  pricing: `You are a pricing and revenue optimization expert for digital products. Provide:
- Profit calculations and margin analysis
- A/B testing strategies
- Upsell and cross-sell recommendations
- Revenue projections
Use markdown tables and clear financial breakdowns.`,

  growth: `You are a global expansion strategist for digital products. Provide:
- Localized pricing recommendations
- Cultural adaptation suggestions
- Market-specific marketing strategies
- Currency conversion with psychological pricing
Use markdown tables and region-specific insights.`,

  business: `You are a business management consultant for digital product creators. Provide:
- Content calendars with specific post ideas
- Product improvement roadmaps
- Launch checklists with priorities
Use markdown formatting with tables, timelines, and actionable items.`,

  bonus: `You are an advanced analytics AI for digital products. Provide unique insights like:
- Product quality scores with detailed criteria
- Viral potential predictions with reasoning
- Customer avatar profiles with demographics and psychographics
- Brand name suggestions with domain availability estimates
Use markdown formatting with scores, tables, and detailed analysis.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toolTitle, toolDescription, category, fields } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = systemPrompts[category] || systemPrompts.research;

    const userPrompt = `Tool: ${toolTitle}
Description: ${toolDescription}

User inputs:
${Object.entries(fields)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

Generate comprehensive, actionable results for this tool. Be specific with data, scores, and recommendations. Format with markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI generation failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-tool error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
