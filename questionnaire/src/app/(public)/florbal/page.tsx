import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Florbal Plzeň — Víceúčelová plocha 40x20m | Hala Krasovská",
  description:
    "Florbal v Plzni-Bolevci — víceúčelová plocha 40x20m pro florbal, volejbal a futsal. Mantinely, zázemí, sauna. Pronájem pro týmy a ligy. Krašovská 32.",
  openGraph: {
    title: "Florbal Plzeň — Hala Krasovská",
    description:
      "Víceúčelová plocha 40x20m pro florbal, volejbal a futsal. Mantinely, sprchy, sauna. Pronájem pro týmy.",
    url: "https://hala-krasovska.vercel.app/florbal",
  },
  alternates: { canonical: "/florbal" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Florbal — Hala Krasovská",
  description: "Víceúčelová plocha 40x20m pro florbal v Plzni-Bolevci",
  sport: "Floorball",
  url: "https://hala-krasovska.vercel.app/florbal",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Krašovská 32",
    addressLocality: "Plzeň",
    postalCode: "323 00",
    addressCountry: "CZ",
  },
};

export default function FlorbalPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-primary px-4 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-4 text-4xl font-bold">
            Florbal v Plzni — Víceúčelová plocha 40x20m
          </h1>
          <p className="max-w-2xl text-lg text-white/80">
            Hala Krasovská nabízí víceúčelovou plochu o rozměrech 40x20 metrů
            vhodnou pro florbal, volejbal, futsal a další halové sporty.
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Parametry plochy
            </h2>
            <ul className="space-y-3 text-foreground">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span><strong>Rozměry 40 x 20 m</strong> — oficiální rozměr pro florbal</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span><strong>Mantinely</strong> — k dispozici pro florbalové zápasy</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span><strong>Osvětlení</strong> — vhodné pro zápasy i tréninky</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span><strong>Tribuna</strong> — místa pro diváky</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                <span><strong>Kompletní zázemí</strong> — šatny, sprchy, sauna</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Vhodné pro
            </h2>
            <div className="space-y-3">
              {[
                { sport: "Florbal", desc: "Tréninky, ligy, turnaje — mantinely k dispozici" },
                { sport: "Volejbal", desc: "Rekreační i soutěžní — síť a lajnování" },
                { sport: "Futsal", desc: "Pronájem pro týmy a malé turnaje" },
                { sport: "Teambuilding", desc: "Sportovní akce pro firmy" },
              ].map((item) => (
                <div
                  key={item.sport}
                  className="rounded-lg border border-border bg-white p-4"
                >
                  <h3 className="font-semibold text-foreground">{item.sport}</h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Pronájem víceúčelové plochy
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted">
            Pravidelné tréninky, jednorázové akce i ligové zápasy.
            Kontaktujte nás pro individuální nabídku.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/pronajem-haly"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Zjistit ceny pronájmu
            </Link>
            <Link
              href="/teambuilding"
              className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-background"
            >
              Teambuilding nabídka
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
