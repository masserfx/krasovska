import { SITE_URL, CONTACT, MAP_CENTER } from "./constants";

export const sportsActivityLocationSchema = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Sportovní hala Krašovská",
  description:
    "Sportovní hala v Plzni-Bolevci — 9 badmintonových kurtů, víceúčelová plocha 77×24 m, cvičební sál, bistro.",
  url: SITE_URL,
  telephone: CONTACT.phone,
  email: CONTACT.email,
  image: `${SITE_URL}/og-image.jpg`,
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
    latitude: MAP_CENTER.lat,
    longitude: MAP_CENTER.lng,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:00",
      closes: "22:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday"],
      opens: "08:00",
      closes: "22:00",
    },
  ],
  sameAs: [CONTACT.facebook, CONTACT.instagram],
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Badmintonové kurty", value: true },
    { "@type": "LocationFeatureSpecification", name: "Víceúčelová plocha", value: true },
    { "@type": "LocationFeatureSpecification", name: "Cvičební sál", value: true },
    { "@type": "LocationFeatureSpecification", name: "Parkování zdarma", value: true },
  ],
};

export const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Bistro Hala Krašovská",
  description:
    "Sportovní bistro — autorské burgery, pizza z vlastního těsta, denní menu od 149 Kč. Žádné polotovary, čerstvé suroviny.",
  url: `${SITE_URL}/bistro`,
  servesCuisine: ["Česká", "Mezinárodní"],
  priceRange: "$$",
  telephone: CONTACT.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Krašovská 32",
    addressLocality: "Plzeň",
    postalCode: "323 00",
    addressCountry: "CZ",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: MAP_CENTER.lat,
    longitude: MAP_CENTER.lng,
  },
  parentOrganization: {
    "@type": "SportsActivityLocation",
    name: "Sportovní hala Krašovská",
  },
};
