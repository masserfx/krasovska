export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "bistro-krasovska-otevira",
    title: "Bistro Krasovská otevírá — co vás čeká",
    date: "2026-02-27",
    excerpt:
      "V květnu 2026 otevíráme vlastní bistro přímo v hale. Autorské burgery, pizza z vlastního těsta a denní menu od 149 Kč.",
    tags: ["bistro", "novinka"],
    content: `
# Bistro Krasovská otevírá

V květnu 2026 otevíráme vlastní bistro přímo ve sportovní hale Krasovská. Žádné polotovary — vaříme z čerstvých surovin od lokálních dodavatelů.

## Co vás čeká

- **5 autorských burgerů** (139-189 Kč) — z českého hovězího, domácí bulky a omáčky
- **6 pizz z vlastního těsta** (129-179 Kč) — italská mouka, čerstvá mozzarella
- **Denní menu** od 149 Kč — polévka + hlavní jídlo, každý den jiné
- **Protein bowly** — ideální po tréninku, 30g bílkovin
- **Čepovaný Plzeňský Prazdroj** přímo z tanku

## Soft opening

V květnu proběhne exkluzivní soft opening pro 50 vybraných členů haly. Slavnostní otevření pro veřejnost plánujeme na červen 2026.

## Catering pro turnaje

Nabídneme i catering pro turnaje a firemní akce — balíček Standard (169 Kč/os) a Premium (229 Kč/os).

Sledujte nás na Facebooku a Instagramu pro aktuální informace!
    `,
  },
  {
    slug: "eshop-sportovni-potreby",
    title: "E-shop s badmintonovým vybavením je online",
    date: "2026-02-15",
    excerpt:
      "Spustili jsme e-shop s vybavením pro badminton — rakety, košíčky, oblečení a doplňky. Osobní odběr zdarma v hale.",
    tags: ["e-shop", "badminton"],
    content: `
# E-shop Haly Krasovská je online

Spustili jsme e-shop, kde najdete vše pro badminton — od raket přes košíčky po oblečení a doplňky.

## Výhody nákupu u nás

- **Osobní odběr zdarma** — vyzvednete si přímo v hale
- **Vyzkoušení na místě** — rakety si můžete otestovat na kurtu
- **Poradenství** — rádi poradíme s výběrem

## Sortiment

- Rakety pro začátečníky i pokročilé
- Peříčkové i plastové košíčky
- Sportovní oblečení a obuv
- Gripy, tašky, doplňky
- Dárkové poukazy

Nakupujte na [e-shopu](/eshop) nebo se stavte osobně na recepci.
    `,
  },
  {
    slug: "badmintonovy-turnaj-jaro-2026",
    title: "Jarní badmintonový turnaj 2026 — registrace otevřena",
    date: "2026-02-10",
    excerpt:
      "Přihlaste se na jarní badmintonový turnaj v Hale Krasovská. Kategorie pro všechny úrovně, 9 kurtů, catering.",
    tags: ["turnaj", "badminton"],
    content: `
# Jarní badmintonový turnaj 2026

Pořádáme jarní badmintonový turnaj pro rekreační i pokročilé hráče.

## Detaily

- **Datum:** březen 2026 (upřesníme)
- **Místo:** Hala Krasovská, Krašovská 32, Plzeň-Bolevec
- **Kategorie:** muži, ženy, mix čtyřhry
- **Kapacita:** 64 hráčů (9 kurtů)

## Co je v ceně

- Hrací poplatek
- Catering — polévka, hlavní jídlo, nápoj
- Medaile a ceny pro vítěze
- Sauna po turnaji

## Registrace

Registrace na recepci haly nebo emailem na recepce@halakrasovska.cz.
    `,
  },
];
