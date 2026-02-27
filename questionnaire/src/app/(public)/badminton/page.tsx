import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Badminton Plzeň — 9 kurtů",
  description:
    "Badminton v Plzni-Bolevci — 9 profesionálních kurtů, osvětlení 500 lux, zázemí se sprchami a saunou. Turnaje, tréninky, pronájem. Krašovská 32.",
  openGraph: {
    title: "Badminton Plzeň — 9 kurtů v Hale Krasovská",
    description:
      "9 profesionálních badmintonových kurtů v Plzni. Osvětlení 500 lux, sprchy, sauna, bistro. Rezervujte si kurt.",
    url: "https://hala-krasovska.vercel.app/badminton",
  },
  alternates: { canonical: "/badminton" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Badminton — Hala Krasovská",
  description: "9 profesionálních badmintonových kurtů v Plzni-Bolevci",
  sport: "Badminton",
  url: "https://hala-krasovska.vercel.app/badminton",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Krašovská 32",
    addressLocality: "Plzeň",
    postalCode: "323 00",
    addressCountry: "CZ",
  },
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "9 badmintonových kurtů", value: true },
    { "@type": "LocationFeatureSpecification", name: "Osvětlení 500 lux", value: true },
    { "@type": "LocationFeatureSpecification", name: "Sprchy a šatny", value: true },
    { "@type": "LocationFeatureSpecification", name: "Sauna", value: true },
    { "@type": "LocationFeatureSpecification", name: "Bistro", value: true },
    { "@type": "LocationFeatureSpecification", name: "Parkování zdarma", value: true },
  ],
};

export default function BadmintonPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-primary px-4 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-4 text-4xl font-bold">
            Badminton v Plzni — 9 profesionálních kurtů
          </h1>
          <p className="max-w-2xl text-lg text-white/80">
            Největší badmintonové centrum v Plzeňském kraji. Hala Krasovská
            nabízí 9 kurtů s osvětlením 500 lux, kompletním zázemím a bistrem
            přímo v areálu.
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Vybavení a zázemí
            </h2>
            <ul className="space-y-3 text-foreground">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span><strong>9 badmintonových kurtů</strong> s certifikovaným povrchem</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span><strong>Osvětlení 500 lux</strong> — turnajový standard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span><strong>Sprchy a šatny</strong> — oddělené pro muže a ženy</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span><strong>Sauna</strong> — relaxace po tréninku</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span><strong>Parkování zdarma</strong> — přímo u haly</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Ceník badmintonu
            </h2>
            <div className="rounded-xl border border-border bg-white p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="pb-2">Doba</th>
                    <th className="pb-2">Cena/kurt/h</th>
                  </tr>
                </thead>
                <tbody className="text-foreground">
                  <tr className="border-b border-border">
                    <td className="py-2">Po-Pá 6:00-15:00</td>
                    <td className="py-2 font-semibold">180 Kč</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-2">Po-Pá 15:00-22:00</td>
                    <td className="py-2 font-semibold">260 Kč</td>
                  </tr>
                  <tr>
                    <td className="py-2">So-Ne, svátky</td>
                    <td className="py-2 font-semibold">220 Kč</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-3 text-xs text-muted">
                Permanentky a skupinové slevy na recepci.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Badmintonové turnaje v Plzni
          </h2>
          <p className="mb-6 max-w-3xl text-foreground">
            Pravidelně pořádáme turnaje pro všechny úrovně — od rekreačních hráčů
            po registrované závodníky. 9 kurtů umožňuje turnaje až pro 64 hráčů
            s profesionálním zázemím a cateringem z našeho bistra.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/pronajem-haly"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Pronájem pro turnaj
            </Link>
            <Link
              href="/bistro-krasovska"
              className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-background"
            >
              Catering pro turnaje
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Kde nás najdete
          </h2>
          <div className="rounded-xl border border-border bg-white p-6">
            <p className="mb-2 text-foreground">
              <strong>Hala Krasovská</strong>
            </p>
            <p className="text-muted">Krašovská 32, 323 00 Plzeň-Bolevec</p>
            <p className="mt-2 text-sm text-muted">
              Snadno dostupná MHD (zastávka Bolevec) i autem (parkování zdarma).
              5 minut od Boleveckého rybníka.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
