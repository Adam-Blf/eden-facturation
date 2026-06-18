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
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const supabase = createClient();

  async function handleOAuth(provider: "google" | "linkedin_oidc") {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: (process.env.NEXT_PUBLIC_APP_URL || location.origin) + "/auth/callback",
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Erreur connexion sociale.";
      setError(raw);
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "signup" && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

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
            emailRedirectTo: (process.env.NEXT_PUBLIC_APP_URL || location.origin) + "/auth/callback",
            data: { 
              first_name: firstName,
              last_name: lastName,
              phone: phone,
              full_name: `${firstName} ${lastName}`.trim()
            },
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
      const raw = err instanceof Error ? err.message : "Une erreur est survenue.";
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
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brass/15 text-brass">
          <MailCheck size={26} strokeWidth={1.5} />
        </span>
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-2xl font-bold text-ink">
            Vérifie tes mails
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-mist">
            Un lien de confirmation a été envoyé à{" "}
            <span className="font-semibold text-ink">{email}</span>. Clique
            dessus pour activer ton compte 404 Monkey.
          </p>
        </div>
        <Link
          href="/login"
          className="mt-2 text-xs font-semibold tracking-wide text-brass underline-offset-2 hover:underline"
        >
          Retour à la connexion
        </Link>
      </motion.div>
    );
  }

  /* ---- Main form ---- */
  return (
    <motion.div
      key="container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease }}
      className="flex w-full flex-col gap-6"
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

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-md border border-paper/10 bg-void px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-paper/5 disabled:opacity-60"
        >
          <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
            <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
            <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
            <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
          </svg>
          Continuer avec Google
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("linkedin_oidc")}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-md border border-paper/10 bg-[#0A66C2] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#004182] disabled:opacity-60"
        >
          <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          Continuer avec LinkedIn
        </button>
      </div>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-paper/10"></div>
        <span className="mx-4 flex-shrink-0 text-xs text-mist">ou avec e-mail</span>
        <div className="flex-grow border-t border-paper/10"></div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <AnimatePresence initial={false}>
          {mode === "signup" && (
            <motion.div
              key="fullname"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease }}
              className="overflow-hidden flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <Field
                  id="firstName"
                  label="Prénom"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Marie"
                  value={firstName}
                  onChange={(v) => setFirstName(v)}
                  required
                />
                <Field
                  id="lastName"
                  label="Nom"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Dupont"
                  value={lastName}
                  onChange={(v) => setLastName(v)}
                  required
                />
              </div>
              <Field
                id="phone"
                label="Téléphone"
                type="tel"
                autoComplete="tel"
                placeholder="+33 6 12 34 56 78"
                value={phone}
                onChange={(v) => setPhone(v)}
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
            className="text-[10px] font-bold uppercase tracking-widest text-mist"
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
              className="w-full rounded-md border border-paper/10 bg-void px-3 py-2 pr-10 text-sm text-ink outline-none transition focus:border-brass"
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

        <AnimatePresence initial={false}>
          {mode === "signup" && (
            <motion.div
              key="confirm-password"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease }}
              className="overflow-hidden flex flex-col gap-1.5"
            >
              <label
                htmlFor="confirmPassword"
                className="text-[10px] font-bold uppercase tracking-widest text-mist"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-md border border-paper/10 bg-void px-3 py-2 text-sm text-ink outline-none transition focus:border-brass"
              />
            </motion.div>
          )}
        </AnimatePresence>

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
              className="rounded-md border border-red-900 bg-red-950/20 px-4 py-3 text-sm text-red-500 mt-2"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-4 w-full"
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
      </form>

      {/* Switch mode */}
      <p className="text-center text-sm text-mist">
        {mode === "login" ? (
          <>
            Pas encore de compte ?{" "}
            <Link
              href="/signup"
              className="font-semibold text-brass hover:underline"
            >
              S'inscrire
            </Link>
          </>
        ) : (
          <>
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-semibold text-brass hover:underline"
            >
              Se connecter
            </Link>
          </>
        )}
      </p>
    </motion.div>
  );
}

/* ---- Reusable text/email field ---- */
interface FieldProps {
  id: string;
  label: string;
  type: "text" | "email" | "tel";
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
      <label htmlFor={id} className="text-[10px] font-bold uppercase tracking-widest text-mist">
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
        className="w-full rounded-md border border-paper/10 bg-void px-3 py-2 text-sm text-ink outline-none transition focus:border-brass"
      />
    </div>
  );
}
