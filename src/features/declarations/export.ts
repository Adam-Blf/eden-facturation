// Domaine Déclarations — génération du livre des recettes anonymisé (CSV)

import type { DeclarationRow } from "./types";

/** Échappe une cellule CSV (séparateur ';'). */
function csvCell(value: string | number): string {
  const s = String(value);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Montant au format français (virgule décimale). */
function amountFR(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

/**
 * Génère un livre des recettes anonymisé au format CSV.
 * Séparateur ';' + BOM UTF-8 pour une ouverture directe dans Excel FR.
 */
export function toLivreRecettesCSV(
  rows: DeclarationRow[],
  statusLabels: Record<string, string> = {},
): string {
  const header = ["Numéro", "Date", "Client", "Montant HT (€)", "Statut"];
  const lines = [header.map(csvCell).join(";")];

  for (const r of rows) {
    lines.push(
      [
        csvCell(r.numero),
        csvCell(r.dateEmission),
        csvCell(r.clientAlias),
        csvCell(amountFR(r.totalHT)),
        csvCell(statusLabels[r.status] ?? r.status),
      ].join(";"),
    );
  }

  const total = rows.reduce((s, r) => s + r.totalHT, 0);
  lines.push(["", "", "TOTAL", csvCell(amountFR(total)), ""].join(";"));

  return "\uFEFF" + lines.join("\r\n");
}

/** Nom de fichier suggéré pour l'export. */
export function declarationFileName(year: number): string {
  return `declaration-recettes-${year}-anonymise.csv`;
}
