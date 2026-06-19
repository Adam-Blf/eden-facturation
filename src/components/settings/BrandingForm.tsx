"use client";

import { useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Upload, Trash2, Save, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { saveSettings } from "@/app/app/parametres/actions";
import { DEFAULT_INVOICE, type BusinessSettings } from "@/lib/types";

const PdfPreview = dynamic(() => import("@/components/PdfPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-void text-sm text-mist">
      Aperçu…
    </div>
  ),
});

function Field({
  label,
  value,
  onChange,
  full,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
  placeholder?: string;
}) {
  return (
    <label className={`block ${full ? "col-span-2" : ""}`}>
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-paper/10 bg-void px-3 py-2 text-sm text-ink outline-none transition focus:border-brass"
      />
    </label>
  );
}

const FORMES_JURIDIQUES = [
  "Auto-entrepreneur (Micro-entreprise)",
  "Entrepreneur Individuel (EI)",
  "EURL",
  "SARL",
  "SASU",
  "SAS",
  "SA",
  "SNC",
  "SCI",
  "Profession libérale",
  "Association (loi 1901)",
];

function SelectField({
  label,
  value,
  onChange,
  options,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  full?: boolean;
}) {
  const opts = !value || options.includes(value) ? options : [value, ...options];
  return (
    <label className={`block ${full ? "col-span-2" : ""}`}>
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-paper/10 bg-void px-3 py-2 text-sm text-ink outline-none transition focus:border-brass"
      >
        {opts.map((o) => (
          <option key={o} value={o} className="bg-void text-ink">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-md border border-paper/10 bg-void px-2 py-1.5 focus-within:border-brass">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent font-mono text-xs text-ink outline-none"
        />
      </div>
    </label>
  );
}

export default function BrandingForm({
  initial,
  userId,
}: {
  initial: BusinessSettings;
  userId: string;
}) {
  const [s, setS] = useState<BusinessSettings>(initial);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const set = <K extends keyof BusinessSettings>(k: K, v: BusinessSettings[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  async function onLogo(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Choisis une image (PNG, JPG, SVG).");
      return;
    }
    setUploading(true);
    const path = `${userId}/logo`;
    const { error } = await supabase.storage
      .from("branding")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      toast.error("Échec de l'upload : " + error.message);
    } else {
      const url = supabase.storage.from("branding").getPublicUrl(path).data.publicUrl;
      set("logoUrl", `${url}?v=${Date.now()}`);
      toast.success("Logo importé.");
    }
    setUploading(false);
  }

  function save() {
    startTransition(async () => {
      const res = await saveSettings(s);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Infos enregistrées.");
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr]">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-h-screen overflow-y-auto px-6 py-8 pb-32"
      >
        <p className="code-badge mb-2 text-[10px]">PARAMS_ENTREPRISE</p>
        <h1 className="mb-8 font-display text-3xl font-bold text-ink">
          Informations & Identité
        </h1>

        {/* LOGO */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between border-b border-paper/10 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brass">Logo</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-md border border-paper/10 bg-paper/5">
              {s.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.logoUrl} alt="logo" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-xs text-mist">Aucun logo</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-md bg-paper/10 px-4 py-2 text-xs font-bold text-ink transition hover:bg-paper/20 disabled:opacity-60"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Importer
              </button>
              {s.logoUrl && (
                <button
                  onClick={() => set("logoUrl", null)}
                  className="inline-flex items-center gap-1 text-xs text-mist transition hover:text-[#b3261e]"    
                >
                  <Trash2 size={13} /> Retirer
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => e.target.files?.[0] && onLogo(e.target.files[0])}
            />
          </div>
        </section>

        {/* COULEURS */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between border-b border-paper/10 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brass">Couleurs de la facture</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ColorField label="Primaire" value={s.colorPrimary} onChange={(v) => set("colorPrimary", v)} />       
            <ColorField label="Accent" value={s.colorAccent} onChange={(v) => set("colorAccent", v)} />
            <ColorField label="Texte" value={s.colorInk} onChange={(v) => set("colorInk", v)} />
          </div>
        </section>

        {/* IDENTITE */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between border-b border-paper/10 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brass">Mon Entreprise</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nom Commercial / Marque" placeholder="Ex: Studio 404" value={s.marque} onChange={(v) => set("marque", v)} />
            <Field label="Prénom Nom" placeholder="Ex: Adam Beloucif" value={s.nom} onChange={(v) => set("nom", v)} />
            <Field label="Tagline (Slogan)" value={s.tagline} onChange={(v) => set("tagline", v)} full />
            <Field label="Texte latéral (Spine)" value={s.spine} onChange={(v) => set("spine", v)} />
            <SelectField label="Forme juridique" value={s.forme} onChange={(v) => set("forme", v)} options={FORMES_JURIDIQUES} />
            <Field label="Adresse postale" value={s.adresse1} onChange={(v) => set("adresse1", v)} />
            <Field label="Code postal · ville" value={s.adresse2} onChange={(v) => set("adresse2", v)} />        
            <Field label="Téléphone" value={s.tel} onChange={(v) => set("tel", v)} />
            <Field label="Email professionnel" value={s.email} onChange={(v) => set("email", v)} />
            <Field label="SIREN / SIRET" value={s.siren} onChange={(v) => set("siren", v)} />
            <Field label="Mention RCS" value={s.rcs} onChange={(v) => set("rcs", v)} />
            <Field label="IBAN" value={s.iban} onChange={(v) => set("iban", v)} />
            <Field label="BIC" value={s.bic} onChange={(v) => set("bic", v)} />
            <Field label="Médiateur de la consommation (obligatoire B2C)" value={s.mediateur} onChange={(v) => set("mediateur", v)} full />     
          </div>
        </section>

        {/* COMPTA */}
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between border-b border-paper/10 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brass">Régime Social</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">
                Taux cotisations URSSAF (%)
              </span>
              <input
                type="number"
                step="0.001"
                value={s.cotisationRate}
                onChange={(e) => set("cotisationRate", parseFloat(e.target.value) || 0)}
                className="w-full rounded-md border border-paper/10 bg-void px-3 py-2 text-sm text-ink outline-none focus:border-brass"
              />
            </label>
            <label className="col-span-2 flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={s.versementLiberatoire}
                onChange={(e) => set("versementLiberatoire", e.target.checked)}
                className="accent-brass"
              />
              Versement fiscal libératoire activé
            </label>
          </div>
        </section>

        <div className="mt-8 flex justify-end border-t border-paper/10 pt-4">
          <button
            onClick={save}
            disabled={pending}
            className="btn-primary w-full md:w-auto"
          >
            {pending ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? "Enregistré" : "Sauvegarder les informations"}
          </button>
        </div>
      </motion.div>

      <div className="sticky top-0 hidden h-screen flex-col border-l border-paper/10 lg:flex">
        <div className="flex-1 bg-white/5">
          <PdfPreview data={{ settings: s, invoice: DEFAULT_INVOICE }} />
        </div>
      </div>
    </div>
  );
}
