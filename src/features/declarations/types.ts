// Domaine Déclarations — types pour le récap anonymisé (URSSAF / TVA / impôts)

/** Facture telle qu'extraite pour une déclaration (données brutes, non anonymisées). */
export interface DeclarationInvoice {
  numero: string;
  dateEmission: string;
  clientNom: string;
  totalHT: number;
  status: string;
}

/** Ligne de déclaration anonymisée : le nom / la raison sociale du client
 *  est remplacé par un pseudonyme stable. */
export interface DeclarationRow {
  numero: string;
  dateEmission: string;
  clientAlias: string;
  totalHT: number;
  status: string;
}
