import Stripe from "stripe";

/** Retourne un client Stripe, ou null si la clé n'est pas configurée. */
export function getStripe(): Stripe | null {
  const key = process.env.EDEN_STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}
