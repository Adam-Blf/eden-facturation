"use client";

import { useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, Send, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_INVOICE, type Invoice, type InvoiceLine } from "./types";
import type { BusinessSettings } from "@/features/branding/types";
import type { Client } from "@/features/clients/types";
import { invoiceTotalHT } from "./totals";
import { formatEUR } from "@/shared/format";
import { saveInvoice, issueInvoice } from "./actions";

const PdfPreview = dynamic(() => import("./PdfPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-void text-sm text-mist">
      Aperçu…
    </div>
  ),
});

function Field({
  label,
  value,
  onChange,
  type = "text",
  readOnly,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        className={`w-full rounded-md border border-paper/10 px-3 py-2 text-sm text-ink outline-none transition focus:border-brass ${
          readOnly ? "cursor-not-allowed bg-paper/40 text-mist" : "bg-void"
        }`}
      />
    </label>
  );
}

export default function InvoiceWorkbench({
  settings,
  clients,
  defaultNumero,
  initialInvoice,
}: {
  settings: BusinessSettings;
  clients: Client[];
  defaultNumero?: string;
  initialInvoice?: Invoice;
}) {
  const isEdition = Boolean(initialInvoice?.id);
  const [invoice, setInvoice] = useState<Invoice>(
    initialInvoice ??
      (defaultNumero ? { ...DEFAULT_INVOICE, numero: defaultNumero } : DEFAULT_INVOICE),
  );
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
        <p className="code-badge mb-2 text-[10px]">{isEdition ? "ÉDITION_FACTURE" : "NOUVELLE_FACTURE"}</p>
        <h1 className="mb-8 font-display text-3xl font-bold text-ink">Éditeur</h1>

        <section className="mb-8 grid grid-cols-2 gap-4">
          <Field label="Numéro (auto)" value={invoice.numero} onChange={(v) => set("numero", v)} readOnly />
          <Field label="Date d’émission" value={invoice.dateEmission} onChange={(v) => set("dateEmission", v)} />
          <Field label="Période de prestation" value={invoice.datePrestation} onChange={(v) => set("datePrestation", v)} />
          <Field label="Échéance" value={invoice.echeance} onChange={(v) => set("echeance", v)} />
        </section>

        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between border-b border-paper/10 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brass">Client</h2>
            {clients.length > 0 && (
              <select
                onChange={(e) => pickClient(e.target.value)}
                defaultValue=""
                className="rounded-md border border-paper/10 bg-void px-2 py-1 text-xs text-ink outline-none focus:border-brass"
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
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nom" value={invoice.client.nom} onChange={(v) => setClient("nom", v)} />
            <Field label="Email" value={invoice.client.email} onChange={(v) => setClient("email", v)} />
            <Field label="Adresse" value={invoice.client.adresse1} onChange={(v) => setClient("adresse1", v)} />
            <Field label="Code postal, ville" value={invoice.client.adresse2} onChange={(v) => setClient("adresse2", v)} />
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs text-mist">
            <input
              type="checkbox"
              checked={invoice.client.particulier}
              onChange={(e) => setClient("particulier", e.target.checked)}
              className="accent-brass"
            />
            Client particulier (mention médiateur conso)
          </label>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between border-b border-paper/10 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brass">Lignes</h2>
            <button onClick={addLine} className="inline-flex items-center gap-1 text-xs font-bold text-mist transition hover:text-brass">
              <Plus size={13} /> Ligne
            </button>
          </div>
          <div className="space-y-4">
            {invoice.lines.map((line, i) => (
              <div key={i} className="rounded-md border border-paper/10 bg-paper/5 p-4 relative">
                <div className="mb-3">
                  <Field label="Désignation" value={line.titre} onChange={(v) => setLine(i, { titre: v })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Quantité" type="number" value={line.qte} onChange={(v) => setLine(i, { qte: parseFloat(v) || 0 })} />
                  <Field label="Prix unitaire HT (€)" type="number" value={line.pu} onChange={(v) => setLine(i, { pu: parseFloat(v) || 0 })} />
                </div>
                <label className="mt-4 block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">Détails (une ligne par puce)</span>
                  <textarea
                    rows={2}
                    value={line.details.join("\n")}
                    onChange={(e) => setLine(i, { details: e.target.value.split("\n") })}
                    className="w-full rounded-md border border-paper/10 bg-void px-3 py-2 text-sm text-ink outline-none focus:border-brass"
                  />
                </label>
                {invoice.lines.length > 1 && (
                  <button onClick={() => removeLine(i)} className="absolute top-4 right-4 text-mist hover:text-[#b3261e]">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="mb-8 flex items-center justify-between border-y border-paper/10 py-4">
          <span className="text-sm font-bold uppercase tracking-wider text-mist">Net à payer</span>
          <span className="font-display text-3xl font-bold text-brass">{formatEUR(total)}</span>
        </div>

        {link && (
          <div className="mb-8 border-l-2 border-brass bg-brass/10 p-4">
            <p className="mb-2 text-sm font-bold text-ink">Lien d’acceptation client</p>
            <div className="flex items-center gap-2">
              <input readOnly value={link} className="flex-1 rounded-md border border-brass/20 bg-void px-3 py-2 font-mono text-xs text-ink" />
              <button onClick={copyLink} className="inline-flex items-center gap-1 rounded-md bg-brass px-3 py-2 text-xs font-bold text-void hover:bg-brass/80">
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button onClick={onSave} disabled={pending} className="btn-secondary w-full">
            {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Enregistrer
          </button>
          <button onClick={onIssue} disabled={pending} className="btn-primary w-full">
            {pending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Valider & Lien
          </button>
        </div>
      </motion.div>

      <div className="sticky top-0 hidden h-screen flex-col border-l border-paper/10 lg:flex">
        <div className="flex-1 bg-white/5">
          <PdfPreview data={data} />
        </div>
      </div>
    </div>
  );
}
