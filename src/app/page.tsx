import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden bg-forest text-white">
      {/* spine echo */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-2 bg-gold/70" />

      <header className="flex items-center justify-between px-8 py-6">
        <span className="font-display text-2xl font-bold tracking-wide">EDEN</span>
        <span className="eyebrow text-[11px] text-gold">Studio créatif · facturation</span>
      </header>

      <section className="flex flex-1 flex-col justify-center px-8 pb-24 md:px-20">
        <p className="eyebrow mb-6 text-xs text-gold">Facturation & comptabilité</p>
        <h1 className="max-w-3xl font-display text-5xl font-bold leading-tight md:text-7xl">
          Des factures qui ont
          <span className="italic text-gold"> du caractère.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-white/70">
          Génère tes factures au design EDEN, suis ton chiffre d’affaires, tes
          cotisations URSSAF et tes seuils micro-entreprise. Conçu pour
          l’auto-entrepreneur exigeant.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-bold text-forest transition hover:bg-white"
          >
            Créer mon compte <ArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-bold text-white transition hover:border-gold hover:text-gold"
          >
            Se connecter
          </Link>
        </div>
      </section>
    </main>
  );
}
