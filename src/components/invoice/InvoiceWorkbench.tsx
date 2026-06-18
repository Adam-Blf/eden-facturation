"use client";

import { useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, Send, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_INVOICE,
  type BusinessSettings,
  type Client,
  type Invoice,
  type InvoiceLine,
} from "@/lib/types";
import { invoiceTotalHT } from "@/lib/compta";
import { formatEUR } from "@/lib/format";
import { saveInvoice, issueInvoice } from "@/app/app/factures/actions";

const PdfPreview = dynamic(() => import("@/components/PdfPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#33403a] text-sm text-white/60">
      Aperçu…
    </div>
  ),
});

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-mist">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-hair bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-forest"
      />
    </label>
  );
}

export default function InvoiceWorkbench({
  settings,
  clients,
}: {
  settings: BusinessSettings;
  clients: Client[];
}) {
  const [invoice, setInvoice] = useState<Invoice>(DEFAULT_INVOICE);
  const [pending, startTransition] = useTransition();
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof Invoice>(k: K, v: Invoice[K]) => setInvoice((p) => ({ ...p, [k]: v }));
  const setClient = (k: keyof Client, v: string | boolean) =>
    setInvoice((p) => ({ ...p, client: { ...p.client, [k]: v } }));
  const setLine = (i: number, patch: Partial<InvoiceLine>) =>
    setInvoice((p) => ({ ...p, lines: p.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));
  const addLine = () =>
    setInvoice((p) => ({ ...p, lines: [...p.lines, { titre: "", details: [], qte: 1, pu: 0 }] }));
  const removeLine = (i: number) =>
    setInvoice((p) => ({ ...p, lines: p.lines.filter((_, j) => j !== i) }));

  function pickClient(id: string) {
    const c = clients.find((x) => x.id === id);
    if (c) set("client", { ...c });
  }

  const data = useMemo(() => ({ settings, invoice }), [settings, invoice]);
  const total = invoiceTotalHT(invoice);

  function onSave() {
    startTransition(async () => {
      const res = await saveInvoice(invoice, settings);
      if (res.error) toast.error(res.error);
      else {
        if (res.id) setInvoice((p) => ({ ...p, id: res.id }));
        toast.success("Brouillon enregistré.");
      }
    });
  }

  function onIssue() {
    startTransition(async () => {
      const res = await issueInvoice(invoice, settings);
      if (res.error) toast.error(res.error);
      else if (res.token) {
        setInvoice((p) => ({ ...p, id: res.id, status: "issued" }));
        setLink(`${window.location.origin}/facture/${res.token}`);
        toast.success("Facture validée. Lien client généré.");
      }
    });
  }

  function copyLink() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr]">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-h-screen overflow-y-auto px-6 py-8"
      >
        <p className="eyebrow text-xs text-moss">Nouvelle facture</p>
        <h1 className="mb-6 font-display text-3xl font-bold text-forest">Éditeur</h1>

        <section className="mb-6 grid grid-cols-2 gap-3">
          <Field label="Numéro" value={invoice.numero} onChange={(v) => set("numero", v)} />
          <Field label="Date d’émission" value={invoice.dateEmission} onChange={(v) => set("dateEmission", v)} />
          <Field label="Période de prestation" value={invoice.datePrestation} onChange={(v) => set("datePrestation", v)} />
          <Field label="Échéance" value={invoice.echeance} onChange={(v) => set("echeance", v)} />
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">Client</h2>
            {clients.length > 0 && (
              <select
                onChange={(e) => pickClient(e.target.value)}
                defaultValue=""
                className="rounded-lg border border-hair bg-paper px-2 py-1 text-xs text-ink"
              >
                <option value="" disabled>
                  Client existant…
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nom" value={invoice.client.nom} onChange={(v) => setClient("nom", v)} />
            <Field label="Email" value={invoice.client.email} onChange={(v) => setClient("email", v)} />
            <Field label="Adresse" value={invoice.client.adresse1} onChange={(v) => setClient("adresse1", v)} />
            <Field label="Code postal · ville" value={invoice.client.adresse2} onChange={(v) => setClient("adresse2", v)} />
          </div>
          <label className="mt-2 flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={invoice.client.particulier}
              onChange={(e) => setClient("particulier", e.target.checked)}
            />
            Client particulier (mention médiateur conso)
          </label>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">Lignes</h2>
            <button onClick={addLine} className="inline-flex items-center gap-1 rounded-full border border-forest px-3 py-1 text-xs font-bold text-forest transition hover:bg-forest hover:text-white">
              <Plus size={13} /> Ligne
            </button>
          </div>
          <div className="space-y-4">
            {invoice.lines.map((line, i) => (
              <div key={i} className="rounded-xl border border-hair bg-paper p-4">
                <div className="mb-2 flex items-start gap-2">
                  <div className="flex-1">
                    <Field label="Désignation" value={line.titre} onChange={(v) => setLine(i, { titre: v })} />
                  </div>
                  {invoice.lines.length > 1 && (
                    <button onClick={() => removeLine(i)} className="mt-6 text-mist hover:text-[#b3261e]">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Quantité" type="number" value={line.qte} onChange={(v) => setLine(i, { qte: parseFloat(v) || 0 })} />
                  <Field label="Prix unitaire HT (€)" type="number" value={line.pu} onChange={(v) => setLine(i, { pu: parseFloat(v) || 0 })} />
                </div>
                <label className="mt-3 block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-mist">Détails (une ligne par puce)</span>
                  <textarea
                    rows={3}
                    value={line.details.join("\n")}
                    onChange={(e) => setLine(i, { details: e.target.value.split("\n") })}
                    className="w-full rounded-lg border border-hair bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-forest"
                  />
                </label>
              </div>
            ))}
          </div>
        </section>

        <div className="mb-6 flex items-center justify-between rounded-xl bg-forest px-4 py-3 text-white">
          <span className="eyebrow text-xs text-gold">Net à payer</span>
          <span className="font-display text-2xl font-bold">{formatEUR(total)}</span>
        </div>

        {link && (
          <div className="mb-6 rounded-xl border border-gold bg-paper p-4">
            <p className="mb-2 text-sm font-bold text-forest">Lien d’acceptation client</p>
            <div className="flex items-center gap-2">
              <input readOnly value={link} className="flex-1 rounded-lg border border-hair bg-bone px-3 py-2 font-mono text-xs text-ink" />
              <button onClick={copyLink} className="inline-flex items-center gap-1 rounded-lg bg-forest px-3 py-2 text-xs font-bold text-white">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="mt-2 text-xs text-mist">Envoie ce lien au client : il pourra consulter la facture et cliquer « J’accepte ».</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onSave} disabled={pending} className="inline-flex items-center gap-2 rounded-full border border-forest px-5 py-2.5 text-sm font-bold text-forest transition hover:bg-bone disabled:opacity-60">
            {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Enregistrer le brouillon
          </button>
          <button onClick={onIssue} disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-forest transition hover:bg-forest hover:text-white disabled:opacity-60">
            {pending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Valider & générer le lien
          </button>
        </div>
      </motion.div>

      <div className="sticky top-0 hidden h-screen flex-col border-l border-hair lg:flex">
        <div className="flex-1">
          <PdfPreview data={data} />
        </div>
      </div>
    </div>
  );
}
