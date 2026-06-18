import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de Confidentialité (RGPD) | 404 Monkey",
  description: "Notre engagement pour la protection de vos données.",
};

export default function RgpdPage() {
  return (
    <main className="min-h-screen bg-void text-bone px-8 py-16 md:px-20">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-mist hover:text-brass transition mb-10">
          <ArrowLeft size={16} />
          Retour à l'accueil
        </Link>
        <h1 className="font-display text-4xl font-bold mb-8">Politique de Confidentialité (RGPD)</h1>
        
        <section className="space-y-8 text-bone/80">
          <div>
            <h2 className="text-xl font-bold text-bone mb-3">1. Collecte des données</h2>
            <p>
              Dans le cadre de l'utilisation de nos services de facturation, nous collectons les données suivantes :
              nom, prénom, adresse email, informations de facturation (SIRET, adresse postale), et mots de passe (hachés et sécurisés via Supabase).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-bone mb-3">2. Finalité du traitement</h2>
            <p>
              Ces données sont strictement nécessaires pour :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>La création et la gestion de votre compte.</li>
              <li>L'édition et l'envoi de vos factures.</li>
              <li>L'amélioration de nos services et la sécurité du système.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-bone mb-3">3. Vos droits</h2>
            <p>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de portabilité, d'effacement de vos données, ainsi que d'un droit d'opposition au traitement.
              Pour exercer ces droits, veuillez contacter : <strong>adambeloucif@gmail.com</strong>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-bone mb-3">4. Cookies</h2>
            <p>
              Ce site utilise des cookies de session strictement nécessaires au bon fonctionnement de l'authentification. 
              Nous utilisons également des outils d'analyse anonymisés pour mesurer l'audience sans traquer de données personnellement identifiables.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}