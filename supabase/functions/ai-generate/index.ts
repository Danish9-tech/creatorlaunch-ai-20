import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Generic prompt builder that works for all 48+ tools
function buildPrompt(toolSlug: string, fields: Record<string, any>): { system: string; user: string } {
  // Base system prompt that ensures JSON output
  const systemPrompt = `You are an AI assistant for digital product creators. Always respond with ONLY valid JSON - no markdown code fences, no explanations, no additional text. For tools that require arrays, return a JSON array. For tools that require objects, return a JSON object. Be precise and actionable.`;

  // Convert fields to a readable format
  const fieldEntries = Object.entries(fields)
    .filter(([, v]) => v !== "" && v !== null && v !== undefined)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  // Tool-specific prompts for key tools that need exact structure
  const toolSpecificPrompts: Record<string, string> = {
    "niche-finder": `Find 6 profitable niches based on these inputs:\n${fieldEntries}\n\nReturn ONLY this JSON array:\n[{"name":"Niche Name","description":"Brief description","demand":"High/Medium/Low","competition":"High/Medium/Low","profitPotential":"High/Medium/Low"}]`,
    
    "trending-keyword-finder": `Find 8 trending keywords based on:\n${fieldEntries}\n\nReturn ONLY this JSON array:\n[{"keyword":"keyword phrase","searchVolume":"High/Medium/Low","trend":"Rising/Stable/Declining"}]`,
    
    "product-name-generator": `Generate 8 product name ideas based on:\n${fieldEntries}\n\nReturn ONLY this JSON array:\n[{"name":"Product Name","reason":"Why this name works"}]`,
    
    "title-optimizer": `Optimize this product title:\n${fieldEntries}\n\nReturn ONLY this JSON object:\n{"optimizedTitle":"SEO-optimized title here","reasoning":"Why this title is better","seoKeywords":"keyword1, keyword2, keyword3"}`,
    
    "tag-generator": `Generate relevant tags for:\n${fieldEntries}\n\nReturn ONLY this JSON array:\n["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10","tag11","tag12","tag13"]`,
    
    "seo-description-improver": `Improve this SEO description:\n${fieldEntries}\n\nReturn ONLY this JSON object:\n{"improvedDescription":"Full improved description (3-4 paragraphs)","keyChanges":"Summary of improvements","seoKeywords":"keyword1, keyword2, keyword3, keyword4, keyword5"}`,
    
    "cover-prompt-generator": `Generate an AI image prompt for a product cover based on:\n${fieldEntries}\n\nReturn ONLY this JSON object:\n{"imagePrompt":"Detailed DALL-E/Midjourney prompt","style":"Art style recommendation","aspectRatio":"Recommended aspect ratio"}`,
    
    "sales-page-copy-generator": `Create sales page copy for:\n${fieldEntries}\n\nReturn ONLY this JSON object:\n{"headline":"Compelling headline","subheadline":"Supporting subheadline","benefits":"Key benefits section","socialProof":"Social proof section","cta":"Call to action"}`,
    
    "profit-calculator": `Calculate profit for:\n${fieldEntries}\n\nReturn ONLY this JSON object:\n{"revenue":"$XX.XX","costs":"$XX.XX","profit":"$XX.XX","profitMargin":"XX%","breakdown":"Detailed calculation explanation"}`,
  };

  // Use tool-specific prompt if available, otherwise use generic
  const userPrompt = toolSpecificPrompts[toolSlug] || 
    `Tool: ${toolSlug}\n\nInputs:\n${fieldEntries}\n\nProvide a comprehensive, actionable response in valid JSON format. Structure your response appropriately (array for lists, object for single results).`;

  return {
    system: systemPrompt,
    user: userPrompt,
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
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token || "");

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const toolSlug: string = body.tool || "";
    const fields: Record<string, any> = body.fields || body.inputs || {};

    const userHasOwnKey = profile.user_api_key && profile.user_api_key.trim() !== "";

    if (!userHasOwnKey) {
      const plan = profile.plan || "free";
      const creditsUsed = profile.credits_used || 0;
      const planLimits: Record<string, number> = {
        free: 10,
        pro: 100,
        premium: 999999,
      };
      const limit = planLimits[plan] || 10;

      if (creditsUsed >= limit) {
        return new Response(
          JSON.stringify({
            error: `Generation limit reached. You've used ${creditsUsed}/${limit} generations. Upgrade your plan or add your own API key.`,
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
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
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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
      const cleaned = content
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/gi, "")
        .trim();
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

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
