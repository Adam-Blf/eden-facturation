import AuthForm from "@/components/AuthForm";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Connexion · EDEN",
  description: "Connecte-toi à ton studio de facturation EDEN.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* ---- Left brand panel ---- */}
      <BrandPanel />

      {/* ---- Right form panel ---- */}
      <section className="flex flex-1 flex-col items-center justify-center bg-paper px-6 py-12 md:px-12 lg:px-20">
        <div className="w-full max-w-sm">
          <AuthForm mode="login" />
        </div>
      </section>
    </main>
  );
}

function BrandPanel() {
  return (
    <aside className="relative flex flex-col justify-between overflow-hidden bg-forest px-8 py-10 md:w-[420px] md:px-12 md:py-16 lg:w-[480px]">
      {/* Gold spine */}
      <div className="absolute left-0 top-0 h-full w-1.5 bg-gold/70" />

      {/* Top: wordmark */}
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="font-display text-3xl font-bold tracking-wide text-white"
        >
          EDEN
        </Link>
        <p className="eyebrow text-[11px] text-gold">
          Studio de facturation
        </p>
      </div>

      {/* Center: headline */}
      <div className="flex flex-col gap-4 py-10 md:py-0">
        <h1 className="font-display text-4xl font-bold leading-tight text-white lg:text-5xl">
          Des factures qui ont
          <span className="italic text-gold"> du caractère.</span>
        </h1>
        <p className="max-w-xs text-sm leading-relaxed text-white/60">
          Génère tes factures au design EDEN, suis ton chiffre d'affaires,
          tes cotisations URSSAF et tes seuils micro-entreprise.
        </p>
      </div>

      {/* Bottom: feature bullets */}
      <ul className="hidden flex-col gap-3 md:flex">
        {[
          "Factures PDF haute définition",
          "Suivi CA et seuils TVA",
          "Calcul URSSAF automatique",
        ].map((item) => (
          <li key={item} className="flex items-center gap-3 text-sm text-white/70">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            {item}
          </li>
        ))}
      </ul>
    </aside>
  );
}
