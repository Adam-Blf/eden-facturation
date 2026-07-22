// Domaine Comptabilité — cotisations URSSAF & seuils micro-entreprise

import type { BusinessSettings } from "@/features/branding/types";
import { round2 } from "@/shared/math";

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

// Micro-entreprise (auto-entrepreneur) : les plafonds micro ne concernent que ce statut.
export function isMicroEntreprise(forme: string | undefined | null): boolean {
  return /micro|auto.?entrepreneur/i.test(forme ?? "");
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
