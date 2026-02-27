import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Teambuilding Plzeň — Sportovní akce pro firmy",
  description:
    "Teambuilding v Plzni — badminton, florbal, volejbal pro firemní týmy. Catering z vlastního bistra, sauna, celé zázemí pod jednou střechou. Krašovská 32.",
  openGraph: {
    title: "Teambuilding Plzeň — Hala Krasovská",
    description:
      "Firemní sportovní akce v Plzni. Badminton, florbal, catering, sauna. Kapacita až 100 osob.",
    url: "https://hala-krasovska.vercel.app/teambuilding",
  },
  alternates: { canonical: "/teambuilding" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Teambuilding — Hala Krasovská",
  description: "Sportovní teambuilding pro firmy v Plzni-Bolevci",
  url: "https://hala-krasovska.vercel.app/teambuilding",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Krašovská 32",
    addressLocality: "Plzeň",
    postalCode: "323 00",
    addressCountry: "CZ",
  },
};

export default function TeambuildingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-primary px-4 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-4 text-4xl font-bold">
            Teambuilding v Plzni — Sport, catering i relaxace
          </h1>
          <p className="max-w-2xl text-lg text-white/80">
            Organizujte firemní sportovní akce v Hale Krasovská. Badminton,
            florbal, volejbal, catering z vlastního bistra a sauna — vše
            pod jednou střechou.
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-2xl font-bold text-foreground">
            Co nabízíme pro firmy
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Sport",
                items: [
                  "9 badmintonových kurtů",
                  "Víceúčelová plocha 40x20m",
                  "Florbal, volejbal, futsal",
                  "Vybavení k zapůjčení",
                ],
              },
              {
                title: "Catering",
                items: [
                  "Bistro s vlastní kuchyní",
                  "Balíček Standard — 169 Kč/os",
                  "Balíček Premium — 229 Kč/os",
                  "Čepovaný Plzeňský Prazdroj",
                ],
              },
              {
                title: "Zázemí",
                items: [
                  "Sauna pro relaxaci",
                  "Šatny a sprchy",
                  "Parkování zdarma",
                  "Kapacita až 100 osob",
                ],
              },
            ].map((block) => (
              <div
                key={block.title}
                className="rounded-xl border border-border bg-white p-6"
              >
                <h3 className="mb-4 text-lg font-bold text-foreground">
                  {block.title}
                </h3>
                <ul className="space-y-2 text-sm text-foreground">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Cenové balíčky pro teambuilding
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border p-6">
              <h3 className="mb-1 text-lg font-bold text-foreground">
                Standard
              </h3>
              <p className="mb-4 text-3xl font-bold text-primary">
                169 Kč<span className="text-base font-normal text-muted">/osoba</span>
              </p>
              <ul className="space-y-2 text-sm text-foreground">
                <li>Polévka dne</li>
                <li>Hlavní jídlo (výběr ze 2 variant)</li>
                <li>Nápoj 0,5l (voda/limo)</li>
              </ul>
            </div>
            <div className="rounded-xl border-2 border-primary p-6">
              <h3 className="mb-1 text-lg font-bold text-foreground">
                Premium
              </h3>
              <p className="mb-4 text-3xl font-bold text-primary">
                229 Kč<span className="text-base font-normal text-muted">/osoba</span>
              </p>
              <ul className="space-y-2 text-sm text-foreground">
                <li>Polévka dne</li>
                <li>Hlavní jídlo (výběr ze 3 variant, vč. vege)</li>
                <li>Dezert</li>
                <li>Nápoj 0,5l</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted">
            Minimální objednávka 20 osob. Objednávka 5 pracovních dnů předem.
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Naplánujte teambuilding
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted">
            Kontaktujte nás a připravíme nabídku na míru vašemu týmu.
          </p>
          <a
            href="mailto:recepce@halakrasovska.cz?subject=Teambuilding - poptávka"
            className="inline-block rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Nezávazná poptávka
          </a>
        </div>
      </section>
    </>
  );
}
