import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/features/billing/stripe";

type PlanInfo = { plan: string; maxClients: number | null };

const FREE: PlanInfo = { plan: "free", maxClients: 1 };

/** Mappe un price Stripe vers un plan applicatif + son quota clients. */
function planFromPriceId(priceId: string | undefined | null): PlanInfo {
  if (!priceId) return FREE;
  if (priceId === process.env.STRIPE_PRICE_STARTER) return { plan: "starter", maxClients: 10 };
  if (priceId === process.env.STRIPE_PRICE_PRO) return { plan: "pro", maxClients: 50 };
  if (priceId === process.env.STRIPE_PRICE_UNLIMITED) return { plan: "unlimited", maxClients: null };
  return FREE;
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ skipped: true });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no signature" }, { status: 400 });

  const body = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const admin = url && serviceKey ? createClient(url, serviceKey) : null;

  // Sans cle service role, on ne peut pas ecrire en DB : on renvoie une erreur
  // pour que Stripe rejoue l'event (au lieu de le perdre silencieusement).
  if (!admin) {
    return NextResponse.json({ error: "service role not configured" }, { status: 503 });
  }

  {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as {
        client_reference_id?: string;
        customer?: string;
        subscription?: string;
      };
      if (s.client_reference_id && s.subscription) {
        // on relit la souscription pour connaitre le price achete
        const sub = await stripe.subscriptions.retrieve(s.subscription);
        const priceId = sub.items?.data?.[0]?.price?.id;
        const info = planFromPriceId(priceId);
        await admin.from("subscriptions").upsert({
          user_id: s.client_reference_id,
          stripe_customer_id: s.customer ?? null,
          stripe_subscription_id: s.subscription,
          plan: info.plan,
          max_clients: info.maxClients,
          status: "active",
          updated_at: new Date().toISOString(),
        });
      }
    } else if (event.type.startsWith("customer.subscription")) {
      const sub = event.data.object as unknown as {
        id: string;
        status: string;
        current_period_end?: number;
        items?: { data?: Array<{ price?: { id?: string }; current_period_end?: number }> };
      };
      const active = sub.status === "active" || sub.status === "trialing";
      const priceId = sub.items?.data?.[0]?.price?.id;
      const info = active ? planFromPriceId(priceId) : FREE;
      const periodEnd = sub.items?.data?.[0]?.current_period_end ?? sub.current_period_end;

      await admin
        .from("subscriptions")
        .update({
          status: sub.status,
          plan: info.plan,
          max_clients: info.maxClients,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", sub.id);
    }
  }

  return NextResponse.json({ received: true });
}
