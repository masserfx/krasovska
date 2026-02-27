import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hala-krasovska.vercel.app"),
  title: {
    default: "Hala Krasovská — Sportovní hala Plzeň-Bolevec",
    template: "%s | Hala Krasovská",
  },
  description:
    "Sportovní hala Krasovská v Plzni-Bolevci — badminton, florbal, sauna, bistro s vlastní kuchyní, e-shop sportovních potřeb. Krašovská 32.",
  openGraph: {
    type: "website",
    locale: "cs_CZ",
    url: "https://hala-krasovska.vercel.app",
    siteName: "Hala Krasovská",
    title: "Hala Krasovská — Sportovní hala Plzeň-Bolevec",
    description:
      "Sportovní hala Krasovská v Plzni-Bolevci — badminton, florbal, sauna, bistro s vlastní kuchyní, e-shop sportovních potřeb.",
  },
  alternates: {
    canonical: "https://hala-krasovska.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
