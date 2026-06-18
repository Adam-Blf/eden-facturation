"use server";

import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function validatePromo(code: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("promo_codes")
    .select("*")
    .ilike("code", code.trim())
    .eq("active", true)
    .maybeSingle();

  if (!data) return { error: "Code invalide" };
  if (data.expires_at && new Date(data.expires_at) < new Date()) return { error: "Code expiré" };
  if (data.max_redemptions && data.times_redeemed >= data.max_redemptions)
    return { error: "Code épuisé" };

  return {
    ok: true,
    code: data.code,
    description: data.description as string,
    percentOff: data.percent_off as number | null,
    amountOff: data.amount_off as number | null,
    stripePromoId: data.stripe_promo_id as string | null,
  };
}

export async function createCheckout(promoCode?: string) {
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_PRO;
  if (!stripe || !priceId) {
    return { error: "Le paiement sera bientôt disponible." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  let discounts: { promotion_code: string }[] | undefined;
  if (promoCode) {
    const promo = await validatePromo(promoCode);
    if ("ok" in promo && promo.stripePromoId) {
      discounts = [{ promotion_code: promo.stripePromoId }];
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    discounts,
    success_url: `${appUrl}/app/abonnement?success=1`,
    cancel_url: `${appUrl}/app/abonnement?canceled=1`,
  });

  return { url: session.url };
}
