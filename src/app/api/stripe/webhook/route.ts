import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";

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

  if (admin) {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object as { client_reference_id?: string; customer?: string; subscription?: string };
      if (s.client_reference_id) {
        await admin.from("subscriptions").upsert({
          user_id: s.client_reference_id,
          stripe_customer_id: s.customer ?? null,
          stripe_subscription_id: s.subscription ?? null,
          plan: "pro",
          status: "active",
          updated_at: new Date().toISOString(),
        });
      }
    } else if (event.type.startsWith("customer.subscription")) {
      const sub = event.data.object as unknown as { id: string; status: string; current_period_end: number };
      await admin
        .from("subscriptions")
        .update({
          status: sub.status,
          plan: sub.status === "active" ? "pro" : "free",
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", sub.id);
    }
  }

  return NextResponse.json({ received: true });
}
