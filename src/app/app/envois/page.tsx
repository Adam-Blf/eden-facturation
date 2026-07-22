import { Send, Save, Check, Mail, Bell, ShieldCheck } from "lucide-react";
import { loadAutomationSettings } from "@/features/automation/data";
import { saveAutomationSettings } from "@/features/automation/actions";

export default async function EnvoisPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const a = await loadAutomationSettings();

  const inputCls =
    "rounded-md border border-paper/10 bg-void px-3 py-2 text-sm text-ink outline-none transition focus:border-brass placeholder:text-mist/50";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="eyebrow text-xs text-brass">Automatisation</p>
      <h1 className="mb-2 font-display text-4xl font-bold text-ink">Envois automatiques</h1>
      <p className="mb-8 max-w-2xl text-sm text-mist">
        Laissez EDEN s&apos;occuper des envois : transmission des factures, relances
        d&apos;échéance et récap de déclaration anonymisé.
      </p>

      {saved && (
        <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-brass/40 bg-brass/10 px-4 py-2 text-sm text-ink">
          <Check size={16} className="text-brass" /> Préférences enregistrées.
        </div>
      )}

      <form action={saveAutomationSettings} className="space-y-4">
        {/* Envoi à la validation */}
        <label className="flex items-start gap-4 rounded-2xl border border-hair bg-paper p-5">
          <Mail size={20} className="mt-0.5 shrink-0 text-brass" />
          <div className="flex-1">
            <div className="font-bold text-ink">Envoyer la facture à la validation</div>
            <p className="text-sm text-mist">
              Dès qu&apos;une facture est validée, elle est envoyée au client avec son
              lien d&apos;acceptation.
            </p>
          </div>
          <input type="checkbox" name="auto_send_on_issue" defaultChecked={a.autoSendOnIssue} className="mt-1 h-5 w-5 accent-brass" />
        </label>

        {/* Relances */}
        <div className="rounded-2xl border border-hair bg-paper p-5">
          <label className="flex items-start gap-4">
            <Bell size={20} className="mt-0.5 shrink-0 text-brass" />
            <div className="flex-1">
              <div className="font-bold text-ink">Relances automatiques</div>
              <p className="text-sm text-mist">
                Relancer le client quand l&apos;échéance est dépassée.
              </p>
            </div>
            <input type="checkbox" name="auto_relance" defaultChecked={a.autoRelance} className="mt-1 h-5 w-5 accent-brass" />
          </label>
          <label className="mt-4 flex items-center gap-3 border-t border-hair pt-4 text-sm text-ink">
            <span className="text-mist">Premier rappel après</span>
            <input
              name="relance_delai_jours"
              type="number"
              min={1}
              defaultValue={a.relanceDelaiJours}
              className={`${inputCls} w-20`}
            />
            <span className="text-mist">jours</span>
          </label>
        </div>

        {/* Déclaration */}
        <div className="rounded-2xl border border-hair bg-paper p-5">
          <label className="flex items-start gap-4">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-brass" />
            <div className="flex-1">
              <div className="font-bold text-ink">Transmettre le récap de déclaration</div>
              <p className="text-sm text-mist">
                Envoyer automatiquement le livre des recettes <strong className="text-ink">anonymisé</strong>{" "}
                (URSSAF / TVA / impôts) au destinataire ci-dessous.
              </p>
            </div>
            <input type="checkbox" name="auto_declaration" defaultChecked={a.autoDeclaration} className="mt-1 h-5 w-5 accent-brass" />
          </label>
          <label className="mt-4 block border-t border-hair pt-4">
            <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-mist">
              Destinataire du récap (ex. comptable)
            </span>
            <input
              name="declaration_email"
              type="email"
              defaultValue={a.declarationEmail}
              placeholder="comptable@exemple.fr"
              className={`${inputCls} w-full`}
            />
          </label>
        </div>

        <button type="submit" className="btn-primary px-5 py-2.5 text-sm">
          <Save size={15} /> Enregistrer
        </button>
      </form>

      <p className="mt-6 flex items-center gap-2 text-xs text-mist">
        <Send size={13} /> Les envois s&apos;appuient sur l&apos;adresse d&apos;envoi configurée côté Eden.
      </p>
    </div>
  );
}
