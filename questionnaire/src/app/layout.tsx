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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Hala Krasovská",
  description:
    "Sportovní hala v Plzni-Bolevci — 9 badmintonových kurtů, víceúčelová plocha, cvičební sál, sauna, bistro a e-shop.",
  url: "https://hala-krasovska.vercel.app",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Krašovská 32",
    addressLocality: "Plzeň",
    addressRegion: "Plzeňský kraj",
    postalCode: "323 00",
    addressCountry: "CZ",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 49.7647,
    longitude: 13.3667,
  },
  email: "recepce@halakrasovska.cz",
  sameAs: ["https://www.facebook.com/halakrasovska"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <h1 className="sr-only">Hala Krasovská — Sportovní hala Plzeň-Bolevec</h1>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
