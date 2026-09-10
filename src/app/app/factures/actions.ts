"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { invoiceTotalHT } from "@/lib/compta";
import type { Invoice, BusinessSettings } from "@/lib/types";
import { sendInvoiceNotification } from "@/lib/email/resend";
import { validateClientEmail, formatInvoiceName, formatInvoiceTotal, formatEmailDate } from "@/lib/email/utils";

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
  return { id, token: tok?.public_token as string, clientEmail: invoice.client?.email ?? "" };
}

// ---------------------------------------------------------------------------
// sendInvoiceEmail - server action: issued -> sent
// ---------------------------------------------------------------------------

interface SendEmailResult {
  error?: string;
  sentAt?: string;
}

export async function sendInvoiceEmail(invoiceId: string): Promise<SendEmailResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié" };

  // Fetch invoice row (RLS ensures ownership)
  const { data: row, error: fetchError } = await supabase
    .from("invoices")
    .select("id, user_id, status, sent_at, public_token, total_ht, snapshot, numero")
    .eq("id", invoiceId)
    .single();

  if (fetchError || !row) return { error: "Facture introuvable" };

  // Fast-path status guards (non-authoritative; the atomic claim below is the true guard)
  if (row.status === "sent") {
    return { error: "Cette facture a déjà été envoyée" };
  }
  if (row.status !== "issued") {
    return { error: "Veuillez valider la facture d'abord" };
  }

  // Extract data from snapshot (frozen at issue time - authoritative billing document).
  // The recipient address comes from the snapshot so it matches the document we are delivering.
  const snapshot = row.snapshot as {
    settings?: BusinessSettings;
    invoice?: Invoice;
  } | null;

  const invoiceSnap = snapshot?.invoice;
  const settingsSnap = snapshot?.settings;

  const clientEmail = invoiceSnap?.client?.email ?? "";
  if (!validateClientEmail(clientEmail)) {
    return { error: "Adresse email du client manquante ou invalide" };
  }

  const clientName = invoiceSnap?.client?.nom ?? "Client";
  const numero = invoiceSnap?.numero ?? (row.numero as string);
  const dateEmission = formatEmailDate(invoiceSnap?.dateEmission ?? "");
  const totalAmount = Number(row.total_ht);
  const total = formatInvoiceTotal(totalAmount);
  const invoiceName = formatInvoiceName(numero);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const publicLink = `${appUrl}/facture/${row.public_token}`;

  const sentAt = new Date().toISOString();

  // Atomic claim: transition issued -> sent BEFORE sending.
  // The conditional .eq('status', 'issued') ensures exactly one concurrent caller
  // wins the race; all others receive an empty `claimed` array and bail out.
  const { data: claimed } = await supabase
    .from("invoices")
    .update({ status: "sent", sent_at: sentAt })
    .eq("id", invoiceId)
    .eq("status", "issued")
    .select("id");

  if (!claimed?.length) {
    return { error: "Cette facture a déjà été envoyée" };
  }

  // Send via Resend (after the atomic claim is secured)
  const sendResult = await sendInvoiceNotification({
    clientEmail,
    invoiceName,
    clientName,
    publicLink,
    senderName: settingsSnap?.nom ?? "",
    senderEmail: settingsSnap?.email ?? "",
    senderPhone: settingsSnap?.tel ?? undefined,
    total,
    dateEmission,
    businessColor: settingsSnap?.colorPrimary ?? "#0b0b0c",
  });

  if (!sendResult.success) {
    // Revert the claim so the invoice remains retriable (no email was delivered).
    await supabase
      .from("invoices")
      .update({ status: "issued" })
      .eq("id", invoiceId);
    return { error: sendResult.error ?? "Échec d'envoi. Réessayez ultérieurement." };
  }

  // Audit log (non-blocking: failure here must not roll back an already-delivered email)
  await supabase.from("email_logs").insert({
    user_id: user.id,
    invoice_id: invoiceId,
    recipient_email: clientEmail,
    subject: `${invoiceName} - ${settingsSnap?.marque ?? "Facture"}`,
    sent_at: sentAt,
    status: "sent",
  });

  revalidatePath("/app/factures");
  return { sentAt };
}
