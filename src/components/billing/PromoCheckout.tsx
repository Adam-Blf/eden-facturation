"use client";

import { useState, useTransition } from "react";
import { Loader2, Tag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { validatePromo, createCheckout, type PaidPlan } from "@/app/app/abonnement/actions";

export default function PromoCheckout({
  stripeEnabled,
  plan = "pro",
  planLabel = "Passer à Pro",
}: {
  stripeEnabled: boolean;
  plan?: PaidPlan;
  planLabel?: string;
}) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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

  function subscribe() {
    startTransition(async () => {
      const res = await createCheckout(plan, applied ?? undefined);
      if ("error" in res) toast.error(res.error);
      else if (res.url) window.location.href = res.url;
    });
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-hair bg-paper px-3">
          <Tag size={15} className="text-mist" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code promo"
            className="w-full bg-transparent py-2 text-sm outline-none"
          />
        </div>
        <button
          onClick={checkPromo}
          disabled={pending}
          className="rounded-lg border border-forest px-4 text-sm font-bold text-forest transition hover:bg-bone disabled:opacity-60"
        >
          Appliquer
        </button>
      </div>
      {applied && <p className="text-sm text-[#10b981]">Code « {applied} » appliqué.</p>}
      <button
        onClick={subscribe}
        disabled={pending || !stripeEnabled}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 font-bold text-forest transition hover:bg-forest hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {stripeEnabled ? planLabel : "Bientôt disponible"}
      </button>
    </div>
  );
}
