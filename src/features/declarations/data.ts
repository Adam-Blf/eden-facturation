// Domaine Déclarations — chargement des factures pour une déclaration

import { createClient } from "@/shared/supabase/server";
import type { DeclarationInvoice } from "./types";

type InvoiceRow = {
  numero: string;
  date_emission: string;
  total_ht: number;
  status: string;
  created_at: string;
  snapshot: { invoice?: { client?: { nom?: string } } } | null;
};

/** Extrait l'année d'émission (gère ISO `2026-06-19` et FR `19/06/2026`). */
export function extractYear(dateEmission: string, fallbackISO: string): number {
  const iso = dateEmission.match(/^(\d{4})-\d{2}-\d{2}/);
  if (iso) return Number(iso[1]);
  const fr = dateEmission.match(/(\d{4})/);
  if (fr) return Number(fr[1]);
  return new Date(fallbackISO).getFullYear();
}

/**
 * Charge les factures de l'utilisateur courant pour l'année donnée,
 * triées par ancienneté (pour des pseudonymes stables côté anonymisation).
 * La RLS Supabase garantit que seules les factures de l'utilisateur sont lues.
 */
export async function loadDeclarationInvoices(
  year: number,
): Promise<DeclarationInvoice[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("invoices")
    .select("numero, date_emission, total_ht, status, snapshot, created_at")
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as InvoiceRow[];
  return rows
    .filter((r) => extractYear(r.date_emission, r.created_at) === year)
    .map((r) => ({
      numero: r.numero,
      dateEmission: r.date_emission,
      clientNom: r.snapshot?.invoice?.client?.nom ?? "",
      totalHT: Number(r.total_ht),
      status: r.status,
    }));
}
