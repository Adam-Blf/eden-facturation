import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PromoCheckout from "@/components/billing/PromoCheckout";

const PLANS = [
  {
    name: "Gratuit",
    price: "0 €",
    features: ["3 factures / mois", "Aperçu & export PDF", "Design EDEN", "1 client"],
    pro: false,
  },
  {
    name: "Pro",
    price: "9 € / mois",
    features: [
      "Factures illimitées",
      "Charte graphique personnalisée (logo + couleurs)",
      "Lien d’acceptation client",
      "Relances automatiques",
      "Compta & exports",
      "Clients illimités",
    ],
    pro: true,
  },
];

export default async function AbonnementPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user!.id)
    .maybeSingle();

  const currentPlan = sub?.plan ?? "free";
  const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_PRO);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="eyebrow text-xs text-moss">Abonnement</p>
      <h1 className="mb-2 font-display text-4xl font-bold text-forest">Choisis ton plan</h1>
      <p className="mb-8 text-mist">
        Plan actuel : <span className="font-bold text-ink">{currentPlan === "pro" ? "Pro" : "Gratuit"}</span>
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-3xl border p-6 ${plan.pro ? "border-gold bg-paper" : "border-hair bg-paper"}`}
          >
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-bold text-forest">{plan.name}</h2>
              <span className="font-mono text-lg text-ink">{plan.price}</span>
            </div>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink">
                  <Check size={16} className="mt-0.5 shrink-0 text-gold" /> {f}
                </li>
              ))}
            </ul>
            {plan.pro && <PromoCheckout stripeEnabled={stripeEnabled} />}
          </div>
        ))}
      </div>

      {!stripeEnabled && (
        <p className="mt-6 text-center text-xs text-mist">
          Le paiement en ligne sera activé prochainement (configuration Stripe).
        </p>
      )}
    </div>
  );
}
