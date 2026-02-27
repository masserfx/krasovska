import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bistro Krasovská — Burgery, Pizza, Denní menu",
  description:
    "Bistro v Plzni-Bolevci — burgery z českého hovězího od 139 Kč, pizza z vlastního těsta, denní menu od 149 Kč. Čepovaný Prazdroj z tanku. Krašovská 32.",
  openGraph: {
    title: "Bistro Krasovská — Burgery, Pizza, Denní menu",
    description:
      "Sportovní bistro v Bolevci. Čerstvé suroviny, žádné polotovary. Burgery, pizza, denní menu, protein bowly.",
    url: "https://hala-krasovska.vercel.app/bistro-krasovska",
  },
  alternates: { canonical: "/bistro-krasovska" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Bistro Hala Krasovská",
  description:
    "Sportovní bistro v Plzni-Bolevci — autorské burgery, pizza z vlastního těsta, denní menu, protein bowly. Žádné polotovary, čerstvé suroviny.",
  url: "https://hala-krasovska.vercel.app/bistro-krasovska",
  servesCuisine: ["Česká", "Mezinárodní"],
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Krašovská 32",
    addressLocality: "Plzeň",
    addressRegion: "Plzeňský kraj",
    postalCode: "323 00",
    addressCountry: "CZ",
  },
  hasMenu: {
    "@type": "Menu",
    hasMenuSection: [
      {
        "@type": "MenuSection",
        name: "Burgery",
        hasMenuItem: [
          { "@type": "MenuItem", name: "Smash burger", offers: { "@type": "Offer", price: "139", priceCurrency: "CZK" } },
          { "@type": "MenuItem", name: "Burger s karamelizovanou cibulkou", offers: { "@type": "Offer", price: "159", priceCurrency: "CZK" } },
          { "@type": "MenuItem", name: "BBQ bacon burger", offers: { "@type": "Offer", price: "179", priceCurrency: "CZK" } },
        ],
      },
      {
        "@type": "MenuSection",
        name: "Pizza",
        hasMenuItem: [
          { "@type": "MenuItem", name: "Margherita", offers: { "@type": "Offer", price: "129", priceCurrency: "CZK" } },
          { "@type": "MenuItem", name: "Šunková", offers: { "@type": "Offer", price: "149", priceCurrency: "CZK" } },
          { "@type": "MenuItem", name: "Diavola", offers: { "@type": "Offer", price: "159", priceCurrency: "CZK" } },
        ],
      },
    ],
  },
};

export default function BistroPubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-primary px-4 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-4 text-4xl font-bold">
            Bistro Krasovská — Burgery, Pizza, Denní menu
          </h1>
          <p className="max-w-2xl text-lg text-white/80">
            Sportovní bistro v Plzni-Bolevci. Vaříme z čerstvých surovin,
            žádné polotovary. Autorské burgery, pizza z vlastního těsta,
            protein bowly a čepovaný Plzeňský Prazdroj přímo z tanku.
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-2xl font-bold text-foreground">Menu</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Burgery",
                price: "139-189 Kč",
                items: [
                  "5 autorských burgerů",
                  "České hovězí maso",
                  "Domácí bulky a omáčky",
                  "Hranolky z čerstvých brambor",
                ],
              },
              {
                title: "Pizza",
                price: "129-179 Kč",
                items: [
                  "6 druhů z vlastního těsta",
                  "Italská mouka, čerstvá mozzarella",
                  "Pec na dřevo",
                  "Vege varianta v nabídce",
                ],
              },
              {
                title: "Denní menu",
                price: "od 149 Kč",
                items: [
                  "Polévka + hlavní jídlo",
                  "Každý den jiné",
                  "11:00-14:00",
                  "Ideální pro pracovní oběd",
                ],
              },
              {
                title: "Protein bowly",
                price: "od 139 Kč",
                items: [
                  "30g bílkovin v každém bowlu",
                  "Ideální po tréninku",
                  "Čerstvá zelenina a zrna",
                  "Bez lepku na přání",
                ],
              },
              {
                title: "Nápoje",
                price: "",
                items: [
                  "Čepovaný Plzeňský Prazdroj z tanku",
                  "Espresso z pákového kávovaru",
                  "Domácí limonády",
                  "Smoothie a izotonické nápoje",
                ],
              },
              {
                title: "Catering",
                price: "od 169 Kč/os",
                items: [
                  "Pro turnaje a firemní akce",
                  "Balíček Standard i Premium",
                  "Min. 20 osob",
                  "Objednávka 5 dnů předem",
                ],
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-border bg-white p-6"
              >
                <div className="mb-3 flex items-baseline justify-between">
                  <h3 className="text-lg font-bold text-foreground">
                    {card.title}
                  </h3>
                  {card.price && (
                    <span className="text-sm font-semibold text-primary">
                      {card.price}
                    </span>
                  )}
                </div>
                <ul className="space-y-1.5 text-sm text-muted">
                  {card.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
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
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Proč Bistro Krasovská?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {[
              { label: "Čerstvé suroviny", desc: "Od lokálních dodavatelů" },
              { label: "Žádné polotovary", desc: "Kompletní příprava na místě" },
              { label: "Pro sportovce", desc: "Protein bowly, izotonické nápoje" },
              { label: "Prazdroj z tanku", desc: "Čerstvě čepovaný, přímo v hale" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <h3 className="font-bold text-foreground">{item.label}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Navštivte nás
          </h2>
          <p className="mb-2 text-foreground">
            <strong>Krašovská 32, 323 00 Plzeň-Bolevec</strong>
          </p>
          <p className="mb-6 text-muted">
            Přímo ve sportovní hale Krasovská. Parkování zdarma.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/badminton"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark"
            >
              Sport + jídlo
            </Link>
            <Link
              href="/teambuilding"
              className="rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-background"
            >
              Catering pro akce
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
