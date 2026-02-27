import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bistro Hala Krasovská — Burgery, Pizza, Denní menu",
  description:
    "Sportovní bistro v Plzni-Bolevci — autorské burgery z českého hovězího, pizza z vlastního těsta, denní menu od 149 Kč, protein bowly. Čepovaný Plzeňský Prazdroj z tanku. Krašovská 32.",
  openGraph: {
    title: "Bistro Hala Krasovská — Burgery, Pizza, Denní menu",
    description:
      "Sportovní bistro v Plzni-Bolevci — autorské burgery, pizza z vlastního těsta, denní menu od 149 Kč. Žádné polotovary, čerstvé suroviny.",
    url: "https://hala-krasovska.vercel.app/bistro",
  },
  alternates: {
    canonical: "/bistro",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Bistro Hala Krasovská",
  description:
    "Sportovní bistro v Plzni-Bolevci — autorské burgery z českého hovězího, pizza z vlastního těsta, denní menu, protein bowly. Žádné polotovary.",
  url: "https://hala-krasovska.vercel.app/bistro",
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
  menu: [
    { "@type": "MenuItem", name: "Autorské burgery", offers: { "@type": "Offer", price: "139", priceCurrency: "CZK" } },
    { "@type": "MenuItem", name: "Pizza z vlastního těsta", offers: { "@type": "Offer", price: "129", priceCurrency: "CZK" } },
    { "@type": "MenuItem", name: "Denní menu", offers: { "@type": "Offer", price: "149", priceCurrency: "CZK" } },
    { "@type": "MenuItem", name: "Protein bowly" },
  ],
  parentOrganization: {
    "@type": "SportsActivityLocation",
    name: "Hala Krasovská",
  },
};

export default function BistroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
