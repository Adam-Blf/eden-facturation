import { createClient } from "@/lib/supabase/server";
import { settingsFromRow } from "@/lib/db";
import InvoiceWorkbench from "@/components/invoice/InvoiceWorkbench";
import type { Client } from "@/lib/types";

export default async function NouvelleFacturePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const year = new Date().getFullYear();
  const [{ data: settingsRow }, { data: clientsRows }, { data: invoicesYear }] = await Promise.all([
    supabase.from("business_settings").select("*").eq("user_id", user!.id).maybeSingle(),
    supabase.from("clients").select("*").order("nom"),
    supabase.from("invoices").select("numero").eq("user_id", user!.id).like("numero", `${year}-%`),
  ]);

  // compteur automatique : prochain numero sequentiel de l'annee (AAAA-NNNN)
  let maxSeq = 0;
  for (const inv of invoicesYear ?? []) {
    const m = /^\d{4}-(\d+)$/.exec(inv.numero ?? "");
    if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10));
  }
  const nextNumero = `${year}-${String(maxSeq + 1).padStart(4, "0")}`;

  const clients: Client[] = (clientsRows ?? []).map((c) => ({
    id: c.id,
    nom: c.nom,
    adresse1: c.adresse1 ?? "",
    adresse2: c.adresse2 ?? "",
    email: c.email ?? "",
    particulier: c.particulier ?? true,
  }));

  return (
    <InvoiceWorkbench
      settings={settingsFromRow(settingsRow)}
      clients={clients}
      defaultNumero={nextNumero}
    />
  );
}
