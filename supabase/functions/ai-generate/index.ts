import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Provider = "grok" | "openai" | "anthropic" | "gemini";

type StoredApiKey = {
  provider: Provider;
  api_key_encrypted: string;
  model_preference: string | null;
  is_active: boolean | null;
};

const categoryPrompts: Record<string, string> = {
  research: `You are an expert digital product researcher. Analyze markets, trends, and niches. Give specific, practical, commercially useful advice.`,
  creation: `You are an expert digital product creator and copywriter. Create compelling, conversion-focused content that is ready to publish.`,
  listing: `You are an expert marketplace listing optimizer. Create keyword-rich, platform-aware listings that improve conversion and discoverability.`,
  marketing: `You are an expert digital marketing strategist. Produce channel-specific campaigns, hooks, and calls to action with measurable recommendations.`,
  seo: `You are an expert SEO strategist for digital products. Optimize titles, descriptions, keywords, and search intent alignment.`,
  social: `You are an expert social media content creator. Produce engaging, platform-native content with strong hooks and CTAs.`,
  email: `You are an expert email marketer. Write concise, persuasive subject lines and email copy with clear CTAs.`,
  pricing: `You are an expert pricing strategist for digital products. Recommend pricing based on positioning, perceived value, audience, and conversion tradeoffs.`,
  visual: `You are an expert creative director. Produce prompts and visual direction that can be used in design and image-generation tools.`,
  video: `You are an expert short-form and product video strategist. Generate practical scripts, hooks, scenes, and production ideas.`,
  growth: `You are an expert growth strategist for creator businesses. Recommend experiments, positioning, and internationalization ideas that are specific and practical.`,
  business: `You are an expert digital product operator. Produce structured workflows, plans, and business recommendations that are execution-ready.`,
  bonus: `You are an expert evaluator and strategist for creator products. Deliver direct, actionable analysis with concrete scoring rationale.`,
  default: `You are an expert digital product business consultant. Provide professional, actionable advice tailored to digital product creators.`,
};

const customToolConfigs: Record<string, { title: string; category: string; schema: string }> = {
  "idea-generator": {
    title: "Product Idea Generator",
    category: "research",
    schema: `Return ONLY valid JSON in this exact shape:
{"result":[{"name":"string","description":"string","price":"string","demand":"string","competition":"string"}]}`,
  },
  "competitor-analyzer": {
    title: "Competitor Analyzer",
    category: "research",
    schema: `Return ONLY valid JSON in this exact shape:
{"result":[{"name":"string","strength":"string","weakness":"string","price":"string"}]}`,
  },
  "trend-finder": {
    title: "Trend Finder",
    category: "research",
    schema: `Return ONLY valid JSON in this exact shape:
{"result":[{"trend":"string","description":"string","potential":"High|Medium|Low"}]}`,
  },
  "listings-generator": {
    title: "Listings Generator",
    category: "listing",
    schema: `Return ONLY valid JSON in this exact shape:
{"result":{"title":"string","category":"string","description":"string","tags":"comma-separated string","pricingOptions":"string","seoKeywords":"comma-separated string","targetAudience":"string","imageIdeas":"string","policies":"string","uniqueAngle":"string","publishingChecklist":"string"}}`,
  },
  "marketing-generator": {
    title: "Marketing Generator",
    category: "marketing",
    schema: `Return ONLY valid JSON in this exact shape:
{"result":{"headline":"string","emailSubject":"string","instagramCaption":"string","twitterPost":"string","pinterestDescription":"string"}}`,
  },
  "seo-tools": {
    title: "SEO Tools",
    category: "seo",
    schema: `Return ONLY valid JSON in this exact shape:
{"result":{"title":"string","metaDescription":"string","keywords":"comma-separated string","h1Tags":"string"}}`,
  },
  "pricing-optimizer": {
    title: "Pricing Optimizer",
    category: "pricing",
    schema: `Return ONLY valid JSON in this exact shape:
{"result":{"recommendedPrice":"string","priceRange":{"min":"string","max":"string"},"reasoning":"string"}}`,
  },
};

