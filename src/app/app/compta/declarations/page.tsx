import Link from "next/link";
import { ShieldCheck, ChevronRight, Download } from "lucide-react";
import { loadDeclarationYears } from "@/features/declarations/data";
import { formatEUR } from "@/shared/format";

export default async function DeclarationsHistoryPage() {
  const years = await loadDeclarationYears();
  const currentYear = new Date().getFullYear();
  // L'année courante figure toujours, même sans facture encore émise.
  if (!years.some((y) => y.year === currentYear)) {
    years.unshift({ year: currentYear, count: 0, totalHT: 0 });
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <p className="eyebrow text-xs text-brass">Comptabilité</p>
      <h1 className="mb-2 font-display text-4xl font-bold text-ink">Déclarations</h1>
      <p className="mb-8 max-w-2xl text-sm text-mist">
        Vos récaps de recettes pour les déclarations URSSAF, TVA et impôts.
        Les clients sont <strong className="text-ink">anonymisés</strong> : vous
        transmettez vos chiffres sans exposer de données personnelles.
      </p>

      <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brass">
        <ShieldCheck size={16} /> Historique par exercice
      </div>

      <div className="overflow-hidden rounded-2xl border border-hair bg-void">
        {years.map((y) => (
          <div
            key={y.year}
            className="flex items-center justify-between border-b border-hair px-6 py-5 last:border-0 hover:bg-paper/5"
          >
            <Link href={`/app/compta/declarations/${y.year}`} className="flex items-center gap-4 group">
              <span className="font-display text-2xl font-bold text-ink group-hover:text-brass">{y.year}</span>
              <span className="text-sm text-mist">
                {y.count} facture{y.count > 1 ? "s" : ""} · {formatEUR(y.totalHT)}
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <a
                href={`/api/declarations?year=${y.year}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-hair px-3 py-1.5 text-xs font-bold text-mist hover:border-brass hover:text-ink"
                title="Télécharger le récap anonymisé (CSV)"
              >
                <Download size={14} /> CSV
              </a>
              <Link href={`/app/compta/declarations/${y.year}`} className="text-mist hover:text-brass">
                <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
