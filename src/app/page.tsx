import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

const STATUS_CHIPS = [
  { code: "200", label: "Payée", color: "#3fbf6f" },
  { code: "402", label: "À payer", color: "#c9a24a" },
  { code: "404", label: "Introuvable", color: "#e0533d" },
];

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-1 flex-col overflow-hidden bg-void text-bone">
      {/* halo brass diffus */}
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[40rem] w-[40rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #c9a24a 0%, transparent 70%)" }}
      />

      <header className="z-10 flex items-center justify-between px-8 py-6">
        <BrandMark className="text-bone" />
      </header>

      <section className="z-10 flex flex-1 flex-col justify-center px-8 pb-20 md:px-20">
        <h1 className="max-w-4xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight md:text-8xl">
          Tes factures
          <br />
          ne renverront plus
          <br />
          <span className="brush-underline text-brass">d’erreur.</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-bone/70">
          La facturation pour <span className="text-tan">toutes les entreprises</span>, de
          l’auto-entrepreneur à la SAS. Tu choisis ton statut à la création du compte, on adapte
          les mentions légales, la TVA et les cotisations. Tes factures, à ta charte graphique.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-full bg-brass px-6 py-3 font-bold text-void transition hover:bg-tan"
          >
            Créer mon compte
            <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-bone/25 px-6 py-3 font-bold text-bone transition hover:border-brass hover:text-brass"
          >
            Se connecter
          </Link>
        </div>

        {/* signature : les statuts de facture */}
        <div className="mt-14 flex flex-wrap items-center gap-3">
          {STATUS_CHIPS.map((s) => (
            <span
              key={s.code}
              className="inline-flex items-center gap-2 rounded-full border border-bone/15 bg-white/5 px-4 py-2"
            >
              <span className="font-mono text-sm font-bold" style={{ color: s.color }}>
                {s.code}
              </span>
              <span className="text-sm font-medium text-bone/70">{s.label}</span>
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="z-10 flex flex-col md:flex-row items-center justify-between px-8 py-6 border-t border-bone/10 text-sm text-mist">
        <p>© {new Date().getFullYear()} Eden Facturation (404 Monkey). Tous droits réservés.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Link href="/mentions-legales" className="hover:text-brass transition">Mentions Légales</Link>
          <Link href="/rgpd" className="hover:text-brass transition">RGPD & Confidentialité</Link>
        </div>
      </footer>
    </main>
  );
}
