"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Building2, Users, ArrowRight, Loader2, Upload, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { completeOnboarding, type ProfileType } from "@/app/bienvenue/actions";

const ease = [0.25, 0.1, 0.25, 1] as const;

const CHOICES: {
  key: ProfileType;
  icon: typeof Building2;
  title: string;
  desc: string;
  badge: string;
}[] = [
  {
    key: "entreprise",
    icon: Building2,
    title: "Entreprise / Freelance",
    desc: "Auto-entrepreneur, EURL, SARL, SAS. Facturation pro, plans selon le nombre de clients.",
    badge: "Plans dès 9 € / mois",
  },
  {
    key: "asso",
    icon: Users,
    title: "Association loi 1901",
    desc: "Gratuit pour les associations déclarées. Un justificatif est demandé (numéro RNA + récépissé).",
    badge: "Gratuit",
  },
];

export default function OnboardingFlow({ userId }: { userId: string }) {
  const [choice, setChoice] = useState<ProfileType | null>(null);
  const [rna, setRna] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  function finish(profileType: ProfileType, extra?: { rna: string; assoProofUrl: string }) {
    startTransition(async () => {
      const res = await completeOnboarding({ profileType, ...extra });
      if (res?.error) setError(res.error);
    });
  }

  function submitAsso() {
    setError(null);
    if (!/^W\d{9}$/i.test(rna.trim())) {
      setError("Numéro RNA invalide (format attendu : W suivi de 9 chiffres).");
      return;
    }
    if (!file) {
      setError("Joins un justificatif (récépissé, statuts, ou publication JOAFE).");
      return;
    }
    startTransition(async () => {
      const path = `${userId}/${crypto.randomUUID()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("asso-proofs").upload(path, file);
      if (upErr) {
        setError("Échec de l'envoi du justificatif : " + upErr.message);
        return;
      }
      const res = await completeOnboarding({ profileType: "asso", rna: rna.trim(), assoProofUrl: path });
      if (res?.error) setError(res.error);
    });
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#010000] px-6 py-16 text-[#f5f5f5]">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[34rem] w-[34rem] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, #d8b172 0%, transparent 70%)" }}
        animate={{ opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 w-full max-w-3xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <Image src="/logo.svg" alt="404 Monkey" width={90} height={90} priority className="h-16 w-auto" />
          <h1 className="mt-6 font-display text-3xl font-black md:text-4xl">Bienvenue sur 404 Monkey</h1>
          <p className="mt-2 text-[#9a9488]">Dis-nous qui tu es, on adapte ton espace.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {CHOICES.map((c, i) => {
            const active = choice === c.key;
            return (
              <motion.button
                key={c.key}
                onClick={() => {
                  setChoice(c.key);
                  setError(null);
                }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, ease }}
                className={`flex flex-col rounded-2xl border p-5 text-left transition ${
                  active
                    ? "border-[#d8b172] bg-[#d8b172]/10"
                    : "border-[#2a2622] bg-white/[0.02] hover:border-[#d8b172]/50"
                }`}
              >
                <c.icon size={22} className="text-[#d8b172]" />
                <span className="mt-3 font-display text-lg font-bold">{c.title}</span>
                <span className="mt-1 text-xs leading-relaxed text-[#9a9488]">{c.desc}</span>
                <span className="mt-3 inline-block w-fit rounded-full bg-[#d8b172]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d8b172]">
                  {c.badge}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* panneau contextuel */}
        {choice === "asso" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-[#2a2622] bg-white/[0.02] p-6"
          >
            <h2 className="font-display text-lg font-bold">Justificatif association</h2>
            <p className="mt-1 text-sm text-[#9a9488]">
              Accès gratuit immédiat. Nous vérifions les justificatifs a posteriori.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#9a9488]">
                  Numéro RNA
                </span>
                <input
                  value={rna}
                  onChange={(e) => setRna(e.target.value.toUpperCase())}
                  placeholder="W123456789"
                  className="w-full rounded-md border border-[#2a2622] bg-[#010000] px-3 py-2 text-sm outline-none transition focus:border-[#d8b172]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#9a9488]">
                  Justificatif (PDF ou image)
                </span>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex w-full items-center gap-2 rounded-md border border-[#2a2622] bg-[#010000] px-3 py-2 text-sm text-[#9a9488] transition hover:border-[#d8b172]"
                >
                  {file ? <Check size={15} className="text-[#d8b172]" /> : <Upload size={15} />}
                  <span className="truncate">{file ? file.name : "Choisir un fichier"}</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </motion.div>
        )}

        {error && (
          <p className="mt-4 rounded-md border border-red-900 bg-red-950/20 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {choice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex justify-end">
            <button
              onClick={() => (choice === "asso" ? submitAsso() : finish(choice))}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-[#d8b172] px-6 py-3 text-sm font-bold text-[#010000] transition hover:bg-[#c39a52] disabled:opacity-60"
            >
              {pending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              Continuer
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
