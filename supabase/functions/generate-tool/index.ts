import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-version",
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
  default: `You are an expert digital product business consultant. Provide professional, actionable advice tailored to digital product creators selling on platforms like Gumroad, Etsy, Shopify, and Creative Market. Be specific, practical, and results-focused.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { toolTitle, toolDescription, category, fields } = await req.json();

    const grokApiKey = Deno.env.get("GROK_API_KEY");
    if (!grokApiKey) {
      return new Response(
        JSON.stringify({ error: "Grok API key not configured. Please add GROK_API_KEY in Supabase Edge Function secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = systemPrompts[category] || systemPrompts.default;

    const fieldsSummary = Object.entries(fields)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const userMessage = `Tool: ${toolTitle}\nDescription: ${toolDescription}\n\nUser Inputs:\n${fieldsSummary}\n\nPlease provide detailed, professional results for this tool. Format your response clearly with sections, bullet points where appropriate, and actionable recommendations.`;

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${grokApiKey}`,
      },
      body: JSON.stringify({
        model: "grok-3",
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

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in generate-tool function:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
