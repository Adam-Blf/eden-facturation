import type { BusinessSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

/* Mapping snake_case (DB) <-> camelCase (app) pour business_settings */

export function settingsFromRow(row: Record<string, unknown> | null): BusinessSettings {
  if (!row) return DEFAULT_SETTINGS;
  const r = row as Record<string, never>;
  const v = <T,>(key: string, fallback: T): T =>
    (r[key] ?? fallback) as unknown as T;
  return {
    marque: v("marque", DEFAULT_SETTINGS.marque),
    tagline: v("tagline", ""),
    spine: v("spine", ""),
    nom: v("nom", ""),
    forme: v("forme", DEFAULT_SETTINGS.forme),
    adresse1: v("adresse1", ""),
    adresse2: v("adresse2", ""),
    email: v("email", ""),
    tel: v("tel", ""),
    siren: v("siren", ""),
    rcs: v("rcs", ""),
    iban: v("iban", ""),
    bic: v("bic", ""),
    mediateur: v("mediateur", ""),
    cotisationRate: Number(v("cotisation_rate", DEFAULT_SETTINGS.cotisationRate)),
    versementLiberatoire: Boolean(v("versement_liberatoire", false)),
    vfrRate: Number(v("vfr_rate", DEFAULT_SETTINGS.vfrRate)),
    logoUrl: v("logo_url", null),
    colorPrimary: v("color_primary", DEFAULT_SETTINGS.colorPrimary),
    colorAccent: v("color_accent", DEFAULT_SETTINGS.colorAccent),
    colorInk: v("color_ink", DEFAULT_SETTINGS.colorInk),
    fontDisplay: v("font_display", DEFAULT_SETTINGS.fontDisplay),
    fontBody: v("font_body", DEFAULT_SETTINGS.fontBody),
  };
}

export function settingsToRow(s: BusinessSettings, userId: string) {
  return {
    user_id: userId,
    marque: s.marque,
    tagline: s.tagline,
    spine: s.spine,
    nom: s.nom,
    forme: s.forme,
    adresse1: s.adresse1,
    adresse2: s.adresse2,
    email: s.email,
    tel: s.tel,
    siren: s.siren,
    rcs: s.rcs,
    iban: s.iban,
    bic: s.bic,
    mediateur: s.mediateur,
    cotisation_rate: s.cotisationRate,
    versement_liberatoire: s.versementLiberatoire,
    vfr_rate: s.vfrRate,
    logo_url: s.logoUrl ?? null,
    color_primary: s.colorPrimary,
    color_accent: s.colorAccent,
    color_ink: s.colorInk,
    font_display: s.fontDisplay,
    font_body: s.fontBody,
    updated_at: new Date().toISOString(),
  };
}

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  issued: "Validée",
  sent: "Envoyée",
  accepted: "Acceptée",
  paid: "Payée",
  overdue: "En retard",
  cancelled: "Annulée",
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: "#8a968f",
  issued: "#c8a24b",
  sent: "#3e5c4b",
  accepted: "#10b981",
  paid: "#14342b",
  overdue: "#e11d48",
  cancelled: "#8a968f",
};
