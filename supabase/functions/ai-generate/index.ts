import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Tool category mappings
const toolToCategory: Record<string, string> = {
  "idea-generator": "creation",
  "product-creator": "creation",
  "trend-finder": "research",
  "listings-generator": "listing",
  "marketing-generator": "marketing",
};

const categoryPrompts: Record<string, string> = {
  research: "You are an expert digital market researcher. Provide data-driven insights and actionable recommendations.",
  creation: "You are an expert digital product creator. Generate creative, practical product ideas and solutions.",
  listing: "You are an SEO specialist. Optimize titles, tags, descriptions for maximum discoverability.",
  marketing: "You are a marketing strategist. Write high-conversion copy and compelling campaigns.",
  default: "You are a professional digital consultant. Provide clear, actionable advice.",
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

    // Build user prompt
    const fieldEntries = Object.entries(fields)
      .filter(([, v]) => v !== "" && v !== null)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const category = toolToCategory[toolSlug] || "default";
    const systemPrompt = categoryPrompts[category];
    const userPrompt = `Tool: ${toolTitle}\n\nInputs:\n${fieldEntries}\n\nProvide a comprehensive response with clear formatting.`;

    // Use Groq API
    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    );

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq API error:", groqResponse.status, errText);
      return new Response(
        JSON.stringify({ error: "AI generation failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream response
    const reader = groqResponse.body?.getReader();
    if (!reader) {
      return new Response(
        JSON.stringify({ error: "No response stream" }),
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
              } catch { }
            }
          }
        } catch (e) {
          console.error("Stream error:", e);
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
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
