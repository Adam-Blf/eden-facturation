import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Mentions Légales | 404 Monkey",
  description: "Mentions légales du service Eden Facturation (404 Monkey).",
};

export default function MentionsLegales() {
  return (
    <main className="min-h-screen bg-void text-bone px-8 py-16 md:px-20">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-mist hover:text-brass transition mb-10">
          <ArrowLeft size={16} />
          Retour à l'accueil
        </Link>
        <h1 className="font-display text-4xl font-bold mb-8">Mentions Légales</h1>
        
        <section className="space-y-8 text-bone/80">
          <div>
            <h2 className="text-xl font-bold text-bone mb-3">1. Éditeur du site</h2>
            <p>
              Le site <strong>Eden Facturation (404 Monkey)</strong> est édité par Adam Beloucif.
              <br />
              Email : adambeloucif@gmail.com
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-bone mb-3">2. Hébergement</h2>
            <p>
              Ce site est hébergé par Vercel Inc.
              <br />
              340 S Lemon Ave #4133
              <br />
              Walnut, CA 91789, USA
              <br />
              Site web : https://vercel.com
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-bone mb-3">3. Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu (textes, images, code) est la propriété exclusive de l'éditeur du site.
              Toute reproduction est strictement interdite sans accord préalable.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-bone mb-3">4. Données personnelles</h2>
            <p>
              Veuillez consulter notre <Link href="/rgpd" className="text-brass hover:underline">Politique de Confidentialité (RGPD)</Link> pour en savoir plus sur le traitement de vos données.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}