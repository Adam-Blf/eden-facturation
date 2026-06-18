// Domain types for EDEN invoicing & accounting

export type InvoiceStatus =
  | "draft"
  | "issued"
  | "sent"
  | "accepted"
  | "paid"
  | "overdue"
  | "cancelled";

export interface BusinessSettings {
  marque: string; // EDEN
  tagline: string; // Studio créatif · production web & digital
  spine: string; // CRÉATIF · WEB · DIGITAL
  nom: string; // Adam Beloucif
  forme: string; // Entrepreneur Individuel (EI)
  adresse1: string;
  adresse2: string;
  email: string;
  tel: string;
  siren: string;
  rcs: string;
  iban: string;
  bic: string;
  mediateur: string;
  /** Régime micro : taux de cotisations URSSAF appliqué au CA encaissé */
  cotisationRate: number; // ex. 0.212 (BIC prestations de services)
  /** Versement fiscal libératoire activé ? */
  versementLiberatoire: boolean;
  vfrRate: number; // ex. 0.017 (BIC services)
  /** Charte graphique (DA du client) appliquée à la facture */
  logoUrl?: string | null;
  colorPrimary: string;
  colorAccent: string;
  colorInk: string;
  fontDisplay: string;
  fontBody: string;
}

export interface Client {
  id?: string;
  nom: string;
  adresse1: string;
  adresse2: string;
  email: string;
  particulier: boolean; // true => mention médiateur conso obligatoire
}

export interface InvoiceLine {
  titre: string;
  details: string[];
  qte: number;
  pu: number; // prix unitaire HT en euros
}

export interface Invoice {
  id?: string;
  numero: string; // 2026-001
  dateEmission: string; // dd/mm/yyyy ou ISO
  datePrestation: string;
  echeance: string;
  reglement: string; // Virement bancaire
  status: InvoiceStatus;
  client: Client;
  lines: InvoiceLine[];
  noteFamiliale?: string;
}

export interface InvoiceDocumentData {
  settings: BusinessSettings;
  invoice: Invoice;
}

export const DEFAULT_SETTINGS: BusinessSettings = {
  marque: "EDEN",
  tagline: "Studio créatif · production web & digital",
  spine: "CRÉATIF · WEB · DIGITAL",
  nom: "Adam Beloucif",
  forme: "Entrepreneur Individuel (EI)",
  adresse1: "6 impasse Édouard Vaillant",
  adresse2: "94550 Chevilly-Larue",
  email: "adambeloucif@gmail.com",
  tel: "+33 7 86 46 68 34",
  siren: "En cours d'attribution",
  rcs: "RCS Créteil [n° à compléter]",
  iban: "[IBAN à compléter]",
  bic: "[BIC à compléter]",
  mediateur: "[Médiateur de la consommation : nom + site web]",
  cotisationRate: 0.212,
  versementLiberatoire: false,
  vfrRate: 0.017,
  logoUrl: null,
  colorPrimary: "#14342b",
  colorAccent: "#c8a24b",
  colorInk: "#1a1f1c",
  fontDisplay: "Spectral",
  fontBody: "PT Sans",
};

export const DEFAULT_INVOICE: Invoice = {
  numero: "2026-001",
  dateEmission: new Date().toLocaleDateString("fr-FR"),
  datePrestation: "Juin – juillet 2026",
  echeance: "30 jours à réception",
  reglement: "Virement bancaire",
  status: "draft",
  client: {
    nom: "Nesma Nouar",
    adresse1: "[Adresse du client]",
    adresse2: "",
    email: "nesma.nouar@orange.fr",
    particulier: true,
  },
  lines: [
    {
      titre: "Production visuelle · lancement du single « On ne se taira plus »",
      details: [
        "Lyric video YouTube (16:9)",
        "4 masters verticaux Reels / Shorts / TikTok (9:16)",
        "Déclinaisons feed carré (1:1) et stories",
        "Pochette animée + montage synchronisé des paroles",
      ],
      qte: 1,
      pu: 132,
    },
  ],
  noteFamiliale:
    "Tarif préférentiel accordé dans un cadre familial. Merci pour ta confiance — et belle sortie à Mia-Elya.",
};
