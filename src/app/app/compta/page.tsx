import { createClient } from "@/lib/supabase/server";
import { settingsFromRow } from "@/lib/db";
import { estimatedCotisations, netAfterCotisations, seuilStatus, SEUILS, isMicroEntreprise } from "@/lib/compta";
import { formatEUR } from "@/lib/format";
import { addPayment, addExpense } from "./actions";

export default async function ComptaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const year = new Date().getFullYear();
  const yearStart = `${year}-01-01`;

  const [{ data: settingsRow }, { data: payments }, { data: expenses }] = await Promise.all([
    supabase.from("business_settings").select("*").eq("user_id", user!.id).maybeSingle(),
    supabase.from("payments").select("*").gte("paid_at", yearStart).order("paid_at", { ascending: false }),
    supabase.from("expenses").select("*").gte("spent_at", yearStart).order("spent_at", { ascending: false }),
  ]);

  const settings = settingsFromRow(settingsRow);
  const caEncaisse = (payments ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const charges = (expenses ?? []).reduce((s, e) => s + Number(e.amount), 0);
  const cotis = estimatedCotisations(caEncaisse, settings);
  const net = netAfterCotisations(caEncaisse, settings) - charges;
  const seuil = seuilStatus(caEncaisse);

  const stats = [
    ["CA encaissé", formatEUR(caEncaisse)],
    ["Cotisations URSSAF", formatEUR(cotis)],
    ["Charges", formatEUR(charges)],
    ["Net estimé", formatEUR(net)],
  ];

  const inputCls = "rounded-lg border border-hair bg-bone px-3 py-2 text-sm outline-none focus:border-forest";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <p className="eyebrow text-xs text-moss">Comptabilité</p>
      <h1 className="mb-8 font-display text-4xl font-bold text-forest">Ma compta {year}</h1>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-hair bg-paper p-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-mist">{label}</div>
            <div className="mt-1 font-display text-2xl font-bold text-forest">{value}</div>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-2xl border border-hair bg-paper p-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-bold text-ink">Seuil franchise TVA</span>
          <span className="font-mono text-mist">{formatEUR(caEncaisse)} / {formatEUR(SEUILS.franchiseTvaBase)}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-bone">
          <div className="h-full rounded-full bg-gold" style={{ width: `${Math.min(seuil.pctTva, 100)}%` }} />
        </div>
        {seuil.depasseMicro && isMicroEntreprise(settings.forme) && (
          <p className="mt-2 text-sm text-[#b3261e]">⚠️ Plafond micro-entreprise dépassé ({formatEUR(SEUILS.microServices)}).</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Paiements */}
        <div className="rounded-2xl border border-hair bg-paper p-5">
          <h2 className="mb-3 text-sm font-bold text-ink">Encaissements</h2>
          <form action={addPayment} className="mb-4 flex flex-wrap gap-2">
            <input name="amount" type="number" step="0.01" placeholder="Montant €" required className={inputCls} />
            <input name="paid_at" type="date" className={inputCls} />
            <button className="rounded-full bg-forest px-4 py-2 text-sm font-bold text-white hover:bg-moss">Ajouter</button>
          </form>
          {(payments ?? []).slice(0, 8).map((p) => (
            <div key={p.id} className="flex justify-between border-t border-hair py-2 text-sm">
              <span className="text-mist">{p.paid_at}</span>
              <span className="font-mono text-ink">{formatEUR(Number(p.amount))}</span>
            </div>
          ))}
        </div>

        {/* Dépenses */}
        <div className="rounded-2xl border border-hair bg-paper p-5">
          <h2 className="mb-3 text-sm font-bold text-ink">Dépenses</h2>
          <form action={addExpense} className="mb-4 flex flex-wrap gap-2">
            <input name="label" placeholder="Libellé" required className={inputCls} />
            <input name="amount" type="number" step="0.01" placeholder="€" required className={`${inputCls} w-24`} />
            <input name="spent_at" type="date" className={inputCls} />
            <button className="rounded-full bg-forest px-4 py-2 text-sm font-bold text-white hover:bg-moss">Ajouter</button>
          </form>
          {(expenses ?? []).slice(0, 8).map((e) => (
            <div key={e.id} className="flex justify-between border-t border-hair py-2 text-sm">
              <span className="text-mist">{e.label}</span>
              <span className="font-mono text-ink">{formatEUR(Number(e.amount))}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
