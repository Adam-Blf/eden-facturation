import AuthForm from "@/components/AuthForm";
import { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

export const metadata: Metadata = {
  title: "Inscription a 404 Monkey",
  description: "Crée ton compte 404 Monkey et facture sans bug.",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* ---- Left brand panel ---- */}
      <BrandPanel />

      {/* ---- Right form panel ---- */}
      <section className="flex flex-1 flex-col items-center justify-center bg-paper px-6 py-12 md:px-12 lg:px-20">
        <div className="w-full max-w-sm">
          <AuthForm mode="signup" />
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
          Crée ton compte,
          <span className="brush-underline text-brass"> facture sans bug.</span>
        </h1>
        <p className="max-w-xs text-sm leading-relaxed text-white/60">
          Gratuit, sans carte. Tu choisis ton statut d’entreprise, on règle les
          mentions légales et la TVA pour toi.
        </p>
      </div>

      {/* Bottom: feature bullets */}
      <ul className="hidden flex-col gap-3 md:flex">
        {[
          "Inscription en 30 secondes",
          "Tous statuts d’entreprise",
          "Première facture offerte",
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
