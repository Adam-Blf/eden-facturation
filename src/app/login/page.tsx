import AuthForm from "@/components/AuthForm";
import { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export const metadata: Metadata = {
  title: "Connexion · 404 Monkey",
  description: "Connecte-toi à 404 Monkey, ta facturation sans bug.",
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
        <Link href="/" className="text-white">
          <BrandMark className="text-white" />
        </Link>
      </div>

      {/* Center: headline */}
      <div className="flex flex-col gap-4 py-10 md:py-0">
        <h1 className="font-display text-4xl font-extrabold leading-tight text-white lg:text-5xl">
          Tes factures ne renverront plus
          <span className="brush-underline text-brass"> d’erreur.</span>
        </h1>
        <p className="max-w-xs text-sm leading-relaxed text-white/60">
          De l’auto-entrepreneur à la SAS. Mentions légales, TVA et cotisations
          adaptées à ton statut, factures à ta charte graphique.
        </p>
      </div>

      {/* Bottom: feature bullets */}
      <ul className="hidden flex-col gap-3 md:flex">
        {[
          "Tous statuts : EI, EURL, SARL, SAS…",
          "Factures à ta charte (logo + couleurs)",
          "Compta, URSSAF & seuils inclus",
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
