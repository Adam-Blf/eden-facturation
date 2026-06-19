// Domaine Facturation — calcul des totaux d'une facture
// En franchise en base de TVA (art. 293 B CGI) : HT = TTC.

import type { Invoice, InvoiceLine } from "./types";
import { round2 } from "@/shared/math";

export function lineTotal(line: InvoiceLine): number {
  return round2(line.qte * line.pu);
}

export function invoiceTotalHT(invoice: Invoice): number {
  return round2(invoice.lines.reduce((s, l) => s + lineTotal(l), 0));
}

// En franchise en base de TVA, pas de TVA collectée.
export const TVA_RATE = 0;

export function invoiceTotalTTC(invoice: Invoice): number {
  return invoiceTotalHT(invoice); // TVA non applicable
}
