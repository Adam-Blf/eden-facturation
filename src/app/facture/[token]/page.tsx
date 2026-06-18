import { createClient } from "@/lib/supabase/server";
import { formatEUR } from "@/lib/format";
import { INVOICE_STATUS_LABELS } from "@/lib/db";
import type { BusinessSettings, Invoice } from "@/lib/types";
import PublicInvoiceAccept from "@/components/invoice/PublicInvoiceAccept";

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_invoice", { p_token: token });

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bone p-8 text-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-forest">Facture introuvable</h1>
          <p className="mt-2 text-mist">Ce lien est invalide ou la facture n’est plus disponible.</p>
        </div>
      </main>
    );
  }

  const snap = (data.snapshot ?? {}) as { settings?: BusinessSettings; invoice?: Invoice };
  const st = snap.settings;
  const inv = snap.invoice;
  const primary = st?.colorPrimary ?? "#14342b";
  const accent = st?.colorAccent ?? "#c8a24b";

  return (
    <main className="min-h-screen bg-bone py-10">
      <div className="mx-auto max-w-2xl px-6">
        <div className="overflow-hidden rounded-3xl border border-hair bg-paper shadow-sm">
          <div className="px-8 py-6 text-white" style={{ backgroundColor: primary }}>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>
              Facture {data.numero}
            </p>
            <h1 className="font-display text-3xl font-bold">{st?.marque ?? "Facture"}</h1>
            {st?.nom && <p className="text-white/70">{st.nom}</p>}
          </div>

          <div className="px-8 py-6">
            <div className="mb-4 flex justify-between text-sm">
              <span className="text-mist">Facturé à</span>
              <span className="font-bold text-ink">{inv?.client?.nom}</span>
            </div>
            <div className="border-t border-hair pt-4">
              {inv?.lines?.map((l, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between">
                    <span className="font-display text-lg text-ink">{l.titre}</span>
                    <span className="font-mono text-ink">{formatEUR(l.qte * l.pu)}</span>
                  </div>
                  {l.details.filter(Boolean).map((d, j) => (
                    <p key={j} className="text-sm text-mist">· {d}</p>
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl px-4 py-3 text-white" style={{ backgroundColor: primary }}>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>
                Net à payer
              </span>
              <span className="font-display text-2xl font-bold">{formatEUR(Number(data.total_ht))}</span>
            </div>

            <div className="mt-4 text-center text-xs text-mist">
              Statut : {INVOICE_STATUS_LABELS[data.status] ?? data.status}
            </div>

            <PublicInvoiceAccept token={token} status={data.status} acceptedAt={data.accepted_at} />
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-mist">Propulsé par EDEN · facturation</p>
      </div>
    </main>
  );
}
