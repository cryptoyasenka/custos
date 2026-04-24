import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://custos-nox-production.up.railway.app";
const description =
  "Open-source real-time attack monitor for Solana multisigs and DAOs. Detects 3 of the 4 on-chain vectors used to drain $285M from Drift on April 1, 2026. Self-host, MIT licensed.";

export const metadata: Metadata = {
  title: "Custos Nox — Real-time attack monitor for Solana multisigs",
  description,
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Custos Nox — Real-time attack monitor for Solana multisigs",
    description,
    url: siteUrl,
    siteName: "Custos Nox",
    images: [{ url: "/logo.png", width: 1024, height: 1024, alt: "Custos Nox" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Custos Nox",
    description,
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
