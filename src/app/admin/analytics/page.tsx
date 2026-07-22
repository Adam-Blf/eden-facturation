import { createClient } from "@/shared/supabase/server";

export const metadata = {
  title: "Analytics Admin | 404 Monkey",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // Pour des statistiques simples, on pourrait récupérer le nombre d'utilisateurs
  // ou le nombre de factures si c'est autorisé.
  // Exemple fictif car les requêtes dépendent de RLS:
  
  // const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
  // const { count: invoicesCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true });

  return (
    <div className="p-8">
      <h1 className="font-display text-3xl font-bold text-ink mb-8">Analytics Globales</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-hair shadow-sm">
          <p className="text-mist text-sm font-semibold mb-2">Utilisateurs Inscrits</p>
          <p className="text-4xl font-bold text-ink">--</p>
          <p className="text-xs text-mist mt-2">À implémenter avec un accès bypass RLS</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-hair shadow-sm">
          <p className="text-mist text-sm font-semibold mb-2">Factures Générées</p>
          <p className="text-4xl font-bold text-ink">--</p>
          <p className="text-xs text-mist mt-2">À implémenter avec un accès bypass RLS</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-hair shadow-sm">
          <p className="text-mist text-sm font-semibold mb-2">Chiffre d'Affaires Global</p>
          <p className="text-4xl font-bold text-ink">-- €</p>
          <p className="text-xs text-mist mt-2">À implémenter avec un accès bypass RLS</p>
        </div>
      </div>
      
      <div className="mt-12 bg-white p-6 rounded-xl border border-hair shadow-sm">
        <h2 className="font-display text-xl font-bold mb-4">Activité récente</h2>
        <p className="text-mist text-sm">Le flux des activités globales apparaîtra ici.</p>
      </div>
    </div>
  );
}