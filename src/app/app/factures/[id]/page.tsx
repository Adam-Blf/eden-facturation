import { notFound } from "next/navigation";
import { createClient } from "@/shared/supabase/server";
import { settingsFromRow } from "@/features/branding/settings-mapping";
import InvoiceWorkbench from "@/features/invoicing/InvoiceWorkbench";
import { DEFAULT_INVOICE, type Invoice } from "@/features/invoicing/types";
import type { Client } from "@/features/clients/types";

export default async function EditFacturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: row }, { data: lines }, { data: settingsRow }, { data: clientsRows }] =
    await Promise.all([
      supabase.from("invoices").select("*").eq("id", id).maybeSingle(),
      supabase.from("invoice_lines").select("*").eq("invoice_id", id).order("position"),
      supabase.from("business_settings").select("*").eq("user_id", user!.id).maybeSingle(),
      supabase.from("clients").select("*").order("nom"),
    ]);

  if (!row) notFound();

  // On privilégie le snapshot (état figé) ; sinon on reconstruit depuis les colonnes + lignes.
  const snap = (row.snapshot as { invoice?: Invoice } | null)?.invoice;
  const invoice: Invoice = snap
    ? { ...snap, id: row.id, status: row.status }
    : {
        ...DEFAULT_INVOICE,
        id: row.id,
        numero: row.numero,
        dateEmission: row.date_emission ?? "",
        datePrestation: row.date_prestation ?? "",
        echeance: row.echeance ?? "",
        reglement: row.reglement ?? "Virement bancaire",
        status: row.status,
        noteFamiliale: row.note ?? "",
        client: {
          nom: "",
          adresse1: "",
          adresse2: "",
          email: "",
          particulier: true,
        },
        lines: (lines ?? []).map((l) => ({
          titre: l.titre ?? "",
          details: (l.details as string[] | null) ?? [],
          qte: Number(l.qte ?? 1),
          pu: Number(l.pu ?? 0),
        })),
      };

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
      initialInvoice={invoice}
    />
  );
}
