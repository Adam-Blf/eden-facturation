// Domaine Clients — type métier

export interface Client {
  id?: string;
  nom: string;
  adresse1: string;
  adresse2: string;
  email: string;
  particulier: boolean; // true => mention médiateur conso obligatoire
}
