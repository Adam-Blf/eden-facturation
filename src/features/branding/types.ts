// Domaine Branding / Émetteur — identité de l'entreprise & charte graphique

export interface BusinessSettings {
  marque: string; // EDEN
  tagline: string; // Studio créatif, production web & digital
  spine: string; // CRÉATIF / WEB / DIGITAL
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

export const DEFAULT_SETTINGS: BusinessSettings = {
  marque: "Mon entreprise",
  tagline: "",
  spine: "FACTURE",
  nom: "",
  forme: "Entrepreneur Individuel (EI)",
  adresse1: "",
  adresse2: "",
  email: "",
  tel: "",
  siren: "",
  rcs: "",
  iban: "",
  bic: "",
  mediateur: "",
  cotisationRate: 0.212,
  versementLiberatoire: false,
  vfrRate: 0.017,
  logoUrl: null,
  colorPrimary: "#0b0b0c",
  colorAccent: "#c9a24a",
  colorInk: "#141414",
  fontDisplay: "Spectral",
  fontBody: "PT Sans",
};
