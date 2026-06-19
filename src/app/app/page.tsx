import Link from "next/link";
import { Plus, TrendingUp, Receipt, Landmark, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { settingsFromRow } from "@/lib/db";
import { estimatedCotisations, netAfterCotisations, seuilStatus, SEUILS, isMicroEntreprise } from "@/lib/compta";
import { formatEUR } from "@/lib/format";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const year = new Date().getFullYear();
  const yearStart = `${year}-01-01`;

  const [{ data: settingsRow }, { data: invoices }, { data: payments }] = await Promise.all([
    supabase.from("business_settings").select("*").eq("user_id", user!.id).maybeSingle(),
    supabase.from("invoices").select("total_ht, created_at").gte("created_at", yearStart),
    supabase.from("payments").select("amount, paid_at").gte("paid_at", yearStart),
  ]);

  const settings = settingsFromRow(settingsRow);
  const caEncaisse = (payments ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const caFacture = (invoices ?? []).reduce((s, i) => s + Number(i.total_ht), 0);
  const cotis = estimatedCotisations(caEncaisse, settings);
  const net = netAfterCotisations(caEncaisse, settings);
  const seuil = seuilStatus(caEncaisse);
  const micro = isMicroEntreprise(settings.forme);

  const cards = [
    { label: `CA encaissé ${year}`, value: formatEUR(caEncaisse), icon: TrendingUp },
    { label: "CA facturé", value: formatEUR(caFacture), icon: Receipt },
    { label: "Cotisations URSSAF est.", value: formatEUR(cotis), icon: Landmark },
    { label: "Net estimé", value: formatEUR(net), icon: Wallet },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="eyebrow text-xs text-brass">Tableau de bord</p>
          <h1 className="font-display text-4xl font-bold text-ink">
            Bonjour{settings.nom ? `, ${settings.nom.split(" ")[0]}` : ""}
          </h1>
        </div>
        <Link
          href="/app/factures/nouvelle"
          className="btn-primary text-sm px-5 py-2.5"
        >
          <Plus size={16} /> Nouvelle facture
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-brutal">
            <Icon size={18} className="mb-3 text-brass" />
            <div className="text-[11px] font-bold uppercase tracking-wider text-mist">{label}</div>
            <div className="mt-1 font-display text-2xl font-bold text-ink">{value}</div>
          </div>
        ))}
      </div>

      {micro && (
        <div className="card-brutal mt-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-bold text-ink">Plafond micro-entreprise</span>
            <span className="font-mono text-mist">
              {formatEUR(caEncaisse)} / {formatEUR(SEUILS.microServices)}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-void border border-hair">
            <div
              className="h-full rounded-full bg-brass"
              style={{ width: `${Math.min(seuil.pctMicro, 100)}%` }}
            />
          </div>
          {seuil.alerteTva && (
            <p className="mt-3 text-sm text-[#b45309]">
              ⚠️ Tu approches le seuil de franchise en base de TVA ({formatEUR(SEUILS.franchiseTvaBase)}).
              Au-delà, tu devras facturer la TVA.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
