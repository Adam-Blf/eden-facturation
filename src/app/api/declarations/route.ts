import { createClient } from "@/shared/supabase/server";
import { loadDeclarationInvoices } from "@/features/declarations/data";
import { anonymizeInvoices } from "@/features/declarations/anonymize";
import {
  toLivreRecettesCSV,
  declarationFileName,
} from "@/features/declarations/export";
import { INVOICE_STATUS_LABELS } from "@/features/invoicing/status";

/**
 * Export du livre des recettes anonymisé pour les déclarations
 * (URSSAF / TVA / impôts). Les clients sont pseudonymisés.
 * GET /api/declarations?year=2026
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Non authentifié", { status: 401 });

  const yearParam = new URL(request.url).searchParams.get("year");
  const year = Number(yearParam) || new Date().getFullYear();

  const invoices = await loadDeclarationInvoices(year);
  const rows = anonymizeInvoices(invoices);
  const csv = toLivreRecettesCSV(rows, INVOICE_STATUS_LABELS);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${declarationFileName(year)}"`,
      "Cache-Control": "no-store",
    },
  });
}
