"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AuthFormProps {
  mode: "login" | "signup";
}

const ease = [0.25, 0.1, 0.25, 1] as const;

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        router.push("/app");
        router.refresh();
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: location.origin + "/auth/callback",
            data: { full_name: fullName },
          },
        });
        if (authError) throw authError;
        if (data.session) {
          router.push("/app");
          router.refresh();
        } else {
          setEmailSent(true);
        }
      }
    } catch (err: unknown) {
      const raw =
        err instanceof Error ? err.message : "Une erreur est survenue.";
      // Translate common Supabase error messages to French
      const message = raw.includes("Invalid login credentials")
        ? "Identifiants incorrects. Vérifie ton e-mail et mot de passe."
        : raw.includes("Email not confirmed")
          ? "Ton e-mail n'a pas encore été confirmé. Consulte ta boite de réception."
          : raw.includes("User already registered")
            ? "Un compte existe déjà avec cet e-mail."
            : raw.includes("Password should be at least")
              ? "Le mot de passe doit contenir au moins 6 caractères."
              : raw;
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  /* ---- Email confirmation screen ---- */
  if (emailSent) {
    return (
      <motion.div
        key="email-sent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
        className="flex flex-col items-center gap-5 py-4 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold">
          <MailCheck size={26} strokeWidth={1.5} />
        </span>
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-2xl font-bold text-ink">
            Vérifie tes mails
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-mist">
            Un lien de confirmation a été envoyé à{" "}
            <span className="font-semibold text-ink">{email}</span>. Clique
            dessus pour activer ton compte EDEN.
          </p>
        </div>
        <Link
          href="/login"
          className="mt-2 text-xs font-semibold tracking-wide text-gold underline-offset-2 hover:underline"
        >
          Retour à la connexion
        </Link>
      </motion.div>
    );
  }

  /* ---- Main form ---- */
  return (
    <motion.form
      key="form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-6"
      noValidate
    >
      {/* Heading */}
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-[1.75rem] font-bold leading-tight text-ink">
          {mode === "login" ? "Connexion" : "Créer un compte"}
        </h2>
        <p className="text-sm text-mist">
          {mode === "login"
            ? "Retrouve tes factures et ta comptabilité."
            : "Lance ton studio de facturation en 30 secondes."}
        </p>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {mode === "signup" && (
            <motion.div
              key="fullname"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease }}
              className="overflow-hidden"
            >
              <Field
                id="fullName"
                label="Nom complet"
                type="text"
                autoComplete="name"
                placeholder="Marie Dupont"
                value={fullName}
                onChange={(v) => setFullName(v)}
                required
              />
            </motion.div>
          )}
        </AnimatePresence>

        <Field
          id="email"
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          placeholder="marie@studio.fr"
          value={email}
          onChange={(v) => setEmail(v)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="eyebrow text-[11px] text-mist"
          >
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              placeholder={mode === "signup" ? "Min. 6 caractères" : "••••••••"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-hair bg-bone px-4 py-3 pr-11 text-sm text-ink placeholder:text-mist/60 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={
                showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mist transition hover:text-ink"
            >
              {showPassword ? (
                <EyeOff size={16} strokeWidth={1.75} />
              ) : (
                <Eye size={16} strokeWidth={1.75} />
              )}
            </button>
          </div>
          {mode === "signup" && (
            <p className="text-[11px] text-mist/70">
              Au moins 6 caractères. Choisis un mot de passe sûr.
            </p>
          )}
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gold px-6 py-3.5 font-bold text-forest transition-all hover:bg-forest hover:text-gold disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            {mode === "login" ? "Se connecter" : "Créer mon compte"}
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </>
        )}
      </button>

      {/* Switch mode */}
      <p className="text-center text-sm text-mist">
        {mode === "login" ? (
          <>
            Pas encore de compte ?{" "}
            <Link
              href="/signup"
              className="font-semibold text-gold underline-offset-2 hover:underline"
            >
              S'inscrire
            </Link>
          </>
        ) : (
          <>
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-semibold text-gold underline-offset-2 hover:underline"
            >
              Se connecter
            </Link>
          </>
        )}
      </p>
    </motion.form>
  );
}

/* ---- Reusable text/email field ---- */
interface FieldProps {
  id: string;
  label: string;
  type: "text" | "email";
  autoComplete: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

function Field({
  id,
  label,
  type,
  autoComplete,
  placeholder,
  value,
  onChange,
  required,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="eyebrow text-[11px] text-mist">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-hair bg-bone px-4 py-3 text-sm text-ink placeholder:text-mist/60 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
      />
    </div>
  );
}
