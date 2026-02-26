import { Metric, Insight, RecommendedProject } from "@/types";

interface StrategicData {
  metrics: Metric[];
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  insights: Insight[];
  recommended_projects: RecommendedProject[];
}

export function getStrategicData(): StrategicData {
  const metrics: Metric[] = [
    { id: "s-revenue", label: "Roční obrat", value: 3_500_000, unit: "Kč" },
    { id: "s-revenue-target", label: "Cílový obrat rok 1", value: 7_500_000, unit: "Kč" },
    { id: "s-members", label: "Aktivní členové", value: 350 },
    { id: "s-member-target", label: "Cíl členů rok 1", value: 600 },
    { id: "s-market-penetration", label: "Tržní penetrace", value: 0.6, unit: "%" },
    { id: "s-court-utilization", label: "Vytíženost kurtů", value: 52, unit: "%" },
    { id: "s-hall-utilization", label: "Vytíženost haly", value: 40, unit: "%" },
    { id: "s-restaurant-utilization", label: "Restaurace", value: 0, unit: "% — pozastaveno" },
    { id: "s-dead-space", label: "Nevyužitá plocha", value: 200, unit: "m²" },
    { id: "s-revenue-per-sqm", label: "Tržby na m²", value: 785, unit: "Kč/m²/rok" },
    { id: "s-staff-fte", label: "Personál", value: 8.4, unit: "FTE" },
    { id: "s-bistro-potential", label: "Potenciál bistra", value: 1_534_000, unit: "Kč/rok" },
  ];

  const strengths: string[] = [
    "Největší badmintonová hala v západních Čechách (9 kurtů)",
    "Multifunkční zařízení (badminton, florbal, gymnastika, futsal, sauna, posilovna)",
    "Kapacita 200 diváků pro národní/mezinárodní turnaje",
    "Energie hradí město Plzeň (konkurenční výhoda)",
    "Týdenní turnaje (50–100 hráčů)",
    "50 parkovacích míst zdarma",
  ];

  const weaknesses: string[] = [
    "Restaurace plně vybavena ale pozastavena — 0 Kč z 120 m²",
    "Nulové dotace (0 Kč, srovnatelné spolky 300–800K)",
    "65% příjmů z pronájmu — vysoká koncentrace",
    "Chybí platební terminál, QR platby, online platby",
    "Single point of failure (1 osoba rozhoduje)",
    "Pouze 1 HPP zaměstnanec z 8.4 FTE",
    "785 Kč/m²/rok (benchmark 1500–2500)",
    "200 m² mrtvá plocha",
  ];

  const opportunities: string[] = [
    "Bistro potenciál 1–2M Kč/rok",
    "Růst členů 350 → 600 (rok 1), → 1300 (rok 5)",
    "8 nových příjmových toků (teambuilding, párty, školy, sauna, e-shop, sponzoring, dotace, turnaje)",
    "Dotační programy: MŠMT, NSA, město, EU — odhad 400K rok 1",
    "Spádová oblast 55 000, penetrace jen 0.6%",
    "Firemní segment (Škoda, Daikin, Borgers, Panasonic)",
    "Referral program s ROI 490%",
  ];

  const threats: string[] = [
    "Závislost na rozhodnutí města (energie, nájem)",
    "DPH riziko při obratu >2M (aktuálně na hraně)",
    "Chybí GDPR compliance (350+ členů včetně dětí)",
    "Vysoká závislost na DPP a dobrovolnících",
    "Absence středního managementu",
    "Konkurence: Koloseum, Sport Park (padel), Fit Park",
  ];

  const insights: Insight[] = [
    {
      id: "s-insight-1",
      section: "strategie",
      type: "info",
      title: "Klientské priority: E-shop a Bistro",
      description: "Dva nejžádanější moduly s nejvyšším dopadem na příjmy a členskou spokojenost.",
      priority: "critical",
    },
    {
      id: "s-insight-2",
      section: "strategie",
      type: "opportunity",
      title: "Potenciál bistra: 55 míst, 0 Kč, realisticky 1,53M/rok",
      description: "Restaurace je plně vybavena ale pozastavena. Investice 220K do spuštění bistra (Varianta B) s realistickým výnosem 1,53M Kč/rok.",
      priority: "critical",
    },
    {
      id: "s-insight-3",
      section: "strategie",
      type: "opportunity",
      title: "E-shop: permanentky, kredity, merch, vybavení",
      description: "Online prodej permanentek, kreditů, voucherů a merchandise. Cíl 350K Kč rok 1.",
      priority: "high",
    },
    {
      id: "s-insight-4",
      section: "strategie",
      type: "threat",
      title: "Mrtvá plocha 200 m²: ušlý zisk 600K–1M/rok",
      description: "200 m² nevyužité plochy (salonky, galerie) generuje nulový příjem. Při benchmarku 1500–2500 Kč/m²/rok jde o ušlý zisk 600K–1M ročně.",
      priority: "high",
    },
    {
      id: "s-insight-5",
      section: "strategie",
      type: "weakness",
      title: "Nulové dotace: konkrétní programy MŠMT, NSA, město",
      description: "Organizace nečerpá žádné dotace (0 Kč). Srovnatelné spolky získávají 300–800K ročně z programů MŠMT Můj klub, NSA, město Plzeň a EU fondů.",
      priority: "critical",
    },
    {
      id: "s-insight-6",
      section: "strategie",
      type: "opportunity",
      title: "Tržní prostor: 55K obyvatel, 0.6% penetrace",
      description: "Spádová oblast 55 000 obyvatel s tržní penetrací pouhých 0.6%. Obrovský prostor pro růst členské základny.",
      priority: "high",
    },
    {
      id: "s-insight-7",
      section: "strategie",
      type: "info",
      title: "Finanční scénáře: pesimistický 4,8M, realistický 7,5M, ambiciózní 10M",
      description: "Tři scénáře ročního obratu: pesimistický 4,8M Kč, realistický 7,5M Kč (+114%), ambiciózní 10M Kč (+186%).",
      priority: "high",
    },
    {
      id: "s-insight-8",
      section: "strategie",
      type: "info",
      title: "Bistro scénáře: pesimistický 1,02M, realistický 1,53M, optimistický 1,96M",
      description: "Tři scénáře bistra: pesimistický 1,02M Kč, realistický 1,53M Kč, optimistický 1,96M Kč ročně.",
      priority: "high",
    },
    {
      id: "s-insight-9",
      section: "strategie",
      type: "weakness",
      title: "Personální riziko: 8.4 FTE, 1 HPP, single point of failure",
      description: "Z 8.4 FTE je pouze 1 na HPP. Klíčové rozhodování závisí na 1 osobě. Vysoká závislost na DPP a dobrovolnících.",
      priority: "high",
    },
    {
      id: "s-insight-10",
      section: "strategie",
      type: "opportunity",
      title: "Firemní segment: teambuilding 15–35K/akce, projekce 600K/rok 1",
      description: "Firemní teambuilding (Škoda, Daikin, Borgers, Panasonic) za 15–35K/akce. Projekce 600K Kč v roce 1.",
      priority: "medium",
    },
  ];

  const recommended_projects: RecommendedProject[] = [
    {
      title: "Platební infrastruktura",
      description: "Comgate platební brána, terminál, QR platby, kreditní wallet systém pro členy.",
      category: "infrastructure",
      priority: "critical",
      tasks: [
        "Registrace u Comgate a nastavení platební brány",
        "Nasazení platebního terminálu na recepci",
        "Implementace QR plateb (CZ QR standard)",
        "Vývoj kreditního wallet systému pro členy",
        "Testování a spuštění všech platebních kanálů",
      ],
    },
    {
      title: "E-shop a online prodej",
      description: "Online prodej permanentek, kreditů, voucherů, merchandise a vybavení. Sklad a logistika.",
      category: "development",
      priority: "critical",
      tasks: [
        "Návrh produktového katalogu (permanentky, kredity, vouchery)",
        "Implementace e-shopu s platební bránou",
        "Napojení na skladové hospodářství",
        "Merchandise a vybavení — dodavatelé, marže",
        "Spuštění, marketing a cíl 350K Kč rok 1",
      ],
    },
    {
      title: "Spuštění bistra — Varianta B",
      description: "Investice 220K Kč. HACCP certifikace, Dotykačka POS, menu design, catering pro turnaje.",
      category: "operations",
      priority: "high",
      tasks: [
        "HACCP certifikace a hygienický audit",
        "Nasazení Dotykačka POS systému",
        "Návrh menu a kalkulace food cost",
        "Nábor personálu bistra (kuchař, obsluha)",
        "Catering pro turnaje a firemní akce",
        "Spuštění provozu a marketing",
      ],
    },
    {
      title: "CRM a členská základna",
      description: "Import 350 členů, 4-tier členství, RFID přístupy, věrnostní program.",
      category: "development",
      priority: "high",
      tasks: [
        "Import stávajících 350 členů do CRM",
        "Definice 4 úrovní členství (Basic, Active, Premium, VIP)",
        "Implementace RFID přístupového systému",
        "Věrnostní program s body a odměnami",
        "Automatizace komunikace (onboarding, renewals, notifikace)",
      ],
    },
    {
      title: "Marketingová strategie",
      description: "Web + SEO, sociální sítě, reklama 23K/měs, referral program, školy, firmy.",
      category: "marketing",
      priority: "high",
      tasks: [
        "Redesign webu s SEO optimalizací",
        "Strategie sociálních sítí (Instagram, Facebook, TikTok)",
        "Reklamní rozpočet 23K/měs (Google Ads, Meta Ads)",
        "Referral program pro členy (ROI 490%)",
        "Partnerství se školami a firmami v regionu",
      ],
    },
    {
      title: "Dotační strategie",
      description: "Dotační poradce, MŠMT Můj klub, město Plzeň, NSA, EU fondy. Cíl 400K rok 1.",
      category: "strategic",
      priority: "high",
      tasks: [
        "Výběr dotačního poradce / grant writera",
        "Žádost MŠMT Můj klub (termín duben)",
        "Žádost město Plzeň — podpora sportu",
        "Žádost NSA — rozvoj sportovní infrastruktury",
        "Mapování EU fondů (IROP, ESF+)",
        "Cíl: získat min. 400K Kč v roce 1",
      ],
    },
    {
      title: "Zprovoznění salonků",
      description: "Vybavení 100K Kč, firemní akce, narozeniny, projekce 200–400K/rok.",
      category: "infrastructure",
      priority: "medium",
      tasks: [
        "Audit a příprava prostor (200 m²)",
        "Nákup vybavení (nábytek, AV technika) — rozpočet 100K",
        "Ceník a balíčky (firemní akce, narozeniny, školení)",
        "Marketing salonků na B2B segment",
        "Spuštění a projekce 200–400K Kč/rok",
      ],
    },
    {
      title: "Rezervační systém — iSport",
      description: "iCal/API synchronizace, dynamické ceny, správa stálých rezervací.",
      category: "development",
      priority: "medium",
      tasks: [
        "Integrace iSport rezervačního systému",
        "iCal a API synchronizace s kalendáři",
        "Implementace dynamického ceníku (špička/mimo špičku)",
        "Správa stálých rezervací a pravidel",
        "Školení personálu a testovací provoz",
      ],
    },
    {
      title: "Turnajový modul",
      description: "Online registrace, losy/skupiny/pavouk, live výsledky, žebříčky.",
      category: "development",
      priority: "medium",
      tasks: [
        "Online registrace a platba startovného",
        "Generování losů, skupin a pavouků",
        "Live výsledky a tabulky během turnaje",
        "Celoroční žebříčky a statistiky hráčů",
        "Integrace s CRM a členskou základnou",
      ],
    },
    {
      title: "Optimalizace provozu",
      description: "Vytíženost kurtů 52→85%, spinning, sauna balíčky, školní programy.",
      category: "operations",
      priority: "medium",
      tasks: [
        "Analýza vytíženosti a identifikace mrtvých hodin",
        "Dopolední programy (školy, senioři, maminky)",
        "Spinning a fitness skupinové lekce",
        "Sauna balíčky a wellness programy",
        "Cíl: vytíženost kurtů z 52% na 85%",
      ],
    },
  ];

  return {
    metrics,
    strengths,
    weaknesses,
    opportunities,
    threats,
    insights,
    recommended_projects,
  };
}
