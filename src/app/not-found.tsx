import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-void text-bone px-6">
      {/* background halo */}
      <div
        className="pointer-events-none absolute h-[30rem] w-[30rem] rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle, #d8b172 0%, transparent 70%)" }}
      />

      <div className="z-10 flex flex-col items-center text-center">
        <BrandMark className="mb-12" />
        
        <h1 className="font-display text-7xl md:text-9xl font-black text-brass mb-4">
          404
        </h1>
        
        <h2 className="text-xl md:text-2xl font-bold text-ink mb-8 uppercase tracking-[0.2em]">
          Page Introuvable
        </h2>
        
        <p className="max-w-md text-mist mb-12 leading-relaxed">
          Même le singe le plus agile peut se perdre. Cette page n'existe pas ou a été déplacée dans une autre dimension.
        </p>

        <Link
          href="/"
          className="btn-primary group flex items-center gap-2"
        >
          <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Retour à la base
        </Link>
      </div>

      <footer className="absolute bottom-8 text-[10px] code-badge opacity-40">
        error_code: [PAGE_NOT_FOUND] // 404_monkey_engine
      </footer>
    </main>
  );
}
