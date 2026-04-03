import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ---------- Tool → Category mapping (all 40 tools) ----------
const toolToCategory: Record<string, string> = {
  // Research (6)
  "niche-finder": "research",
  "trending-keywords": "research",
  "low-competition": "research",
  "best-selling-analyzer": "research",
  "market-demand-score": "research",
  "seasonal-ideas": "research",
  // Creation (5)
  "product-name": "creation",
  "feature-generator": "creation",
  "benefit-generator": "creation",
  "structure-builder": "creation",
  "roadmap-generator": "creation",
  // Listing / SEO (6)
  "title-optimizer": "listing",
  "tag-generator": "listing",
  "description-improver": "listing",
  "slug-generator": "listing",
  "faq-generator": "listing",
  "summary-generator": "listing",
  // Visual prompts (4)
  "cover-prompt": "visual",
  "thumbnail-prompt": "visual",
  "hero-prompt": "visual",
  "social-prompt": "visual",
  // Video (3)
  "short-ad-script": "video",
  "youtube-script": "video",
  "tiktok-reels-script": "video",
  // Marketing (5)
  "launch-plan": "marketing",
  "sales-page-copy": "marketing",
  "landing-page-headlines": "marketing",
  "cta-generator": "marketing",
  "limited-offer-generator": "marketing",
  // Pricing (4)
  "profit-calculator": "pricing",
  "price-testing": "pricing",
  "upsell-ideas": "pricing",
  "cross-sell-ideas": "pricing",
  // Growth (2)
  "global-pricing": "growth",
  "localization-suggestions": "growth",
  // Business (4)
  "content-calendar": "business",
  "improvement-ideas": "business",
  "brand-name-generator": "business",
  "store-bio": "business",
  // Bonus (3)
  "quality-score": "bonus",
  "viral-predictor": "bonus",
  "avatar-builder": "bonus",
  // Pricing optimizer
  "pricing-optimizer": "pricing",
  // Idea generator
  "idea-generator": "creation",
};

const categoryPrompts: Record<string, string> = {
  research:
    "You are an expert digital market researcher. Provide data-driven niche insights, keyword analysis, and market trends. Be specific with numbers and actionable recommendations.",
  creation:
    "You are an expert digital product architect. Create high-value, structured outlines, product names, feature lists, and roadmaps. Be creative yet practical.",
  listing:
    "You are an elite marketplace SEO specialist. Optimize titles, tags, descriptions, and FAQs for Etsy, Gumroad, and similar platforms. Focus on discoverability and conversion.",
  marketing:
    "You are a direct-response marketing strategist. Write high-conversion sales copy, launch plans, CTAs, and landing page headlines. Be persuasive and action-oriented.",
  visual:
    "You are a creative director specializing in AI image generation. Generate detailed, photorealistic prompts for tools like Midjourney, DALL-E, and Stable Diffusion. Include style, lighting, composition details.",
  video:
    "You are a viral video strategist. Write engaging scripts for TikTok, Instagram Reels, and YouTube ads. Focus on hooks, pacing, and calls to action.",
  pricing:
    "You are a pricing strategy expert for digital products. Analyze markets and recommend optimal price points, upsell strategies, and profit calculations with clear reasoning.",
  growth:
    "You are a global growth consultant for digital product sellers. Provide localization tips, international pricing strategies, and expansion recommendations.",
  business:
    "You are a digital business consultant. Help with content calendars, brand naming, store bios, and product improvement strategies. Be actionable and organized.",
  bonus:
    "You are a digital product quality analyst. Score products, predict virality, and build customer avatars with detailed reasoning.",
  default:
    "You are a professional digital product consultant. Provide clear, actionable advice tailored to the user's request.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const toolSlug: string = body.tool || "";
    const toolTitle: string = body.toolTitle || toolSlug;
    const fields: Record<string, any> = body.fields || body.inputs || {};

    // Build a rich user prompt from the fields
    const fieldEntries = Object.entries(fields)
      .filter(([, v]) => v !== "" && v !== null && v !== undefined)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const category = toolToCategory[toolSlug] || "default";
    const systemPrompt = categoryPrompts[category];

    const userPrompt = `Tool: ${toolTitle}\n\nUser inputs:\n${fieldEntries}\n\nProvide a comprehensive, well-structured response. Use markdown formatting with headers, bullet points, and bold text where appropriate.`;

    // Use Lovable AI Gateway
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured. LOVABLE_API_KEY is missing." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: true,
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "AI generation failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse SSE stream and extract only content deltas, then stream plain text to client
    const reader = aiResponse.body?.getReader();
    if (!reader) {
      return new Response(
        JSON.stringify({ error: "No response stream from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Process complete lines
            let newlineIdx: number;
            while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
              let line = buffer.slice(0, newlineIdx);
              buffer = buffer.slice(newlineIdx + 1);

              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (!line.startsWith("data: ")) continue;

              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch {
                // partial JSON, ignore
              }
            }
          }

          // Flush remaining buffer
          if (buffer.trim()) {
            for (let raw of buffer.split("\n")) {
              if (!raw) continue;
              if (raw.endsWith("\r")) raw = raw.slice(0, -1);
              if (!raw.startsWith("data: ")) continue;
              const jsonStr = raw.slice(6).trim();
              if (jsonStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(content));
                }
              } catch { /* ignore */ }
            }
          }
        } catch (e) {
          console.error("Stream processing error:", e);
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
