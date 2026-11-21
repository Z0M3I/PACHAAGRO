import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "PACHAAGRO · Conectando al productor con la información",
    template: "%s · PACHAAGRO",
  },
  description:
    "Plataforma boliviana de comunicación y educación agrícola: alertas climáticas, anuncios comunitarios, reuniones y guías de cultivo por WhatsApp y web.",
  applicationName: "PACHAAGRO",
  keywords: [
    "agricultura Bolivia",
    "alertas climáticas",
    "WhatsApp agricultores",
    "educación agrícola",
    "PACHAAGRO",
  ],
  authors: [{ name: "Equipo PACHAAGRO" }],
  openGraph: {
    title: "PACHAAGRO",
    description:
      "Conectando al productor con la información que necesita. Alertas, anuncios y educación agrícola para toda Bolivia.",
    type: "website",
    locale: "es_BO",
    siteName: "PACHAAGRO",
  },
  twitter: {
    card: "summary_large_image",
    title: "PACHAAGRO",
    description:
      "Comunicación y educación agrícola para productores de Bolivia.",
  },
  icons: {
    icon: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#145A32",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${sans.variable} ${display.variable}`}>
      <body>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-pacha-900"
        >
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
