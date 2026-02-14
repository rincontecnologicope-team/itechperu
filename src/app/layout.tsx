import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { InstallAppPrompt } from "@/components/pwa/install-app-prompt";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "iTech Peru | Tecnologia importada de USA",
    template: "%s | iTech Peru",
  },
  description: siteConfig.description,
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "iTech Peru",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "es_PE",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "iTech Peru - Tecnologia importada de USA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "iTech Peru",
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: [
      { url: "/brand/itech-mark.svg", type: "image/svg+xml" },
      { url: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: [{ url: "/brand/itech-mark.svg", type: "image/svg+xml" }],
    apple: [{ url: "/pwa/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-PE">
      <body className={`${manrope.variable} ${spaceGrotesk.variable}`}>
        {children}
        <InstallAppPrompt />
      </body>
    </html>
  );
}
