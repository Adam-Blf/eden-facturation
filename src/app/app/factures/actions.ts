"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { invoiceTotalHT } from "@/lib/compta";
import type { Invoice, BusinessSettings } from "@/lib/types";

function invoiceBase(invoice: Invoice, userId: string, status: string) {
  return {
    user_id: userId,
    numero: invoice.numero,
    date_emission: invoice.dateEmission,
    date_prestation: invoice.datePrestation,
    echeance: invoice.echeance,
    reglement: invoice.reglement,
    note: invoice.noteFamiliale ?? "",
    status,
    total_ht: invoiceTotalHT(invoice),
  };
}

async function persistLines(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoiceId: string,
  invoice: Invoice,
) {
  await supabase.from("invoice_lines").delete().eq("invoice_id", invoiceId);
  const rows = invoice.lines.map((l, i) => ({
    invoice_id: invoiceId,
    position: i,
    titre: l.titre,
    details: l.details.filter(Boolean),
    qte: l.qte,
    pu: l.pu,
  }));
  if (rows.length) await supabase.from("invoice_lines").insert(rows);
}

export async function saveInvoice(invoice: Invoice, settings?: BusinessSettings) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const row = {
    ...invoiceBase(invoice, user.id, "draft"),
    snapshot: settings ? { settings, invoice } : { invoice },
  };

  let id = invoice.id;
  if (id) {
    const { error } = await supabase.from("invoices").update(row).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase.from("invoices").insert(row).select("id").single();
    if (error) return { error: error.message };
    id = data.id;
  }
  await persistLines(supabase, id!, invoice);
  revalidatePath("/app/factures");
  return { id };
}

export async function issueInvoice(invoice: Invoice, settings: BusinessSettings) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  const row = {
    ...invoiceBase(invoice, user.id, "issued"),
    snapshot: { settings, invoice },
    issued_at: new Date().toISOString(),
  };

  let id = invoice.id;
  if (id) {
    const { error } = await supabase.from("invoices").update(row).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase.from("invoices").insert(row).select("id").single();
    if (error) return { error: error.message };
    id = data.id;
  }
  await persistLines(supabase, id!, invoice);

  const { data: tok } = await supabase
    .from("invoices")
    .select("public_token")
    .eq("id", id!)
    .single();

  revalidatePath("/app/factures");
  return { id, token: tok?.public_token as string };
}
