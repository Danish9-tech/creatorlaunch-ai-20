import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const toolToCategory: Record<string, string> = {
  "idea-generator": "creation",
  "product-creator": "creation",
  "trend-finder": "research",
  "listings-generator": "listing",
  "marketing-generator": "marketing",
  "seo-tools": "listing",
  "competitor-analyzer": "research",
  "pricing-optimizer": "pricing",
};

const categoryPrompts: Record<string, string> = {
  research: "You are an expert digital market researcher. Provide data-driven insights with actionable recommendations.",
  creation: "You are a creative digital product expert. Generate innovative, practical product ideas and solutions.",
  listing: "You are an SEO specialist. Create optimized titles, tags, and descriptions for maximum discoverability.",
  marketing: "You are a marketing strategist. Write compelling, high-conversion copy and campaigns.",
  pricing: "You are a pricing strategist. Analyze markets and recommend optimal pricing strategies.",
  default: "You are a professional digital consultant. Provide clear, actionable advice.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const token = authHeader?.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token || "");
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile
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
    const toolTitle: string = body.toolTitle || toolSlug;
    const fields: Record<string, any> = body.fields || body.inputs || {};

    // Check if user has their own API key
    const userHasOwnKey = profile.user_api_key && profile.user_api_key.trim() !== "";
    
    // If user doesn't have own API key, check plan limits
    if (!userHasOwnKey) {
      const plan = profile.plan || "free";
      const creditsUsed = profile.credits_used || 0;
      const credits = profile.credits || 50;
      
      // Plan limits: free=10, pro=100, premium=unlimited
      const planLimits: Record<string, number> = {
        free: 10,
        pro: 100,
        premium: 999999,
      };
      
      const limit = planLimits[plan] || 10;
      
      if (creditsUsed >= limit) {
        return new Response(
          JSON.stringify({ 
            error: `Generation limit reached. You've used ${creditsUsed}/${limit} generations. Upgrade your plan or add your own API key.`
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Build prompt
    const fieldEntries = Object.entries(fields)
      .filter(([, v]) => v !== "" && v !== null && v !== undefined)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const category = toolToCategory[toolSlug] || "default";
    const systemPrompt = categoryPrompts[category];
    const userPrompt = `Tool: ${toolTitle}\n\nInputs:\n${fieldEntries}\n\nProvide a comprehensive, well-structured response.`;

    // Determine which API key to use
    let apiKey: string;
    let apiProvider = profile.user_api_provider || "groq";
    
    if (userHasOwnKey) {
      apiKey = profile.user_api_key;
    } else {
      apiKey = Deno.env.get("GROQ_API_KEY") || "";
      apiProvider = "groq";
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Groq API
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
        JSON.stringify({ error: "AI generation failed. Check your API key if using your own." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment generation count only if using platform API key
    if (!userHasOwnKey) {
      await supabase.rpc("increment_generation_count", { user_uuid: user.id });
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
