import { createClient } from "@/lib/supabase/server";
import { settingsFromRow } from "@/lib/db";
import InvoiceWorkbench from "@/components/invoice/InvoiceWorkbench";
import type { Client } from "@/lib/types";

export default async function NouvelleFacturePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: settingsRow }, { data: clientsRows }] = await Promise.all([
    supabase.from("business_settings").select("*").eq("user_id", user!.id).maybeSingle(),
    supabase.from("clients").select("*").order("nom"),
  ]);

  const clients: Client[] = (clientsRows ?? []).map((c) => ({
    id: c.id,
    nom: c.nom,
    adresse1: c.adresse1 ?? "",
    adresse2: c.adresse2 ?? "",
    email: c.email ?? "",
    particulier: c.particulier ?? true,
  }));

  return <InvoiceWorkbench settings={settingsFromRow(settingsRow)} clients={clients} />;
}
