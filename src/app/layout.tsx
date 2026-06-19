import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Space_Grotesk, DM_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import "./tokens.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const sans = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

// DM Mono : chiffres a zero plein (pas de point ni slash dans le 0)
const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "404 Monkey, facturation sans bug",
  description: "La facturation pour toutes les entreprises, de l'auto-entrepreneur à la SAS. Factures à ta charte graphique, suivi compta, acceptation client. Par 404 Monkey.",
  keywords: ["facturation", "devis", "freelance", "comptabilité", "entreprise", "404 monkey"],
  authors: [{ name: "Adam Beloucif" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://facturation.404monkey.com",
    title: "404 Monkey, facturation sans bug",
    description: "La facturation pour toutes les entreprises, de l'auto-entrepreneur à la SAS.",
    siteName: "404 Monkey",
  },
  twitter: {
    card: "summary_large_image",
    title: "404 Monkey, facturation",
    description: "Factures à ta charte graphique, suivi compta, acceptation client.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
