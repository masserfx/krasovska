import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sauna Plzeň — Finská sauna po sportu",
  description:
    "Finská sauna v Plzni-Bolevci — relaxace po sportu, teplota 80-100°C, sprchy, odpočívárna. Ideální po badmintonu nebo florbalu. Krašovská 32.",
  openGraph: {
    title: "Sauna Plzeň — Hala Krasovská",
    description:
      "Finská sauna přímo ve sportovní hale. Relaxace po tréninku, teplota 80-100°C, sprchy a odpočívárna.",
    url: "https://hala-krasovska.vercel.app/sauna",
  },
  alternates: { canonical: "/sauna" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Sauna — Hala Krasovská",
  description: "Finská sauna ve sportovní hale v Plzni-Bolevci",
  url: "https://hala-krasovska.vercel.app/sauna",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Krašovská 32",
    addressLocality: "Plzeň",
    postalCode: "323 00",
    addressCountry: "CZ",
  },
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Finská sauna", value: true },
    { "@type": "LocationFeatureSpecification", name: "Sprchy", value: true },
    { "@type": "LocationFeatureSpecification", name: "Odpočívárna", value: true },
  ],
};

export default function SaunaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-primary px-4 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-4 text-4xl font-bold">
            Sauna v Plzni — Relaxace po sportu
          </h1>
          <p className="max-w-2xl text-lg text-white/80">
            Finská sauna přímo ve sportovní hale Krasovská.
            Ideální regenerace po badmintonu, florbalu nebo posilovně.
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Parametry sauny
            </h2>
            <ul className="space-y-3 text-foreground">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span><strong>Finská sauna</strong> — teplota 80-100°C</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span><strong>Kapacita</strong> — pohodlné místo pro 8-10 osob</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span><strong>Sprchy</strong> — studená i teplá voda, ochlazovací bazének</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span><strong>Odpočívárna</strong> — lehátka, pitný režim</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">Ceník</h2>
            <div className="rounded-xl border border-border bg-white p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="pb-2">Vstup</th>
                    <th className="pb-2">Cena</th>
                  </tr>
                </thead>
                <tbody className="text-foreground">
                  <tr className="border-b border-border">
                    <td className="py-2">Jednorázový vstup (2 hodiny)</td>
                    <td className="py-2 font-semibold">150 Kč</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2">Ke kurtu badmintonu</td>
                    <td className="py-2 font-semibold">100 Kč</td>
                  </tr>
                  <tr>
                    <td className="py-2">Privátní pronájem (1h)</td>
                    <td className="py-2 font-semibold">500 Kč</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-3 text-xs text-muted">
                Ceny jsou orientační. Aktuální ceník na recepci.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Kombinujte sport a relaxaci
          </h2>
          <p className="mb-6 max-w-3xl text-muted">
            Zahrajte si badminton, zrelaxujte v sauně a posilněte se v našem
            bistru. Vše pod jednou střechou.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/badminton"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Badminton
            </Link>
            <Link
              href="/bistro-krasovska"
              className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-background"
            >
              Bistro menu
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
