// Domaine Facturation — libellés & couleurs des statuts de facture

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
