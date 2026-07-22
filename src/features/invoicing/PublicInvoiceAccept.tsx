"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

export default function PublicInvoiceAccept({
  token,
  status,
  acceptedAt,
}: {
  token: string;
  status: string;
  acceptedAt: string | null;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done">(
    status === "accepted" || status === "paid" ? "done" : "idle",
  );
  const [when, setWhen] = useState<string | null>(acceptedAt);

  async function accept() {
    setState("loading");
    try {
      const res = await fetch("/api/invoice/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();
      if (json?.accepted_at || json?.status === "accepted") {
        setWhen(json.accepted_at ?? new Date().toISOString());
        setState("done");
      } else {
        setState("idle");
        alert("Cette facture ne peut pas être acceptée (déjà traitée ou expirée).");
      }
    } catch {
      setState("idle");
    }
  }

  return (
    <div className="mt-6">
      <AnimatePresence mode="wait">
        {state === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#10b981] px-4 py-3 font-bold text-white"
          >
            <Check size={18} /> Facture acceptée
            {when ? ` le ${new Date(when).toLocaleDateString("fr-FR")}` : ""}
          </motion.div>
        ) : (
          <motion.button
            key="btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={accept}
            disabled={state === "loading"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 font-bold text-white transition hover:bg-moss disabled:opacity-60"
          >
            {state === "loading" ? <Loader2 size={18} className="animate-spin" /> : null}
            J’accepte cette facture
          </motion.button>
        )}
      </AnimatePresence>
      <p className="mt-2 text-center text-[11px] text-mist">
        En acceptant, vous accusez réception et approuvez le montant de cette facture.
      </p>
    </div>
  );
}
