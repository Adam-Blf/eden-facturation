import { Trash2, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { addClient, deleteClient } from "./actions";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase.from("clients").select("*").order("nom");

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="eyebrow text-xs text-moss">Clients</p>
      <h1 className="mb-8 font-display text-4xl font-bold text-forest">Tes clients</h1>

      <form action={addClient} className="mb-8 rounded-2xl border border-hair bg-paper p-5">
        <h2 className="mb-3 text-sm font-bold text-ink">Ajouter un client</h2>
        <div className="grid grid-cols-2 gap-3">
          <input name="nom" required placeholder="Nom" className="rounded-lg border border-hair bg-bone px-3 py-2 text-sm outline-none focus:border-forest" />
          <input name="email" type="email" placeholder="Email" className="rounded-lg border border-hair bg-bone px-3 py-2 text-sm outline-none focus:border-forest" />
          <input name="adresse1" placeholder="Adresse" className="rounded-lg border border-hair bg-bone px-3 py-2 text-sm outline-none focus:border-forest" />
          <input name="adresse2" placeholder="Code postal · ville" className="rounded-lg border border-hair bg-bone px-3 py-2 text-sm outline-none focus:border-forest" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="particulier" defaultChecked /> Particulier
          </label>
          <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-bold text-white transition hover:bg-moss">
            <UserPlus size={15} /> Ajouter
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-hair bg-paper">
        {(clients ?? []).length === 0 ? (
          <p className="p-8 text-center text-mist">Aucun client.</p>
        ) : (
          (clients ?? []).map((c) => (
            <div key={c.id} className="flex items-center justify-between border-b border-hair px-5 py-3 last:border-0">
              <div>
                <span className="font-bold text-ink">{c.nom}</span>
                {c.email && <span className="ml-2 text-sm text-mist">{c.email}</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-bone px-2 py-1 text-[11px] text-mist">
                  {c.particulier ? "Particulier" : "Professionnel"}
                </span>
                <form action={deleteClient}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-mist transition hover:text-[#b3261e]">
                    <Trash2 size={15} />
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
