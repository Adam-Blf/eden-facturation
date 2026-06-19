// Domaine Facturation — types métier de la facture

import type { Client } from "@/features/clients/types";
import type { BusinessSettings } from "@/features/branding/types";

export type InvoiceStatus =
  | "draft"
  | "issued"
  | "sent"
  | "accepted"
  | "paid"
  | "overdue"
  | "cancelled";

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

export const DEFAULT_INVOICE: Invoice = {
  numero: "",
  dateEmission: new Date().toLocaleDateString("fr-FR"),
  datePrestation: "",
  echeance: "30 jours à réception",
  reglement: "Virement bancaire",
  status: "draft",
  client: {
    nom: "",
    adresse1: "",
    adresse2: "",
    email: "",
    particulier: true,
  },
  lines: [
    {
      titre: "",
      details: [],
      qte: 1,
      pu: 0,
    },
  ],
  noteFamiliale: "",
};
