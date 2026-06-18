import { Font } from "@react-pdf/renderer";

let registered = false;

/**
 * Enregistre les polices OFL (servies depuis /public/fonts) pour le rendu PDF.
 * Spectral (display serif) · PT Sans (corps) · IBM Plex Mono (data).
 */
export function registerPdfFonts() {
  if (registered) return;
  registered = true;

  Font.register({
    family: "Spectral",
    fonts: [
      { src: "/fonts/Spectral-Regular.ttf", fontWeight: 400 },
      { src: "/fonts/Spectral-SemiBold.ttf", fontWeight: 600 },
      { src: "/fonts/Spectral-Bold.ttf", fontWeight: 700 },
      { src: "/fonts/Spectral-Italic.ttf", fontStyle: "italic" },
    ],
  });

  Font.register({
    family: "PT Sans",
    fonts: [
      { src: "/fonts/PTSans-Regular.ttf", fontWeight: 400 },
      { src: "/fonts/PTSans-Bold.ttf", fontWeight: 700 },
      { src: "/fonts/PTSans-Italic.ttf", fontStyle: "italic" },
    ],
  });

  Font.register({
    family: "IBM Plex Mono",
    fonts: [
      { src: "/fonts/IBMPlexMono-Regular.ttf", fontWeight: 400 },
      { src: "/fonts/IBMPlexMono-Medium.ttf", fontWeight: 500 },
    ],
  });

  // pas de césure automatique dans les libellés
  Font.registerHyphenationCallback((word) => [word]);
}
