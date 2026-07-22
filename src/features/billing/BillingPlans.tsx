"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Tag, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { validatePromo, createCheckout, type PaidPlan } from "@/features/billing/actions";

type Plan = {
  key: "free" | PaidPlan;
  name: string;
  price: string;
  clients: string;
  features: string[];
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    key: "free",
    name: "Gratuit",
    price: "0 €",
    clients: "1 client",
    features: ["1 client", "Factures illimitées", "Export PDF", "Logo 404 Monkey"],
  },
  {
    key: "starter",
    name: "Starter",
    price: "9 €",
    clients: "Jusqu'à 10 clients",
    features: ["10 clients", "Charte personnalisée", "Acceptation client", "Suivi compta"],
  },
  {
    key: "pro",
    name: "Pro",
    price: "19 €",
    clients: "Jusqu'à 50 clients",
    features: ["50 clients", "Multi-statuts", "Exports comptables", "Support prioritaire"],
    highlight: true,
  },
  {
    key: "unlimited",
    name: "Illimité",
    price: "39 €",
    clients: "Clients illimités",
    features: ["Clients illimités", "Marque blanche", "Accès API", "Accompagnement dédié"],
  },
];

export default function BillingPlans({
  currentPlan,
  stripeEnabled,
}: {
  currentPlan: string;
  stripeEnabled: boolean;
}) {
  const [showPromo, setShowPromo] = useState(false);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function checkPromo() {
    if (!code.trim()) return;
    startTransition(async () => {
      const res = await validatePromo(code);
      if ("error" in res) {
        toast.error(res.error);
        setApplied(null);
      } else {
        const label = res.percentOff ? `-${res.percentOff}%` : res.amountOff ? `-${res.amountOff}€` : res.description;
        toast.success(`Code appliqué : ${label}`);
        setApplied(res.code);
      }
    });
  }

  function subscribe(plan: PaidPlan) {
    setPendingPlan(plan);
    startTransition(async () => {
      const res = await createCheckout(plan, applied ?? undefined);
      if ("error" in res) {
        toast.error(res.error);
        setPendingPlan(null);
      } else if (res.url) {
        window.location.href = res.url;
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* code promo : un seul champ, repliable */}
      <div className="flex flex-wrap items-center gap-3">
        {!showPromo && !applied && (
          <button
            onClick={() => setShowPromo(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brass hover:underline"
          >
            <Tag size={15} /> J&apos;ai un code promo
          </button>
        )}
        {(showPromo || applied) && (
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-hair bg-paper px-3">
              <Tag size={15} className="text-mist" />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Code promo"
                disabled={Boolean(applied)}
                className="w-full bg-transparent py-2 text-sm uppercase outline-none disabled:opacity-60"
              />
            </div>
            {applied ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-brass/15 px-3 py-2 text-sm font-bold text-brass">
                <Check size={15} /> {applied}
              </span>
            ) : (
              <button
                onClick={checkPromo}
                className="rounded-lg border border-brass px-4 py-2 text-sm font-bold text-brass transition hover:bg-brass/10"
              >
                Appliquer
              </button>
            )}
          </div>
        )}
      </div>

      {/* grille des plans */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          const isPaid = plan.key !== "free";
          return (
            <div
              key={plan.key}
              className={`relative flex flex-col rounded-3xl border bg-paper p-6 transition ${
                plan.highlight ? "border-brass ring-1 ring-brass/40" : "border-hair"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-brass px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-void">
                  Populaire
                </span>
              )}

              <h2 className="font-display text-xl font-bold text-ink">{plan.name}</h2>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-display text-3xl font-black text-brass">{plan.price}</span>
                {isPaid && <span className="text-xs font-medium text-mist">/ mois</span>}
              </div>
              <p className="mt-1 text-xs font-semibold text-ink/60">{plan.clients}</p>

              <ul className="mt-5 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs leading-tight text-ink/80">
                    <Check size={14} className="mt-0.5 shrink-0 text-brass" /> {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full rounded-full border border-hair py-2.5 text-sm font-bold text-mist"
                  >
                    Plan actuel
                  </button>
                ) : isPaid ? (
                  <button
                    onClick={() => subscribe(plan.key as PaidPlan)}
                    disabled={!stripeEnabled || pendingPlan !== null}
                    className={`flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      plan.highlight
                        ? "bg-brass text-void hover:bg-tan"
                        : "border border-brass text-brass hover:bg-brass/10"
                    }`}
                  >
                    {pendingPlan === plan.key ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Sparkles size={15} />
                    )}
                    {stripeEnabled ? "Choisir" : "Bientôt"}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full rounded-full border border-hair py-2.5 text-sm font-bold text-mist"
                  >
                    Gratuit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* gestion abonnement */}
      {currentPlan !== "free" && (
        <form action="/api/stripe/portal" method="POST">
          <button
            type="submit"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brass hover:underline"
          >
            <ExternalLink size={15} /> Gérer mon abonnement (factures, résiliation)
          </button>
        </form>
      )}

      {!stripeEnabled && (
        <p className="text-center text-xs italic text-mist">
          Le paiement sécurisé par Stripe sera activé sous peu.
        </p>
      )}
    </div>
  );
}
