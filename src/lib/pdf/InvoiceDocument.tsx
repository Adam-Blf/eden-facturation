import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import type { InvoiceDocumentData } from "@/lib/types";
import { invoiceTotalHT } from "@/lib/compta";
import { formatEUR } from "@/lib/format";
import { registerPdfFonts } from "./fonts";

registerPdfFonts();

const C = {
  forest: "#14342b",
  moss: "#3e5c4b",
  gold: "#c8a24b",
  ink: "#1a1f1c",
  mist: "#8a968f",
  hair: "#e0e4e0",
  paper: "#ffffff",
};

const SPINE_W = 46;

const s = StyleSheet.create({
  page: {
    fontFamily: "PT Sans",
    fontSize: 9,
    color: C.ink,
    paddingTop: 50,
    paddingBottom: 64,
    paddingLeft: SPINE_W + 30,
    paddingRight: 44,
    position: "relative",
  },
  spine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: SPINE_W,
    backgroundColor: C.forest,
  },
  spineRule: {
    position: "absolute",
    left: SPINE_W - 1.5,
    top: 50,
    bottom: 50,
    width: 0.8,
    backgroundColor: C.gold,
  },
  wordmark: {
    position: "absolute",
    top: 560,
    left: -77,
    width: 200,
    textAlign: "center",
    transform: "rotate(-90deg)",
    color: C.paper,
    fontFamily: "Spectral",
    fontWeight: 700,
    fontSize: 24,
    letterSpacing: 6,
  },
  spineLabel: {
    position: "absolute",
    top: 250,
    left: -90,
    width: 220,
    textAlign: "center",
    transform: "rotate(-90deg)",
    color: C.gold,
    fontFamily: "PT Sans",
    fontWeight: 700,
    fontSize: 6.5,
    letterSpacing: 2,
  },
  headRow: { flexDirection: "row", justifyContent: "space-between" },
  title: {
    fontFamily: "Spectral",
    fontWeight: 700,
    fontSize: 40,
    color: C.forest,
  },
  metaBlock: { width: 200, marginTop: 4 },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 2 },
  metaLabel: {
    color: C.mist,
    fontSize: 7.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginRight: 8,
    marginTop: 1.5,
  },
  metaValue: { fontFamily: "IBM Plex Mono", fontSize: 8.5, color: C.ink },
  goldRule: { height: 1.2, backgroundColor: C.gold, marginTop: 14, marginBottom: 18 },
  hair: { height: 0.6, backgroundColor: C.hair },
  eyebrow: {
    fontFamily: "PT Sans",
    fontWeight: 700,
    fontSize: 7.5,
    letterSpacing: 2,
    color: C.moss,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  partiesRow: { flexDirection: "row" },
  col: { flex: 1, paddingRight: 16 },
  partyName: { fontFamily: "Spectral", fontWeight: 700, fontSize: 13, color: C.ink },
  tagline: { fontFamily: "Spectral", fontStyle: "italic", fontSize: 9, color: C.moss, marginBottom: 2 },
  partyLine: { color: "#46504a", fontSize: 8.5, marginBottom: 1.5 },
  section: { marginTop: 22 },
  lineTitle: { fontFamily: "Spectral", fontSize: 12.5, color: C.ink, flex: 1, paddingRight: 10 },
  linePrice: { fontFamily: "IBM Plex Mono", fontSize: 10, color: C.forest },
  detail: { flexDirection: "row", marginTop: 3.5, marginLeft: 4 },
  detailDot: { color: C.gold, fontSize: 8.5, marginRight: 5 },
  detailText: { color: C.mist, fontSize: 8.5 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 26 },
  reglement: { width: 230 },
  payRow: { flexDirection: "row", marginBottom: 3 },
  payLabel: { color: C.mist, fontSize: 8, width: 34 },
  payValue: { fontFamily: "IBM Plex Mono", fontSize: 8.5, color: C.ink },
  totals: { width: 210 },
  totalLine: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  totalLabel: { color: C.mist, fontSize: 9 },
  totalVal: { fontFamily: "IBM Plex Mono", fontSize: 9, color: C.ink },
  netBlock: { backgroundColor: C.forest, padding: 12, marginTop: 8 },
  netLabel: { color: C.gold, fontFamily: "PT Sans", fontWeight: 700, fontSize: 7.5, letterSpacing: 2 },
  netAmount: { color: C.paper, fontFamily: "Spectral", fontWeight: 700, fontSize: 22, textAlign: "right", marginTop: 2 },
  note: { fontFamily: "Spectral", fontStyle: "italic", fontSize: 9.5, color: C.moss, marginTop: 28, maxWidth: 360 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: SPINE_W + 30,
    right: 44,
  },
  footerRule: { height: 0.8, backgroundColor: C.gold, marginBottom: 5 },
  footerText: { color: C.mist, fontSize: 6.4, textAlign: "center", lineHeight: 1.4 },
});

