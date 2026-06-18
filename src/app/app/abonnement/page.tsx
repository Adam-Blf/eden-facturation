import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PromoCheckout from "@/components/billing/PromoCheckout";
import type { PaidPlan } from "./actions";

type Plan = {
  key: "free" | PaidPlan;
  name: string;
  price: string;
  clients: string;
  features: string[];
  pro: boolean;
  label?: string;
  color: string;
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    key: "free",
    name: "Gratuit",
    price: "0 €",
    clients: "1 client",
    features: ["1 client", "Factures illimitées", "Aperçu & export PDF", "Logo 404 Monkey"],
    pro: false,
    color: "border-hair",
  },
  {
    key: "starter",
    name: "Starter",
    price: "9 € / mois",
    clients: "Jusqu'à 10 clients",
    features: ["10 clients", "Factures illimitées", "Charte personnalisée", "Acceptation client", "Suivi compta"],
    pro: true,
    label: "Passer à Starter",
    color: "border-gold",
  },
  {
    key: "pro",
    name: "Pro",
    price: "19 € / mois",
    clients: "Jusqu'à 50 clients",
    features: ["50 clients", "Tout Starter", "Multi-statuts (Auto, SAS…)", "Exports comptables avancés", "Support prioritaire"],
    pro: true,
    label: "Passer à Pro",
    color: "border-brass",
    highlight: true,
  },
  {
    key: "unlimited",
    name: "Illimité",
    price: "39 € / mois",
    clients: "Clients illimités",
    features: ["Clients illimités", "Tout Pro", "Marque blanche totale", "Accès API", "Accompagnement dédié"],
    pro: true,
    label: "Passer à Illimité",
    color: "border-void",
  },
];

export default async function AbonnementPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status, max_clients")
    .eq("user_id", user!.id)
    .maybeSingle();

  const { count: clientCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  const currentPlan = sub?.plan ?? "free";
  const maxClients = sub?.max_clients ?? 1;
  const used = clientCount ?? 0;
  const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <p className="eyebrow text-xs text-brass">Abonnement</p>
      <h1 className="mb-2 font-display text-4xl font-bold text-void">Choisis ton plan</h1>
      <p className="mb-1 text-mist">
        Ton statut actuel : <span className="font-bold text-ink uppercase">{currentPlan}</span>
      </p>
      <p className="mb-8 text-sm text-mist">
        Clients utilisés :{" "}
        <span className="font-bold text-ink">
          {used} / {maxClients === null ? "∞" : maxClients}
        </span>
      </p>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          return (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-3xl border p-6 bg-paper ${plan.color} ${
                plan.highlight ? "ring-2 ring-brass/40" : ""
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-brass px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-void">
                  Populaire
                </span>
              )}
              <div className="mb-4">
                <h2 className="font-display text-xl font-bold text-void">{plan.name}</h2>
                <span className="font-mono text-lg font-bold text-brass">{plan.price}</span>
                <p className="mt-1 text-xs font-semibold text-ink/60">{plan.clients}</p>
              </div>
              <ul className="flex-1 space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-ink/80 leading-tight">
                    <Check size={14} className="mt-0.5 shrink-0 text-brass" /> {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="flex flex-col gap-2">
                  <button disabled className="w-full rounded-full border border-hair py-2 text-sm font-bold text-mist">
                    Plan actuel
                  </button>
                  {currentPlan !== "free" && (
                    <form action="/api/stripe/portal" method="POST">
                      <button
                        type="submit"
                        className="w-full text-center text-xs text-brass underline underline-offset-4 hover:text-tan transition-colors"
                      >
                        Gérer mon abonnement
                      </button>
                    </form>
                  )}
                </div>
              ) : plan.pro ? (
                <PromoCheckout stripeEnabled={stripeEnabled} plan={plan.key as PaidPlan} planLabel={plan.label} />
              ) : (
                <button disabled className="w-full rounded-full border border-hair py-2 text-sm font-bold text-mist">
                  Plan gratuit
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!stripeEnabled && (
        <p className="mt-8 text-center text-xs text-mist italic">
          Le paiement sécurisé par Stripe sera activé dès la finalisation de ton compte Beloucif.
        </p>
      )}
    </div>
  );
}
