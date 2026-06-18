import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from "@/lib/db";
import { formatEUR } from "@/lib/format";

type Row = {
  id: string;
  numero: string;
  total_ht: number;
  status: string;
  date_emission: string;
  snapshot: { invoice?: { client?: { nom?: string } } } | null;
};

export default async function FacturesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("id, numero, total_ht, status, date_emission, snapshot")
    .order("created_at", { ascending: false });
  const invoices = (data ?? []) as Row[];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="eyebrow text-xs text-moss">Factures</p>
          <h1 className="font-display text-4xl font-bold text-forest">Tes factures</h1>
        </div>
        <Link
          href="/app/factures/nouvelle"
          className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-bold text-white transition hover:bg-moss"
        >
          <Plus size={16} /> Nouvelle facture
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hair bg-paper p-12 text-center">
          <FileText size={32} className="mx-auto mb-3 text-mist" />
          <p className="text-mist">Aucune facture pour le moment.</p>
          <Link href="/app/factures/nouvelle" className="mt-3 inline-block font-bold text-forest underline">
            Créer ma première facture
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-hair bg-paper">
          <table className="w-full text-sm">
            <thead className="border-b border-hair text-left text-[11px] uppercase tracking-wider text-mist">
              <tr>
                <th className="px-5 py-3">Numéro</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-hair last:border-0">
                  <td className="px-5 py-3 font-mono text-ink">{inv.numero}</td>
                  <td className="px-5 py-3 text-ink">{inv.snapshot?.invoice?.client?.nom ?? "—"}</td>
                  <td className="px-5 py-3 text-mist">{inv.date_emission}</td>
                  <td className="px-5 py-3 text-right font-mono text-ink">{formatEUR(Number(inv.total_ht))}</td>
                  <td className="px-5 py-3">
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
                      style={{ backgroundColor: INVOICE_STATUS_COLORS[inv.status] ?? "#8a968f" }}
                    >
                      {INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
