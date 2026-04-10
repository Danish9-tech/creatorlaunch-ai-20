import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const planFromPriceId: Record<string, string> = {
  // Add your actual Stripe Price IDs here
  // These should match your Stripe dashboard price IDs
  "price_pro_monthly": "pro",
  "price_premium_monthly": "premium",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!stripeSecretKey || !webhookSecret) {
      console.error("Missing Stripe environment variables");
      return new Response(
        JSON.stringify({ error: "Missing Stripe configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the raw body for Stripe signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "No Stripe signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify Stripe webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing Stripe event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const clientReferenceId = session.client_reference_id; // user UUID

        if (!clientReferenceId) {
          console.error("No client_reference_id in checkout session");
          break;
        }

        // Get subscription details to find the price/plan
        let plan = "pro"; // default
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;
          plan = planFromPriceId[priceId] || "pro";
        }

        // Update user profile with subscription info
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            plan: plan,
            stripe_customer: customerId,
            stripe_sub_id: subscriptionId,
            sub_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", clientReferenceId);

        if (updateError) {
          console.error("Error updating profile after checkout:", updateError);
        } else {
          console.log(`Updated user ${clientReferenceId} to plan: ${plan}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;
        const plan = planFromPriceId[priceId] || "pro";
        const status = subscription.status;

        // Find user by stripe_customer
        const { data: profileData, error: fetchError } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer", customerId)
          .single();

        if (fetchError || !profileData) {
          console.error("Could not find user for customer:", customerId);
          break;
        }

        const activePlan = status === "active" ? plan : "free";
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            plan: activePlan,
            sub_status: status,
            stripe_sub_id: subscription.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profileData.id);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
        } else {
          console.log(`Updated user ${profileData.id} plan to: ${activePlan}, status: ${status}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by stripe_customer
        const { data: profileData, error: fetchError } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer", customerId)
          .single();

        if (fetchError || !profileData) {
          console.error("Could not find user for customer:", customerId);
          break;
        }

        // Downgrade to free plan
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            plan: "free",
            sub_status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", profileData.id);

        if (updateError) {
          console.error("Error downgrading plan:", updateError);
        } else {
          console.log(`Downgraded user ${profileData.id} to free plan`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const plan = planFromPriceId[priceId] || "pro";

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            plan: plan,
            sub_status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer", customerId);

        if (updateError) {
          console.error("Error updating plan after payment:", updateError);
        } else {
          console.log(`Renewed plan for customer ${customerId}: ${plan}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            sub_status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer", customerId);

        if (updateError) {
          console.error("Error updating payment failed status:", updateError);
        } else {
          console.log(`Payment failed for customer ${customerId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
