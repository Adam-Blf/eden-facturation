"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Home, ArrowUpRight } from "lucide-react";

const ease = [0.25, 0.1, 0.25, 1] as const;

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-void px-6 text-ink">
      {/* grille brass */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#d8b172 1px, transparent 1px), linear-gradient(90deg, #d8b172 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(circle at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 30%, transparent 75%)",
        }}
      />

      {/* halo pulsant */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[34rem] w-[34rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, #d8b172 0%, transparent 70%)" }}
        animate={{ opacity: [0.08, 0.16, 0.08], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* logo flottant */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/logo.svg"
              alt="404 Monkey"
              width={150}
              height={150}
              priority
              className="h-28 w-auto drop-shadow-[0_10px_45px_rgba(216,177,114,0.28)] md:h-32"
            />
          </motion.div>
        </motion.div>

        {/* 404 geant glitch */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
          className="relative mt-4 font-display text-[6rem] font-black leading-none tracking-tighter text-brass md:text-[11rem]"
        >
          404
          <motion.span
            aria-hidden
            className="absolute inset-0 text-tan mix-blend-screen"
            animate={{ x: [0, 2, -2, 0], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            404
          </motion.span>
        </motion.h1>

        <motion.p
          className="eyebrow mt-2 text-brass"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Erreur 404
        </motion.p>

        <motion.h2
          className="mt-2 font-display text-2xl font-bold uppercase tracking-[0.15em] text-ink md:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, ease }}
        >
          Page introuvable
        </motion.h2>

        <motion.p
          className="mt-4 max-w-md leading-relaxed text-mist"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42, ease }}
        >
          Même le singe le plus agile peut se perdre. Cette page n&apos;existe pas, ou
          s&apos;est échappée dans une autre dimension.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ease }}
        >
          <Link href="/" className="btn-primary group">
            <Home size={18} />
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-full border border-hair px-6 py-3 text-sm font-bold text-ink transition-colors hover:border-brass hover:text-brass"
          >
            Mon espace
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>

      <footer className="absolute bottom-8 code-badge text-[10px] opacity-40">
        error_code: [PAGE_NOT_FOUND] // 404_monkey_engine
      </footer>
    </main>
  );
}
