import type { BusinessSettings, Invoice, InvoiceLine } from "./types";

// ---- Totaux facture (franchise en base : HT = TTC) ----

export function lineTotal(line: InvoiceLine): number {
  return round2(line.qte * line.pu);
}

export function invoiceTotalHT(invoice: Invoice): number {
  return round2(invoice.lines.reduce((s, l) => s + lineTotal(l), 0));
}

// En franchise en base de TVA (art. 293 B CGI), pas de TVA collectée.
export const TVA_RATE = 0;

export function invoiceTotalTTC(invoice: Invoice): number {
  return invoiceTotalHT(invoice); // TVA non applicable
}

// ---- Compta micro-entreprise ----

/** Cotisations sociales URSSAF estimées sur le CA encaissé. */
export function estimatedCotisations(
  caEncaisse: number,
  settings: BusinessSettings,
): number {
  let rate = settings.cotisationRate;
  if (settings.versementLiberatoire) rate += settings.vfrRate;
  return round2(caEncaisse * rate);
}

/** Revenu net estimé après cotisations (avant impôt si pas de VFL). */
export function netAfterCotisations(
  caEncaisse: number,
  settings: BusinessSettings,
): number {
  return round2(caEncaisse - estimatedCotisations(caEncaisse, settings));
}

// Seuils 2025/2026 (à confirmer chaque LF), prestations de services
export const SEUILS = {
  microServices: 77_700, // plafond micro BIC/BNC prestations de services
  franchiseTvaBase: 37_500, // franchise en base TVA (services), seuil de base
  franchiseTvaMajore: 41_250, // seuil majoré
};

export interface SeuilStatus {
  ca: number;
  pctMicro: number; // % du plafond micro
  pctTva: number; // % du seuil franchise TVA
  alerteTva: boolean; // CA approche/dépasse le seuil franchise TVA
  depasseMicro: boolean;
}

export function seuilStatus(caAnnuel: number): SeuilStatus {
  return {
    ca: caAnnuel,
    pctMicro: round2((caAnnuel / SEUILS.microServices) * 100),
    pctTva: round2((caAnnuel / SEUILS.franchiseTvaBase) * 100),
    alerteTva: caAnnuel >= SEUILS.franchiseTvaBase * 0.9,
    depasseMicro: caAnnuel > SEUILS.microServices,
  };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
