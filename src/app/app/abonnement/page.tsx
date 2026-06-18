import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PromoCheckout from "@/components/billing/PromoCheckout";

const PLANS = [
  {
    name: "Gratuit",
    price: "0 €",
    features: ["3 factures / mois", "Aperçu & export PDF", "Logo 404 Monkey", "1 client"],
    pro: false,
    color: "border-hair",
  },
  {
    name: "Freelance",
    price: "15 € / mois",
    features: [
      "Factures illimitées",
      "Charte personnalisée",
      "Acceptation client",
      "Clients illimités",
      "Suivi compta",
    ],
    pro: true,
    color: "border-gold",
  },
  {
    name: "Studio",
    price: "35 € / mois",
    features: [
      "Tout le plan Freelance",
      "Multi-statuts (Auto, SAS...)",
      "Exports comptables avancés",
      "Support prioritaire",
    ],
    pro: true,
    color: "border-void",
  },
  {
    name: "Enterprise",
    price: "75 € / mois",
    features: [
      "Marque blanche totale",
      "Accès API API API",
      "Accompagnement dédié",
      "Dashboard multi-comptes",
    ],
    pro: true,
    color: "border-brass",
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
  const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <p className="eyebrow text-xs text-brass">Abonnement</p>
      <h1 className="mb-2 font-display text-4xl font-bold text-void">Choisis ton plan</h1>
      <p className="mb-8 text-mist">
        Ton statut actuel : <span className="font-bold text-ink uppercase">{currentPlan}</span>
      </p>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col rounded-3xl border p-6 bg-paper ${plan.color}`}
          >
            <div className="mb-4">
              <h2 className="font-display text-xl font-bold text-void">{plan.name}</h2>
              <span className="font-mono text-lg font-bold text-brass">{plan.price}</span>
            </div>
            <ul className="flex-1 space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-ink/80 leading-tight">
                  <Check size={14} className="mt-0.5 shrink-0 text-brass" /> {f}
                </li>
              ))}
            </ul>
            {plan.pro ? (
              <PromoCheckout stripeEnabled={stripeEnabled} />
            ) : (
              <button disabled className="w-full rounded-full border border-hair py-2 text-sm font-bold text-mist">
                Plan actuel
              </button>
            )}
          </div>
        ))}
      </div>

      {!stripeEnabled && (
        <p className="mt-8 text-center text-xs text-mist italic">
          Le paiement sécurisé par Stripe sera activé dès la finalisation de ton compte Beloucif.
        </p>
      )}
    </div>
  );
}