function spaced(str: string) {
  return str.split("").join(" ");
}

export function InvoiceDocument({ data }: { data: InvoiceDocumentData }) {
  const { settings: st, invoice: inv } = data;
  const total = invoiceTotalHT(inv);

  const meta: [string, string][] = [
    ["Nº", inv.numero],
    ["Émise le", inv.dateEmission],
    ["Prestation", inv.datePrestation],
    ["Échéance", inv.echeance],
  ];

  let mentions =
    `${st.forme}. TVA non applicable, article 293 B du CGI (franchise en base). ` +
    "Tout retard de paiement entraîne des pénalités au taux de 3 fois l'intérêt légal, exigibles sans rappel, " +
    "et une indemnité forfaitaire de recouvrement de 40 € (art. L441-10 et D441-5 du Code de commerce). " +
    "Pas d'escompte pour paiement anticipé.";
  if (inv.client.particulier) {
    mentions +=
      " En cas de litige, le client consommateur peut recourir gratuitement au médiateur de la consommation : " +
      `${st.mediateur} (art. L616-1 du Code de la consommation).`;
  }

  return (
    <Document title={`Facture ${inv.numero} — ${st.marque}`} author={st.nom}>
      <Page size="A4" style={s.page}>
        {/* signature : spine */}
        <View style={s.spine} fixed />
        <View style={s.spineRule} fixed />
        <Text style={s.wordmark} fixed>
          {spaced(st.marque)}
        </Text>
        <Text style={s.spineLabel} fixed>
          {st.spine}
        </Text>

        {/* titre + meta */}
        <View style={s.headRow}>
          <Text style={s.title}>Facture</Text>
          <View style={s.metaBlock}>
            {meta.map(([label, value]) => (
              <View style={s.metaRow} key={label}>
                <Text style={s.metaLabel}>{label}</Text>
                <Text style={s.metaValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={s.goldRule} />

        {/* parties */}
        <View style={s.partiesRow}>
          <View style={s.col}>
            <Text style={s.eyebrow}>Émetteur</Text>
            <Text style={s.partyName}>
              {st.marque} — {st.nom}
            </Text>
            <Text style={s.tagline}>{st.tagline}</Text>
            {[st.forme, st.adresse1, st.adresse2, st.tel, st.email, `SIREN · ${st.siren}`, st.rcs]
              .filter(Boolean)
              .map((l, i) => (
                <Text style={s.partyLine} key={i}>
                  {l}
                </Text>
              ))}
          </View>
          <View style={s.col}>
            <Text style={s.eyebrow}>Facturé à</Text>
            <Text style={s.partyName}>{inv.client.nom}</Text>
            {[inv.client.adresse1, inv.client.adresse2, inv.client.email]
              .filter(Boolean)
              .map((l, i) => (
                <Text style={s.partyLine} key={i}>
                  {l}
                </Text>
              ))}
          </View>
        </View>

        {/* prestation */}
        <View style={s.section}>
          <Text style={s.eyebrow}>Prestation</Text>
          <View style={s.hair} />
          {inv.lines.map((line, i) => (
            <View key={i} style={{ marginTop: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={s.lineTitle}>{line.titre}</Text>
                <Text style={s.linePrice}>
                  {line.qte} × {formatEUR(line.pu)}
                </Text>
              </View>
              {line.details.filter(Boolean).map((d, j) => (
                <View key={j} style={s.detail}>
                  <Text style={s.detailDot}>·</Text>
                  <Text style={s.detailText}>{d}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* règlement + totaux */}
        <View style={s.bottomRow}>
          <View style={s.reglement}>
            <Text style={s.eyebrow}>Règlement</Text>
            {[
              ["Mode", inv.reglement],
              ["IBAN", st.iban],
              ["BIC", st.bic],
            ].map(([label, value]) => (
              <View style={s.payRow} key={label}>
                <Text style={s.payLabel}>{label}</Text>
                <Text style={s.payValue}>{value}</Text>
              </View>
            ))}
          </View>
          <View style={s.totals}>
            <View style={s.totalLine}>
              <Text style={s.totalLabel}>Total HT</Text>
              <Text style={s.totalVal}>{formatEUR(total)}</Text>
            </View>
            <View style={s.totalLine}>
              <Text style={s.totalLabel}>TVA (0 %)</Text>
              <Text style={s.totalVal}>—</Text>
            </View>
            <View style={s.netBlock}>
              <Text style={s.netLabel}>{spaced("NET À PAYER")}</Text>
              <Text style={s.netAmount}>{formatEUR(total)}</Text>
            </View>
          </View>
        </View>

        {inv.noteFamiliale ? <Text style={s.note}>{inv.noteFamiliale}</Text> : null}

        {/* mentions légales */}
        <View style={s.footer} fixed>
          <View style={s.footerRule} />
          <Text style={s.footerText}>{mentions}</Text>
        </View>
      </Page>
    </Document>
  );
}