function decodeBase64(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encodeBase64(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function getEncryptionKey(secret: string) {
  const secretBytes = new TextEncoder().encode(secret);
  const digest = await crypto.subtle.digest("SHA-256", secretBytes);
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function decryptApiKey(payload: string, secret: string) {
  const [ivBase64, cipherBase64] = payload.split(".");
  if (!ivBase64 || !cipherBase64) {
    throw new Error("Invalid encrypted API key payload.");
  }

  const key = await getEncryptionKey(secret);
  const iv = decodeBase64(ivBase64);
  const cipher = decodeBase64(cipherBase64);
  const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return new TextDecoder().decode(plainBuffer);
}

function extractJsonBlock(content: string) {
  const fenced = content.match(/```json\s*([\s\S]*?)```/i) || content.match(/```\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = content.indexOf("{");
  const firstBracket = content.indexOf("[");
  const startCandidates = [firstBrace, firstBracket].filter((index) => index >= 0);
  const start = startCandidates.length ? Math.min(...startCandidates) : -1;
  if (start === -1) return content.trim();

  const lastBrace = content.lastIndexOf("}");
  const lastBracket = content.lastIndexOf("]");
  const end = Math.max(lastBrace, lastBracket);
  return end > start ? content.slice(start, end + 1).trim() : content.trim();
}

async function callOpenAI(apiKey: string, model: string, system: string, user: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
      max_tokens: 1800,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenAI API error: ${response.status}`);
  }

  return data?.choices?.[0]?.message?.content?.trim() || "";
}

async function callGrok(apiKey: string, model: string, system: string, user: string) {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.7,
      max_tokens: 1800,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `Grok API error: ${response.status}`);
  }

  return data?.choices?.[0]?.message?.content?.trim() || "";
}

async function callAnthropic(apiKey: string, model: string, system: string, user: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      system,
      max_tokens: 1800,
      messages: [{ role: "user", content: user }],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `Anthropic API error: ${response.status}`);
  }

  const content = Array.isArray(data?.content)
    ? data.content
        .filter((item: { type?: string }) => item?.type === "text")
        .map((item: { text?: string }) => item.text || "")
        .join("\n")
    : "";

  return content.trim();
}

async function callGemini(apiKey: string, model: string, system: string, user: string) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: system }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: user }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1800,
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `Gemini API error: ${response.status}`);
  }

  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  return parts.map((part: { text?: string }) => part.text || "").join("\n").trim();
}

async function generateWithProvider(provider: Provider, apiKey: string, model: string, system: string, user: string) {
  switch (provider) {
    case "openai":
      return callOpenAI(apiKey, model || "gpt-4o-mini", system, user);
    case "anthropic":
      return callAnthropic(apiKey, model || "claude-3-5-haiku-latest", system, user);
    case "gemini":
      return callGemini(apiKey, model || "gemini-1.5-flash", system, user);
    case "grok":
    default:
      return callGrok(apiKey, model || "grok-3-mini", system, user);
  }
}

function getPlatformKey(provider: Provider) {
  switch (provider) {
    case "openai":
      return Deno.env.get("OPENAI_API_KEY") || null;
    case "anthropic":
      return Deno.env.get("ANTHROPIC_API_KEY") || null;
    case "gemini":
      return Deno.env.get("GEMINI_API_KEY") || null;
    case "grok":
    default:
      return Deno.env.get("GROK_API_KEY") || null;
  }
}

