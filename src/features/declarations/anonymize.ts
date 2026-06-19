// Domaine Déclarations — anonymisation des factures
//
// Pour les déclarations (URSSAF, TVA, impôts), seul le chiffre d'affaires
// compte : l'identité des clients n'a pas à y figurer. On remplace donc le
// nom / la raison sociale par un pseudonyme stable (CLIENT-001, CLIENT-002…).

import type { DeclarationInvoice, DeclarationRow } from "./types";

const ALIAS_PREFIX = "CLIENT";

export function aliasFor(index: number): string {
  return `${ALIAS_PREFIX}-${String(index + 1).padStart(3, "0")}`;
}

/** Normalise un nom de client pour le regroupement (insensible à la casse/espaces). */
export function normalizeClientName(nom: string | null | undefined): string {
  return (nom ?? "").trim().toLowerCase() || "sans-client";
}

/**
 * Construit une table de correspondance « nom client » → « pseudonyme ».
 * L'ordre suit la première apparition : trier les factures en amont
 * (par date) garantit des pseudonymes stables d'une déclaration à l'autre.
 */
export function buildClientAliasMap(
  invoices: DeclarationInvoice[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const inv of invoices) {
    const key = normalizeClientName(inv.clientNom);
    if (!map.has(key)) map.set(key, aliasFor(map.size));
  }
  return map;
}

/**
 * Anonymise une liste de factures pour les déclarations.
 * Conserve numéro, date, montant et statut ; pseudonymise le client.
 */
export function anonymizeInvoices(
  invoices: DeclarationInvoice[],
): DeclarationRow[] {
  const aliasMap = buildClientAliasMap(invoices);
  return invoices.map((inv) => ({
    numero: inv.numero,
    dateEmission: inv.dateEmission,
    clientAlias:
      aliasMap.get(normalizeClientName(inv.clientNom)) ?? aliasFor(0),
    totalHT: inv.totalHT,
    status: inv.status,
  }));
}
