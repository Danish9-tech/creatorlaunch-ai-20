import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PublishPayload {
  platform: "gumroad" | "etsy" | "shopify";
  title: string;
  description: string;
  price?: number;
  tags?: string[];
}

async function publishGumroad(token: string, p: PublishPayload) {
  const form = new URLSearchParams();
  form.append("name", p.title);
  form.append("description", p.description);
  form.append("price", String(Math.round((p.price ?? 0) * 100))); // cents
  const r = await fetch("https://api.gumroad.com/v2/products", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  const data = await r.json();
  if (!r.ok || data.success === false) {
    throw new Error(data?.message || `Gumroad error ${r.status}`);
  }
  return {
    id: data.product?.id,
    url: data.product?.short_url || `https://gumroad.com/products/${data.product?.id}/edit`,
  };
}

async function publishEtsy(token: string, shopId: string, p: PublishPayload) {
  // Etsy v3 requires keystring header + OAuth token
  const r = await fetch(`https://openapi.etsy.com/v3/application/shops/${shopId}/listings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "x-api-key": Deno.env.get("ETSY_KEYSTRING") || "",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      quantity: "1",
      title: p.title,
      description: p.description,
      price: String(p.price ?? 1),
      who_made: "i_did",
      when_made: "made_to_order",
      taxonomy_id: "1",
      type: "download",
      state: "draft",
    }).toString(),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error || `Etsy error ${r.status}`);
  return {
    id: data.listing_id,
    url: data.url || `https://www.etsy.com/listing/${data.listing_id}`,
  };
}

async function publishShopify(token: string, storeUrl: string, p: PublishPayload) {
  // storeUrl example: my-store.myshopify.com
  const domain = storeUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const r = await fetch(`https://${domain}/admin/api/2024-01/products.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product: {
        title: p.title,
        body_html: p.description,
        status: "draft",
        tags: (p.tags || []).join(", "),
        variants: [{ price: String(p.price ?? 0) }],
      },
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.errors ? JSON.stringify(data.errors) : `Shopify error ${r.status}`);
  return {
    id: data.product?.id,
    url: `https://${domain}/admin/products/${data.product?.id}`,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const auth = req.headers.get("authorization") || "";
    const token = auth.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as PublishPayload;
    if (!payload.platform || !payload.title) {
      return new Response(JSON.stringify({ error: "platform and title are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const platformId = payload.platform.toLowerCase();
    const { data: connection, error: connErr } = await supabase
      .from("marketplace_connections")
      .select("settings")
      .eq("user_id", user.id)
      .eq("marketplace_id", platformId)
      .maybeSingle();

    if (connErr || !connection?.settings) {
      return new Response(JSON.stringify({
        error: `${platformId} is not connected. Open Marketplace Connect to link your account.`,
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const settings = connection.settings as Record<string, string>;
    let result: { id: string | number; url: string };

    if (platformId === "gumroad") {
      const key = settings.api_key || settings.access_token;
      if (!key) throw new Error("Missing Gumroad API key");
      result = await publishGumroad(key, payload);
    } else if (platformId === "etsy") {
      const key = settings.api_key || settings.access_token;
      const shop = settings.shop_id;
      if (!key || !shop) throw new Error("Missing Etsy API key or shop_id");
      result = await publishEtsy(key, shop, payload);
    } else if (platformId === "shopify") {
      const key = settings.api_key || settings.access_token;
      const store = settings.store_url;
      if (!key || !store) throw new Error("Missing Shopify access token or store_url");
      result = await publishShopify(key, store, payload);
    } else {
      return new Response(JSON.stringify({
        error: `${platformId} does not support direct publishing yet. You can copy the listing manually.`,
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Save listing record (best-effort)
    await supabase.from("listings").insert({
      user_id: user.id,
      platform: platformId,
      title: payload.title,
      description: payload.description,
      external_id: String(result.id),
      external_url: result.url,
      status: "draft",
    }).then(() => null).catch(() => null);

    return new Response(JSON.stringify({ success: true, ...result }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("publish-to-marketplace error:", err);
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : "Unknown error",
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});