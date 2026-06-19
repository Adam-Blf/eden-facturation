import Link from "next/link";
import { ArrowLeft, Download, ShieldCheck } from "lucide-react";
import { createClient } from "@/shared/supabase/server";
import { settingsFromRow } from "@/features/branding/settings-mapping";
import { loadDeclarationInvoices } from "@/features/declarations/data";
import { anonymizeInvoices } from "@/features/declarations/anonymize";
import { estimatedCotisations } from "@/features/accounting/compta";
import { INVOICE_STATUS_LABELS } from "@/features/invoicing/status";
import { formatEUR } from "@/shared/format";

export default async function DeclarationYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearParam } = await params;
  const year = Number(yearParam) || new Date().getFullYear();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [{ data: settingsRow }, invoices] = await Promise.all([
    supabase.from("business_settings").select("*").eq("user_id", user!.id).maybeSingle(),
    loadDeclarationInvoices(year),
  ]);

  const settings = settingsFromRow(settingsRow);
  const rows = anonymizeInvoices(invoices);
  const total = rows.reduce((s, r) => s + r.totalHT, 0);
  const encaisse = rows
    .filter((r) => r.status === "paid")
    .reduce((s, r) => s + r.totalHT, 0);
  const cotis = estimatedCotisations(encaisse, settings);

  const stats: [string, string][] = [
    ["CA facturé", formatEUR(total)],
    ["CA encaissé", formatEUR(encaisse)],
    ["Cotisations URSSAF (est.)", formatEUR(cotis)],
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/app/compta/declarations" className="mb-6 inline-flex items-center gap-2 text-sm text-mist transition hover:text-brass">
        <ArrowLeft size={16} /> Historique des déclarations
      </Link>

      <p className="eyebrow text-xs text-brass">Déclaration</p>
      <h1 className="mb-2 font-display text-4xl font-bold text-ink">Exercice {year}</h1>
      <p className="mb-8 max-w-2xl text-sm text-mist">
        Récap anonymisé pour vos déclarations URSSAF / TVA / impôts. Le nom et la
        raison sociale des clients sont remplacés par un pseudonyme.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-hair bg-paper p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-mist">{label}</div>
            <div className="mt-1 font-display text-2xl font-bold text-ink">{value}</div>
          </div>
        ))}
      </div>

      <a
        href={`/api/declarations?year=${year}`}
        className="mb-8 inline-flex items-center gap-2 rounded-full bg-brass px-5 py-2.5 text-sm font-bold text-void hover:bg-tan"
      >
        <Download size={16} /> Télécharger le récap anonymisé (CSV)
      </a>

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-hair bg-paper p-4 text-sm text-mist">
        <ShieldCheck size={18} className="shrink-0 text-brass" />
        <span>
          {rows.length} facture{rows.length > 1 ? "s" : ""} sur {year} — clients anonymisés.
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hair bg-void p-12 text-center text-sm text-mist">
          Aucune facture pour {year}.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-hair bg-void">
          <table className="w-full text-sm">
            <thead className="border-b border-hair bg-paper/5 text-left text-[10px] font-bold uppercase tracking-widest text-mist">
              <tr>
                <th className="px-5 py-4">Numéro</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Client (anonymisé)</th>
                <th className="px-5 py-4 text-right">Montant HT</th>
                <th className="px-5 py-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.numero} className="border-b border-hair last:border-0 hover:bg-paper/5">
                  <td className="px-5 py-4 font-mono text-xs text-brass">{r.numero}</td>
                  <td className="px-5 py-4 text-mist">{r.dateEmission}</td>
                  <td className="px-5 py-4 font-mono font-medium text-ink">{r.clientAlias}</td>
                  <td className="px-5 py-4 text-right font-mono font-bold text-ink">{formatEUR(r.totalHT)}</td>
                  <td className="px-5 py-4 text-center text-mist">{INVOICE_STATUS_LABELS[r.status] ?? r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
