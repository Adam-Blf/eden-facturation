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
    <div className="flex h-full items-center justify-center bg-[#33403a] text-sm text-white/60">
      Aperçu…
    </div>
  ),
});

function Field({
  label,
  value,
  onChange,
  full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "col-span-2" : ""}`}>
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-mist">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-hair bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-forest"
      />
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
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-mist">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-lg border border-hair bg-paper px-2 py-1.5">
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
        toast.success("Charte enregistrée.");
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
        className="max-h-[calc(100vh)] overflow-y-auto px-6 py-8"
      >
        <p className="eyebrow text-xs text-moss">Branding</p>
        <h1 className="mb-6 font-display text-3xl font-bold text-forest">
          Charte graphique & infos
        </h1>

        {/* LOGO */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold text-ink">Logo</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-32 items-center justify-center overflow-hidden rounded-lg border border-hair bg-paper">
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
                className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-xs font-bold text-white transition hover:bg-moss disabled:opacity-60"
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
          <h2 className="mb-3 text-sm font-bold text-ink">Couleurs</h2>
          <div className="grid grid-cols-3 gap-3">
            <ColorField label="Primaire" value={s.colorPrimary} onChange={(v) => set("colorPrimary", v)} />
            <ColorField label="Accent" value={s.colorAccent} onChange={(v) => set("colorAccent", v)} />
            <ColorField label="Texte" value={s.colorInk} onChange={(v) => set("colorInk", v)} />
          </div>
        </section>

        {/* IDENTITE */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold text-ink">Identité émetteur</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Marque" value={s.marque} onChange={(v) => set("marque", v)} />
            <Field label="Nom" value={s.nom} onChange={(v) => set("nom", v)} />
            <Field label="Tagline" value={s.tagline} onChange={(v) => set("tagline", v)} full />
            <Field label="Spine (tranche)" value={s.spine} onChange={(v) => set("spine", v)} />
            <Field label="Forme juridique" value={s.forme} onChange={(v) => set("forme", v)} />
            <Field label="Adresse" value={s.adresse1} onChange={(v) => set("adresse1", v)} />
            <Field label="Code postal · ville" value={s.adresse2} onChange={(v) => set("adresse2", v)} />
            <Field label="Téléphone" value={s.tel} onChange={(v) => set("tel", v)} />
            <Field label="Email" value={s.email} onChange={(v) => set("email", v)} />
            <Field label="SIREN" value={s.siren} onChange={(v) => set("siren", v)} />
            <Field label="Mention RCS" value={s.rcs} onChange={(v) => set("rcs", v)} />
            <Field label="IBAN" value={s.iban} onChange={(v) => set("iban", v)} />
            <Field label="BIC" value={s.bic} onChange={(v) => set("bic", v)} />
            <Field label="Médiateur conso" value={s.mediateur} onChange={(v) => set("mediateur", v)} full />
          </div>
        </section>

        {/* COMPTA */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold text-ink">Régime social</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-mist">
                Taux cotisations URSSAF
              </span>
              <input
                type="number"
                step="0.001"
                value={s.cotisationRate}
                onChange={(e) => set("cotisationRate", parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-hair bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-forest"
              />
            </label>
            <label className="col-span-2 flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={s.versementLiberatoire}
                onChange={(e) => set("versementLiberatoire", e.target.checked)}
              />
              Versement fiscal libératoire activé
            </label>
          </div>
        </section>

        <button
          onClick={save}
          disabled={pending}
          className="sticky bottom-4 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-bold text-forest shadow-lg transition hover:bg-forest hover:text-white disabled:opacity-60"
        >
          {pending ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "Enregistré" : "Enregistrer la charte"}
        </button>
      </motion.div>

      <div className="sticky top-0 hidden h-screen flex-col border-l border-hair lg:flex">
        <div className="border-b border-hair bg-paper px-4 py-3">
          <span className="eyebrow text-xs text-moss">Aperçu dans ta DA</span>
        </div>
        <div className="flex-1">
          <PdfPreview data={{ settings: s, invoice: DEFAULT_INVOICE }} />
        </div>
      </div>
    </div>
  );
}
