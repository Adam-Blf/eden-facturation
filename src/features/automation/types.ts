// Domaine Automation — configuration des envois automatiques

export interface AutomationSettings {
  /** Envoyer la facture au client dès sa validation. */
  autoSendOnIssue: boolean;
  /** Relancer automatiquement les factures à échéance dépassée. */
  autoRelance: boolean;
  /** Délai (en jours) avant la première relance. */
  relanceDelaiJours: number;
  /** Transmettre automatiquement le récap de déclaration anonymisé. */
  autoDeclaration: boolean;
  /** Destinataire du récap de déclaration (ex. comptable). */
  declarationEmail: string;
}

export const DEFAULT_AUTOMATION: AutomationSettings = {
  autoSendOnIssue: false,
  autoRelance: false,
  relanceDelaiJours: 7,
  autoDeclaration: false,
  declarationEmail: "",
};
