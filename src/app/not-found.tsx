"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Home, ArrowUpRight } from "lucide-react";

const ease = [0.25, 0.1, 0.25, 1] as const;

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16 bg-[#010000] text-[#f5f5f5]">
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
              className="h-24 w-auto drop-shadow-[0_10px_45px_rgba(216,177,114,0.28)] md:h-28"
            />
          </motion.div>
        </motion.div>

        {/* 404 geant */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
          className="mt-4 font-display text-[6rem] font-black leading-none tracking-tighter text-[#d8b172] md:text-[10rem]"
        >
          404
        </motion.h1>

        <motion.h2
          className="mt-4 font-display text-2xl font-bold text-[#f5f5f5] md:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ease }}
        >
          Page introuvable
        </motion.h2>

        <motion.p
          className="mt-4 max-w-md leading-relaxed text-[#9a9488]"
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
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[#d8b172] px-6 py-3 text-sm font-bold text-[#010000] transition-colors hover:bg-[#c39a52]"
          >
            <Home size={18} />
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-full border border-[#2a2622] px-6 py-3 text-sm font-bold text-[#f5f5f5] transition-colors hover:border-[#d8b172] hover:text-[#d8b172]"
          >
            Mon espace
            <ArrowUpRight size={16} />
          </Link>
        </motion.div>

        <motion.p
          className="mt-16 text-xs text-[#6f6a60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          404 Monkey · ta facturation sans bug
        </motion.p>
      </div>
    </main>
  );
}
