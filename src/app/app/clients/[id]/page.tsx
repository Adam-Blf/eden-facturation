import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save, FileText, Check } from "lucide-react";
import { createClient } from "@/shared/supabase/server";
import { updateClient } from "@/features/clients/actions";
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from "@/features/invoicing/status";
import { formatEUR } from "@/shared/format";

type InvoiceRow = {
  id: string;
  numero: string;
  total_ht: number;
  status: string;
  date_emission: string;
  client_id: string | null;
  snapshot: { invoice?: { client?: { nom?: string } } } | null;
};

const inputCls =
  "w-full rounded-md border border-paper/10 bg-void px-3 py-2 text-sm text-ink outline-none transition focus:border-brass placeholder:text-mist/50";

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const supabase = await createClient();

  const [{ data: client }, { data: invoiceRows }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).maybeSingle(),
    supabase.from("invoices").select("id, numero, total_ht, status, date_emission, client_id, snapshot").order("created_at", { ascending: false }),
  ]);

  if (!client) notFound();

  // Factures liées : par client_id, ou à défaut par nom (snapshot) pour les factures historiques.
  const invoices = ((invoiceRows ?? []) as InvoiceRow[]).filter(
    (inv) =>
      inv.client_id === id ||
      (inv.snapshot?.invoice?.client?.nom &&
        inv.snapshot.invoice.client.nom.trim().toLowerCase() ===
          (client.nom ?? "").trim().toLowerCase()),
  );
  const totalFacture = invoices.reduce((s, inv) => s + Number(inv.total_ht), 0);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/app/clients" className="mb-6 inline-flex items-center gap-2 text-sm text-mist transition hover:text-brass">
        <ArrowLeft size={16} /> Tous les clients
      </Link>

      <p className="code-badge text-[10px] mb-2">FICHE_CLIENT</p>
      <h1 className="mb-8 font-display text-4xl font-bold text-ink">{client.nom}</h1>

      {saved && (
        <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-brass/40 bg-brass/10 px-4 py-2 text-sm text-ink">
          <Check size={16} className="text-brass" /> Fiche client enregistrée.
        </div>
      )}

      <form action={updateClient} className="mb-10 rounded-md border border-paper/10 bg-void p-6">
        <input type="hidden" name="id" value={client.id} />
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-brass">Coordonnées</h2>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">Nom / raison sociale</span>
            <input name="nom" required defaultValue={client.nom ?? ""} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">Email</span>
            <input name="email" type="email" defaultValue={client.email ?? ""} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">Adresse</span>
            <input name="adresse1" defaultValue={client.adresse1 ?? ""} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">Code postal, ville</span>
            <input name="adresse2" defaultValue={client.adresse2 ?? ""} className={inputCls} />
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-paper/10 pt-4">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="particulier" defaultChecked={client.particulier ?? true} className="accent-brass" /> Particulier
          </label>
          <button type="submit" className="btn-primary text-sm px-5 py-2">
            <Save size={15} /> Enregistrer
          </button>
        </div>
      </form>

      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-brass">Factures du client</h2>
        <span className="text-sm text-mist">{invoices.length} · {formatEUR(totalFacture)}</span>
      </div>
      <div className="overflow-hidden rounded-md border border-paper/10 bg-void">
        {invoices.length === 0 ? (
          <p className="flex items-center justify-center gap-2 p-8 text-center text-sm text-mist">
            <FileText size={16} className="opacity-50" /> Aucune facture pour ce client.
          </p>
        ) : (
          invoices.map((inv) => (
            <Link
              key={inv.id}
              href={`/app/factures/${inv.id}`}
              className="flex items-center justify-between border-b border-paper/10 px-6 py-4 last:border-0 transition-colors hover:bg-paper/5"
            >
              <span className="font-mono text-xs text-brass">{inv.numero}</span>
              <span className="text-sm text-mist">{inv.date_emission}</span>
              <span className="font-mono text-sm font-bold text-ink">{formatEUR(Number(inv.total_ht))}</span>
              <span
                className="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-void"
                style={{ backgroundColor: INVOICE_STATUS_COLORS[inv.status] ?? "var(--primary)" }}
              >
                {INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
