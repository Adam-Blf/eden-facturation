"use client";

import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { Download } from "lucide-react";
import { InvoiceDocument } from "@/lib/pdf/InvoiceDocument";
import type { InvoiceDocumentData } from "@/lib/types";

export default function PdfPreview({ data }: { data: InvoiceDocumentData }) {
  const fileName = `Facture_${data.invoice.numero}_${data.settings.marque}.pdf`;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-hair bg-paper px-4 py-3">
        <span className="eyebrow text-xs text-brass">Aperçu</span>
        <PDFDownloadLink
          document={<InvoiceDocument data={data} />}
          fileName={fileName}
          className="inline-flex items-center gap-2 rounded-full bg-brass px-4 py-2 text-xs font-bold text-void transition hover:bg-tan"
        >
          {({ loading }) => (
            <>
              <Download size={14} />
              {loading ? "Préparation…" : "Télécharger le PDF"}
            </>
          )}
        </PDFDownloadLink>
      </div>
      <div className="flex-1 bg-[#33403a]">
        <PDFViewer
          showToolbar={false}
          style={{ width: "100%", height: "100%", border: "none" }}
        >
          <InvoiceDocument data={data} />
        </PDFViewer>
      </div>
    </div>
  );
}
