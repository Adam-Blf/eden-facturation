import { NextResponse } from "next/server";
import { createClient } from "@/shared/supabase/server";
import { getStripe } from "@/features/billing/stripe";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!sub?.stripe_customer_id) {
    return NextResponse.redirect(new URL("/app/abonnement", req.url));
  }

  const stripe = getStripe();
  const session = await stripe!.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/abonnement`,
  });

  return NextResponse.redirect(session.url, { status: 303 });
}
