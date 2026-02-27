export const SITE_URL = "https://www.halakrasovska.cz";
export const SITE_NAME = "Hala Krašovská";
export const GTM_ID = "GTM-KQPDNB2";

export const CONTACT = {
  name: "Sportovní hala Krašovská",
  org: "Badmintonová Akademie Plzeň, z.s.",
  street: "Krašovská 32",
  city: "323 00 Plzeň",
  district: "Plzeň-Bolevec",
  legalAddress: "Jesenická 1258/3, 32300 Plzeň",
  ico: "07461216",
  dic: "CZ07461216",
  phone: "+420 774 050 839",
  phoneDisplay: "774 050 839",
  email: "recepce@halakrasovska.cz",
  legalEmail: "baplzen@centrum.cz",
  facebook: "https://www.facebook.com/halakrasovska",
  instagram: "https://www.instagram.com/hala.krasovska",
  googleMaps: "https://maps.app.goo.gl/91MzkfX2hAkNStaq7",
} as const;

export const MAP_CENTER = { lat: 49.779, lng: 13.356 } as const;

export const NAV_ITEMS = [
  { label: "Úvod", href: "/" },
  { label: "Badminton", href: "/badminton" },
  { label: "Víceúčelová plocha", href: "/viceucelova-plocha" },
  { label: "Cvičební sál", href: "/cvicebni-sal" },
  { label: "Ceník", href: "/cenik" },
  { label: "Rezervace", href: "/rezervace" },
  { label: "Bistro", href: "/bistro" },
  { label: "Kontakt", href: "/kontakt" },
] as const;

export const IMAGES = {
  hero: [
    { src: "/images/hero/hala-zvenku.jpg", alt: "Sportovní hala Krašovská — pohled zvenku" },
    { src: "/images/hero/hala-kurty.jpg", alt: "9 badmintonových kurtů s profesionálním povrchem Taraflex" },
    { src: "/images/hero/sal.jpg", alt: "Cvičební sál v Hale Krašovská" },
  ],
  services: {
    badminton: { src: "/images/services/badminton.jpg", alt: "Badmintonové kurty v Hale Krašovská Plzeň" },
    plocha: { src: "/images/services/viceucelova-plocha.jpg", alt: "Víceúčelová plocha 77×24 m pro florbal a volejbal" },
    sal: { src: "/images/services/cvicebni-sal.jpg", alt: "Cvičební sál pro skupinové lekce a fitness" },
  },
} as const;

export const PRICING = {
  badminton: {
    title: "Badminton",
    rows: [
      { label: "Po–Pá, 7:00–15:00", price: "180 Kč/hod" },
      { label: "Po–Pá, 15:00–22:00", price: "300 Kč/hod", memberPrice: "250 Kč/hod" },
      { label: "So–Ne, 8:00–22:00", price: "300 Kč/hod", memberPrice: "250 Kč/hod" },
    ],
  },
  plocha: {
    title: "Víceúčelová plocha",
    rows: [
      { label: "Po–Pá, 7:00–15:00", price: "900 Kč/hod" },
      { label: "Po–Pá, 15:00–22:00", price: "1 500 Kč/hod", memberPrice: "1 250 Kč/hod" },
      { label: "So–Ne, 8:00–22:00", price: "1 500 Kč/hod", memberPrice: "1 250 Kč/hod" },
    ],
  },
  sal: {
    title: "Cvičební sál",
    rows: [
      { label: "Po–Pá, 7:00–15:00", price: "350 Kč/hod" },
      { label: "Po–Pá, 15:00–22:00", price: "450 Kč/hod" },
      { label: "So–Ne, 8:00–22:00", price: "450 Kč/hod" },
    ],
  },
} as const;
