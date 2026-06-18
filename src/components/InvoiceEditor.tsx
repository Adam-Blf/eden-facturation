"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import {
  DEFAULT_INVOICE,
  DEFAULT_SETTINGS,
  type BusinessSettings,
  type Invoice,
  type InvoiceLine,
} from "@/lib/types";
import { invoiceTotalHT, estimatedCotisations, netAfterCotisations } from "@/lib/compta";
import { formatEUR } from "@/lib/format";

const PdfPreview = dynamic(() => import("./PdfPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#33403a] text-sm text-white/60">
      Chargement de l’aperçu…
    </div>
  ),
});

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-mist">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-hair bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-forest"
      />
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-hair px-6 py-6">
      <h2 className="mb-4 font-display text-xl font-bold text-forest">{title}</h2>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </section>
  );
}

export default function InvoiceEditor() {
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [invoice, setInvoice] = useState<Invoice>(DEFAULT_INVOICE);

  const set = <K extends keyof Invoice>(k: K, v: Invoice[K]) =>
    setInvoice((p) => ({ ...p, [k]: v }));
  const setClient = (k: keyof Invoice["client"], v: string | boolean) =>
    setInvoice((p) => ({ ...p, client: { ...p.client, [k]: v } }));
  const setS = <K extends keyof BusinessSettings>(k: K, v: BusinessSettings[K]) =>
    setSettings((p) => ({ ...p, [k]: v }));

  const setLine = (i: number, patch: Partial<InvoiceLine>) =>
    setInvoice((p) => ({
      ...p,
      lines: p.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)),
    }));
  const addLine = () =>
    setInvoice((p) => ({
      ...p,
      lines: [...p.lines, { titre: "Nouvelle prestation", details: [], qte: 1, pu: 0 }],
    }));
  const removeLine = (i: number) =>
    setInvoice((p) => ({ ...p, lines: p.lines.filter((_, j) => j !== i) }));

  const data = useMemo(() => ({ settings, invoice }), [settings, invoice]);
  const total = invoiceTotalHT(invoice);
  const cotis = estimatedCotisations(total, settings);
  const net = netAfterCotisations(total, settings);

  return (
    <div className="grid flex-1 grid-cols-1 lg:grid-cols-[1fr_1fr]">
      {/* FORM */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-h-[calc(100vh-57px)] overflow-y-auto bg-bone"
      >
        <Section title="Facture">
          <Field label="Numéro" value={invoice.numero} onChange={(v) => set("numero", v)} />
          <Field label="Date d’émission" value={invoice.dateEmission} onChange={(v) => set("dateEmission", v)} />
          <Field label="Période de prestation" value={invoice.datePrestation} onChange={(v) => set("datePrestation", v)} />
          <Field label="Échéance" value={invoice.echeance} onChange={(v) => set("echeance", v)} />
          <Field label="Mode de règlement" value={invoice.reglement} onChange={(v) => set("reglement", v)} />
        </Section>

        <Section title="Client">
          <Field label="Nom" value={invoice.client.nom} onChange={(v) => setClient("nom", v)} />
          <Field label="Email" value={invoice.client.email} onChange={(v) => setClient("email", v)} />
          <Field label="Adresse" value={invoice.client.adresse1} onChange={(v) => setClient("adresse1", v)} />
          <Field label="Code postal · ville" value={invoice.client.adresse2} onChange={(v) => setClient("adresse2", v)} />
          <label className="col-span-2 flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={invoice.client.particulier}
              onChange={(e) => setClient("particulier", e.target.checked)}
            />
            Client particulier (ajoute la mention médiateur de la consommation)
          </label>
        </Section>

        <section className="border-b border-hair px-6 py-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-forest">Lignes</h2>
            <button
              onClick={addLine}
              className="inline-flex items-center gap-1 rounded-full border border-forest px-3 py-1 text-xs font-bold text-forest transition hover:bg-forest hover:text-white"
            >
              <Plus size={13} /> Ligne
            </button>
          </div>
          <div className="space-y-5">
            {invoice.lines.map((line, i) => (
              <div key={i} className="rounded-xl border border-hair bg-paper p-4">
                <div className="mb-3 flex items-start gap-2">
                  <div className="flex-1">
                    <Field label="Désignation" value={line.titre} onChange={(v) => setLine(i, { titre: v })} />
                  </div>
                  {invoice.lines.length > 1 && (
                    <button
                      onClick={() => removeLine(i)}
                      className="mt-6 text-mist transition hover:text-[#b3261e]"
                      aria-label="Supprimer la ligne"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Quantité" type="number" value={line.qte} onChange={(v) => setLine(i, { qte: parseFloat(v) || 0 })} />
                  <Field label="Prix unitaire HT (€)" type="number" value={line.pu} onChange={(v) => setLine(i, { pu: parseFloat(v) || 0 })} />
                </div>
                <label className="mt-3 block">
                  <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-mist">
                    Détails (une ligne par puce)
                  </span>
                  <textarea
                    rows={4}
                    value={line.details.join("\n")}
                    onChange={(e) => setLine(i, { details: e.target.value.split("\n") })}
                    className="w-full rounded-lg border border-hair bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-forest"
                  />
                </label>
              </div>
            ))}
          </div>
        </section>

        <Section title="Émetteur">
          <Field label="Marque" value={settings.marque} onChange={(v) => setS("marque", v)} />
          <Field label="Nom" value={settings.nom} onChange={(v) => setS("nom", v)} />
          <Field label="Tagline" value={settings.tagline} onChange={(v) => setS("tagline", v)} />
          <Field label="Spine (tranche)" value={settings.spine} onChange={(v) => setS("spine", v)} />
          <Field label="Forme juridique" value={settings.forme} onChange={(v) => setS("forme", v)} />
          <Field label="Téléphone" value={settings.tel} onChange={(v) => setS("tel", v)} />
          <Field label="Adresse" value={settings.adresse1} onChange={(v) => setS("adresse1", v)} />
          <Field label="Code postal · ville" value={settings.adresse2} onChange={(v) => setS("adresse2", v)} />
          <Field label="Email" value={settings.email} onChange={(v) => setS("email", v)} />
          <Field label="SIREN" value={settings.siren} onChange={(v) => setS("siren", v)} />
          <Field label="Mention RCS" value={settings.rcs} onChange={(v) => setS("rcs", v)} />
          <Field label="IBAN" value={settings.iban} onChange={(v) => setS("iban", v)} />
          <Field label="BIC" value={settings.bic} onChange={(v) => setS("bic", v)} />
          <Field label="Médiateur conso" value={settings.mediateur} onChange={(v) => setS("mediateur", v)} />
        </Section>
      </motion.div>

      {/* PREVIEW + COMPTA */}
      <div className="flex max-h-[calc(100vh-57px)] flex-col border-l border-hair">
        <div className="grid grid-cols-3 gap-px border-b border-hair bg-hair text-center">
          {[
            ["Total HT", formatEUR(total)],
            ["Cotis. URSSAF est.", formatEUR(cotis)],
            ["Net estimé", formatEUR(net)],
          ].map(([label, value]) => (
            <div key={label} className="bg-bone px-3 py-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-mist">{label}</div>
              <div className="font-mono text-sm text-forest">{value}</div>
            </div>
          ))}
        </div>
        <div className="flex-1">
          <PdfPreview data={data} />
        </div>
      </div>
    </div>
  );
}