function normalizeRequest(body: Record<string, unknown>) {
  const tool = typeof body.tool === "string" ? body.tool : "";
  const customTool = customToolConfigs[tool];
  const fields = typeof body.fields === "object" && body.fields
    ? body.fields as Record<string, unknown>
    : typeof body.inputs === "object" && body.inputs
      ? body.inputs as Record<string, unknown>
      : {};

  const category = typeof body.category === "string"
    ? body.category
    : customTool?.category || "default";

  const toolTitle = typeof body.toolTitle === "string" && body.toolTitle.trim()
    ? body.toolTitle
    : customTool?.title || tool || "AI Tool";

  const toolDescription = typeof body.toolDescription === "string"
    ? body.toolDescription
    : "";

  const preferredProvider = typeof body.provider === "string"
    ? body.provider as Provider
    : null;

  return {
    tool,
    toolTitle,
    toolDescription,
    category,
    fields,
    preferredProvider,
    customTool,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const encryptionSecret = Deno.env.get("USER_API_KEYS_ENCRYPTION_SECRET")!;

    if (!supabaseUrl || !serviceRoleKey || !encryptionSecret) {
      return new Response(
        JSON.stringify({ error: "Server misconfigured: missing Supabase or encryption secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Please sign in." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits, credits_used, plan")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found. Please contact support." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const currentCredits = profile.credits ?? 50;
    const currentCreditsUsed = profile.credits_used ?? 0;

    if (currentCredits < 1) {
      return new Response(
        JSON.stringify({ error: "Insufficient credits. Please upgrade your plan to continue.", code: "CREDITS_EXHAUSTED" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const { tool, toolTitle, toolDescription, category, fields, preferredProvider, customTool } =
      normalizeRequest(body as Record<string, unknown>);

    if (!toolTitle || !fields || typeof fields !== "object" || Object.keys(fields).length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: tool details and inputs are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: userKeys } = await supabase
      .from("user_api_keys")
      .select("provider, api_key_encrypted, model_preference, is_active")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    const candidateProviders: Provider[] = preferredProvider
      ? [preferredProvider, "grok", "openai", "anthropic", "gemini"].filter(
          (provider, index, all) => all.indexOf(provider) === index,
        ) as Provider[]
      : [];

    const activeUserKeys = ((userKeys || []) as StoredApiKey[]).filter((entry) => entry?.provider);
    for (const entry of activeUserKeys) {
      if (!candidateProviders.includes(entry.provider)) candidateProviders.push(entry.provider);
    }
    for (const provider of ["grok", "openai", "anthropic", "gemini"] as Provider[]) {
      if (!candidateProviders.includes(provider)) candidateProviders.push(provider);
    }

    let selectedProvider: Provider | null = null;
    let selectedApiKey: string | null = null;
    let selectedModel = "";
    let usedUserKey = false;

    for (const provider of candidateProviders) {
      const userKey = activeUserKeys.find((entry) => entry.provider === provider);
      if (userKey?.api_key_encrypted) {
        try {
          selectedApiKey = await decryptApiKey(userKey.api_key_encrypted, encryptionSecret);
          selectedProvider = provider;
          selectedModel = userKey.model_preference || "";
          usedUserKey = true;
          break;
        } catch (error) {
          console.error(`[ai-generate] Failed to decrypt ${provider} key:`, error);
        }
      }

      const platformKey = getPlatformKey(provider);
      if (platformKey) {
        selectedApiKey = platformKey;
        selectedProvider = provider;
        usedUserKey = false;
        break;
      }
    }

    if (!selectedProvider || !selectedApiKey) {
      return new Response(
        JSON.stringify({ error: "No AI provider key is configured. Add a platform key or save your own key in Settings." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemPrompt = categoryPrompts[category] || categoryPrompts.default;
    const fieldsSummary = Object.entries(fields)
      .filter(([, value]) => value !== null && value !== undefined && String(value).trim())
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    const responseInstruction = customTool?.schema
      ? `\n\n${customTool.schema}\nDo not include markdown fences or any extra commentary.`
      : `\n\nReturn concise but useful text. Prefer clear sections and practical recommendations.`;

    const userPrompt = `Tool: ${toolTitle}
Description: ${toolDescription || "Generate a high-quality answer for this tool."}

User Inputs:
${fieldsSummary}${responseInstruction}`;

    const rawOutput = await generateWithProvider(
      selectedProvider,
      selectedApiKey,
      selectedModel,
      systemPrompt,
      userPrompt,
    );

    let result: unknown = { text: rawOutput };
    if (customTool) {
      const json = extractJsonBlock(rawOutput);
      try {
        const parsed = JSON.parse(json);
        result = parsed?.result ?? parsed;
      } catch {
        result = { text: rawOutput };
      }
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        credits: currentCredits - 1,
        credits_used: currentCreditsUsed + 1,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("[ai-generate] Failed to decrement credits:", updateError);
    }

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action: "tool_generation",
      entity_type: "tool",
      metadata: {
        tool_slug: tool || category,
        tool_title: toolTitle,
        provider: selectedProvider,
        used_user_key: usedUserKey,
      },
    }).catch((error: Error) => {
      console.warn("[ai-generate] Activity log failed:", error.message);
    });

    return new Response(
      JSON.stringify({
        result,
        provider: selectedProvider,
        usedUserKey,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in ai-generate function:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
