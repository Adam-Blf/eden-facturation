import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { createClient } from "@/shared/supabase/server";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from "@/features/invoicing/status";
import { formatEUR } from "@/shared/format";

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
      <div className="mb-8 flex items-end justify-between border-b border-paper/10 pb-4">
        <div>
          <p className="code-badge text-[10px] mb-2">ARCHIVES_FACTURES</p>
          <h1 className="font-display text-4xl font-bold text-ink">Tes factures</h1>
        </div>
        <Link
          href="/app/factures/nouvelle"
          className="btn-primary px-5 py-2.5 text-sm"
        >
          <Plus size={16} /> Nouvelle facture
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="rounded-md border border-dashed border-paper/20 bg-void p-12 text-center flex flex-col items-center">
          <FileText size={32} className="mb-4 text-mist opacity-50" />
          <p className="text-mist text-sm font-medium mb-4">Aucune facture pour le moment.</p>
          <Link href="/app/factures/nouvelle" className="btn-secondary text-xs py-2 px-4">
            Créer ma première facture
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-paper/10 bg-void">
          <table className="w-full text-sm">
            <thead className="border-b border-paper/10 bg-paper/5 text-left text-[10px] font-bold uppercase tracking-widest text-mist">
              <tr>
                <th className="px-5 py-4">Numéro</th>
                <th className="px-5 py-4">Client</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4 text-right">Total</th>
                <th className="px-5 py-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-paper/10 last:border-0 hover:bg-paper/5 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs text-brass">{inv.numero}</td>
                  <td className="px-5 py-4 font-medium text-ink">{inv.snapshot?.invoice?.client?.nom ?? "Sans client"}</td>
                  <td className="px-5 py-4 text-mist">{inv.date_emission}</td>
                  <td className="px-5 py-4 text-right font-mono text-ink font-bold">{formatEUR(Number(inv.total_ht))}</td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className="inline-block rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-void"
                      style={{ backgroundColor: INVOICE_STATUS_COLORS[inv.status] ?? "var(--primary)" }}
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
