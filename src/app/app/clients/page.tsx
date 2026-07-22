import Link from "next/link";
import { Trash2, UserPlus, AlertTriangle } from "lucide-react";
import { createClient } from "@/shared/supabase/server";
import { addClient, deleteClient } from "@/features/clients/actions";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: clients } = await supabase.from("clients").select("*").order("nom");

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="code-badge text-[10px] mb-2">REPERTOIRE_CLIENTS</p>
      <h1 className="mb-8 font-display text-4xl font-bold text-ink">Tes clients</h1>

      {error === "quota" && (
        <div className="mb-6 flex items-start gap-3 rounded-md border border-brass/40 bg-brass/10 px-5 py-4 text-sm text-ink">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-brass" />
          <div>
            <p className="font-bold">Quota de clients atteint.</p>
            <p className="text-mist">
              Ton plan ne permet pas d&apos;ajouter plus de clients.{" "}
              <Link href="/app/abonnement" className="font-semibold text-brass underline underline-offset-2">
                Passe à un plan supérieur
              </Link>{" "}
              pour en ajouter davantage.
            </p>
          </div>
        </div>
      )}

      <form action={addClient} className="mb-8 rounded-md border border-paper/10 bg-void p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-brass">Ajouter un client</h2>
        <div className="grid grid-cols-2 gap-4">
          <input name="nom" required placeholder="Nom" className="rounded-md border border-paper/10 bg-void px-3 py-2 text-sm text-ink outline-none transition focus:border-brass placeholder:text-mist/50" />
          <input name="email" type="email" placeholder="Email" className="rounded-md border border-paper/10 bg-void px-3 py-2 text-sm text-ink outline-none transition focus:border-brass placeholder:text-mist/50" />
          <input name="adresse1" placeholder="Adresse" className="rounded-md border border-paper/10 bg-void px-3 py-2 text-sm text-ink outline-none transition focus:border-brass placeholder:text-mist/50" />
          <input name="adresse2" placeholder="Code postal, ville" className="rounded-md border border-paper/10 bg-void px-3 py-2 text-sm text-ink outline-none transition focus:border-brass placeholder:text-mist/50" />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-paper/10 pt-4">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="particulier" defaultChecked className="accent-brass" /> Particulier
          </label>
          <button type="submit" className="btn-primary text-sm px-5 py-2">
            <UserPlus size={15} /> Ajouter
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-md border border-paper/10 bg-void">
        {(clients ?? []).length === 0 ? (
          <p className="p-8 text-center text-mist text-sm font-medium">Aucun client.</p>
        ) : (
          (clients ?? []).map((c) => (
            <div key={c.id} className="flex items-center justify-between border-b border-paper/10 px-6 py-4 last:border-0 hover:bg-paper/5 transition-colors">
              <Link href={`/app/clients/${c.id}`} className="group">
                <span className="font-bold text-ink group-hover:text-brass">{c.nom}</span>
                {c.email && <span className="ml-3 text-sm text-mist">{c.email}</span>}
              </Link>
              <div className="flex items-center gap-4">
                <span className="rounded-md bg-paper/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brass">
                  {c.particulier ? "Particulier" : "Professionnel"}
                </span>
                <form action={deleteClient}>
                  <input type="hidden" name="id" value={c.id} />
                  <button className="text-mist transition hover:text-[#b3261e]" title="Supprimer">
                    <Trash2 size={16} />
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
