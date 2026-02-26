# Finanční model bistra Hala Krašovská — Detailní scénáře A/B/C

> **Verze:** 1.0 | **Datum:** 2026-02-19 | **Zpracoval:** Leoš Hrádek
> **Klient:** Badmintonová Akademie Plzeň, z.s. | **Lokalita:** Krašovská 32, Plzeň-Bolevec

---

## Klíčové vstupní předpoklady

| Parametr | Hodnota | Poznámka |
|---|---|---|
| Energie (elektřina, teplo, voda) | **0 Kč** | Hradí město Plzeň |
| Nájem prostoru | **0 Kč** | Vlastní hala spolku |
| Kuchyňské zázemí | Plně vybavené | Konvektomat, mrazáky, nerez stoly — bez investice do základního HW |
| Testovaná kapacita | 700 jídel/den | Profesionální tým, turnaj 6 dní |
| Turnaje ročně | 48 | 50–100 hráčů/turnaj |
| Aktivní členové (RFID) | 350 | Průměrná útrata 135 Kč/návštěvu |
| Provozní týdny/rok | 48 | 4 týdny údržba/svátky |
| Sezónnost | Září–prosinec +20 %, duben–květen -10 %, červen–srpen -30 % | |

### Korekce stávajícího break-even výpočtu

Existující dokument (BISTRO_STRATEGIE.md, sekce 3.3) uvádí break-even varianty B na **153 846 Kč/měs** při fixních nákladech 100 000 Kč. Tento výpočet je **podhodnocený**:

| Položka | Původní odhad | Korekce |
|---|---|---|
| Fixní N (personál) | 100 000 Kč | 100 000 Kč (správně) |
| Fixní provozní N (odpady, čištění, praní, POS, internet, marketing, účetnictví, pojištění, údržba, rezerva) | 0 Kč (zahrnuty do variabilních) | **23 500 Kč** |
| Skutečné fixní N | 100 000 Kč | **123 500 Kč** |
| Variabilní N (food cost + obaly + terminál) | 35 % | 33 % (food cost 28–30 % + obaly/terminál 3–5 %) |
| **Korigovaný break-even** | 153 846 Kč | **184 328 Kč/měs** |

**Výpočet:** 123 500 / 0,67 = 184 328 Kč/měs

Tento korigovaný break-even je použit jako základ pro Scénář B níže. Scénáře A a C mají vlastní struktury.

---

## SCÉNÁŘ A — QUICK START (měsíce 0–3)

### Koncept
Bez kuchaře, pouze polotovary (mražené burgery, pizza, panini) + 1 brigádník na směně. Minimální investice, rychlý start, ověření trhu.

### Jednorázová investice

> **Aktualizace 2026-02-19:** Revidováno po potvrzení stavu vybavení. Grill, automatový kávovar a revize spotřebičů odpadají — již k dispozici nebo nepotřebné.

| Položka | Částka | Poznámka |
|---|---|---|
| ~~Revize konvektomatu + mrazáku~~ | ~~20 000 Kč~~ | Není potřeba |
| ~~Kontaktní gril~~ | ~~25 000 Kč~~ | Již k dispozici |
| ~~Automatový kávovar (1. splátka pronájmu)~~ | ~~2 500 Kč~~ | Již k dispozici |
| HACCP dokumentace | ⚠️ TBD | Tomáš Knopp ověří stav — pokud OK, 0 Kč; pokud nutné, +10 000 Kč |
| Chladicí vitrína | 18 000 Kč | |
| POS tablet + tiskárna + terminál | 15 000 Kč | |
| První naskladnění (polotovary + nápoje) | 25 000 Kč | |
| Obaly takeaway | 5 000 Kč | |
| Grafika menu + tabule | 5 000 Kč | |
| Rezerva (10 %) | 6 800 Kč | |
| **CELKEM (bez HACCP)** | **74 800 Kč** | |
| **CELKEM (vč. HACCP, pokud nutné)** | **84 800 Kč** | |

### Měsíční provozní náklady

| Položka | Kč/měs | Poznámka |
|---|---|---|
| **Personál** | | |
| Brigádník hlavní (DPP) | 18 000 | 160 h × 112,50 Kč/h (min. mzda 2026) |
| Brigádník víkendy/turnaje (DPP) | 8 000 | 2–3 osoby, 56 h celkem |
| Vedoucí bistra (0,25 úvazku, OSVČ) | 9 000 | Objednávky, dohled, kalkulace |
| **Suroviny** | | |
| Polotovary + nápoje (food cost 38 %) | Variabilní | Závisí na tržbách |
| **Provozní** | | |
| Energie | 0 | Hradí město |
| Nájem | 0 | Vlastní prostor |
| Pronájem kávovaru | 0 | Vlastní kávovar k dispozici |
| Odpady | 1 500 | |
| Čisticí prostředky | 1 000 | |
| Obaly takeaway | 2 000 | |
| POS software + terminál poplatky | 1 500 | |
| Marketing (social media) | 2 000 | |
| Pojištění | 1 000 | |
| Účetnictví (podíl) | 1 500 | |
| Rezerva | 2 000 | |
| **Fixní náklady celkem** | **47 500 Kč** | Úspora 2 500 Kč/měs (vlastní kávovar) |
| **Variabilní náklady** | **43 % z tržeb** | Food cost 38 % + obaly/terminál 5 % |
| **Příspěvková marže** | **57 %** | |

### Break-even Scénář A

**Break-even tržby = 47 500 / 0,57 = 83 333 Kč/měs**

To odpovídá cca **21 zákazníků/den** při průměrné útratě 135 Kč (při 30 provozních dnech/měs).

### Projekce tržeb — Scénář A

| Zdroj příjmů | Běžný den (20 dnů) | Víkend ne-turnaj (4 dny) | Turnajový den (4 dny) | Měsíční tržby |
|---|---|---|---|---|
| Pesimistický (15 zák./den) | 20 × 15 × 120 Kč | 4 × 16 × 120 Kč | 4 × 25 × 120 Kč | **55 680 Kč** |
| Realistický (22 zák./den) | 20 × 22 × 130 Kč | 4 × 24 × 130 Kč | 4 × 35 × 130 Kč | **88 920 Kč** |
| Optimistický (30 zák./den) | 20 × 30 × 135 Kč | 4 × 32 × 135 Kč | 4 × 45 × 135 Kč | **122 580 Kč** |

**Poznámka:** Průměrná útrata u polotovarů je nižší (120–135 Kč) než u čerstvě připravených jídel.

### Cash flow měsíc po měsíci — Scénář A (realistický)

| Měsíc | Tržby | Food cost (38 %) | Obaly/terminál (5 %) | Fixní N | EBITDA | Kumulativní CF |
|---|---|---|---|---|---|---|
| M0 (investice) | — | — | — | — | — | **-138 000** |
| M1 | 62 000 | -23 560 | -3 100 | -50 000 | -14 660 | **-152 660** |
| M2 | 75 000 | -28 500 | -3 750 | -50 000 | -7 250 | **-159 910** |
| M3 | 89 000 | -33 820 | -4 450 | -50 000 | +730 | **-159 180** |
| M4 | 95 000 | -36 100 | -4 750 | -50 000 | +4 150 | **-155 030** |
| M5 | 98 000 | -37 240 | -4 900 | -50 000 | +5 860 | **-149 170** |
| M6 | 100 000 | -38 000 | -5 000 | -50 000 | +7 000 | **-142 170** |

**Náběh:** M1 = 70 % cílového obratu, M2 = 85 %, od M3 plný provoz.

### Klíčové ukazatele — Scénář A

| Ukazatel | Hodnota |
|---|---|
| Break-even tržby (měsíční) | 87 719 Kč |
| **Break-even datum (provozní)** | **Měsíc 3** |
| Návratnost investice (payback) | 20–24 měsíců při realistickém scénáři |
| ROI (12 měsíců) | -15 % (ztrátový 1. rok) |
| ROI (24 měsíců) | +12 % |
| Maximální kumulativní ztráta | -160 000 Kč (měsíc 2) |

### Citlivostní analýza — Scénář A

| Parametr | -20 % tržby | Základ | +20 % tržby |
|---|---|---|---|
| Měsíční tržby (od M3) | 71 200 Kč | 89 000 Kč | 106 800 Kč |
| EBITDA/měs | -9 414 Kč | +730 Kč | +10 874 Kč |
| Break-even dosažen? | NE | ANO (M3) | ANO (M2) |
| Kumulativní CF po 12 měs. | -240 000 Kč | -110 000 Kč | +20 000 Kč |

### Rizikové faktory — Scénář A

| Riziko | Pravděpodobnost | Dopad | Mitigace |
|---|---|---|---|
| Nízká kvalita polotovarů → špatné recenze | Vysoká | Střední | Testování dodavatelů, výběr prémiových polotovarů |
| Nedostatečná návštěvnost | Střední | Vysoký | Křížový prodej přes recepci, členské slevy |
| Odchod brigádníka | Střední | Střední | Záloha 2 vyškolených brigádníků |
| Město změní podmínky energie | Nízká | Kritický | Monitorovat vztah s městem |
| Sezónní výkyv (léto) | Jistá | Střední | Letní kempy, redukovaný provoz |

---

## SCÉNÁŘ B — STANDARD (měsíce 3–6)

### Koncept
1 kuchař (HPP) + brigádníci, čerstvá příprava (burgery, pizza, denní menu), turnajový catering, registrace na delivery platformách (Wolt, Bolt Food — provize 30 %).

### Jednorázová investice (navíc oproti Scénáři A)

| Položka | Částka |
|---|---|
| Pizza pec stolní (OONI Volt) | 35 000 Kč |
| Pákový kávovar + mlýnek | 65 000 Kč |
| Fritéza | 12 000 Kč |
| POS upgrade (kuchyňský displej) | 4 500 Kč |
| Drobné kuchyňské vybavení | 15 000 Kč |
| Interiér (výmalba, menu tabule, světelný panel) | 33 000 Kč |
| HACCP upgrade + školení personálu | 10 000 Kč |
| Marketing launch kampaň | 22 000 Kč |
| Dozbrojení zásob (čerstvé suroviny) | 20 000 Kč |
| Rezerva (10 %) | 21 500 Kč |
| **CELKEM dozbrojení** | **238 000 Kč** |
| **CELKEM investice A + B** | **376 000 Kč** |

### Měsíční provozní náklady

| Položka | Kč/měs | Poznámka |
|---|---|---|
| **Personál** | | |
| Kuchař (HPP) | 42 000 | 32 000 Kč hrubá + odvody |
| Obsluha/pokladní (DPP, 2 osoby) | 24 000 | 2 × 80 h × 150 Kč/h |
| Brigádníci turnaje (DPP) | 8 000 | 3–4 osoby, 10 h/turnaj × 4 turnaje |
| Vedoucí bistra (0,5 úvazku, OSVČ) | 18 000 | |
| **Provozní** | | |
| Energie | 0 | Hradí město |
| Nájem | 0 | Vlastní prostor |
| Odpady a oleje | 3 000 | |
| Čisticí prostředky | 2 500 | |
| Obaly takeaway/delivery | 5 000 | Vyšší objem díky delivery |
| Praní zástěr, utěrek | 1 500 | |
| POS software + terminál poplatky | 2 000 | |
| Marketing (social media + online) | 5 000 | |
| Věrnostní program (slevy) | 3 000 | |
| Účetnictví (podíl) | 3 000 | |
| Pojištění | 1 500 | |
| Údržba a revize | 2 000 | |
| Rezerva | 3 500 | |
| **Fixní náklady celkem** | **124 000 Kč** | |
| **Variabilní náklady** | **33 % z tržeb** | Food cost 28 % + obaly/terminál/delivery 5 % |
| **Příspěvková marže** | **67 %** | |

### Delivery platformy — dopad na marže

| Kanál | Podíl na tržbách | Provize | Efektivní food cost | Čistá marže |
|---|---|---|---|---|
| Bistro (přímý prodej) | 70 % | 0 % | 28 % | 67 % |
| Wolt/Bolt Food | 20 % | 30 % | 28 % | 37 % |
| Takeaway (online objednávka) | 10 % | 0 % | 28 % | 67 % |
| **Vážený průměr** | 100 % | **6 %** | 28 % | **61 %** |

**Korekce break-even s delivery:** Při zahrnutí delivery provizí je efektivní příspěvková marže 61 %, ne 67 %.

### Break-even Scénář B

| Varianta | Bez delivery | S delivery (20 % tržeb) |
|---|---|---|
| Příspěvková marže | 67 % | 61 % |
| **Break-even tržby** | **185 075 Kč/měs** | **203 279 Kč/měs** |

**Porovnání s původním dokumentem:** Původní break-even 153 846 Kč je podhodnocený o cca 32 000–50 000 Kč/měs. Hlavní příčiny: (1) fixní provozní náklady nebyly plně zahrnuty, (2) delivery provize nebyly kalkulovány.

### Projekce tržeb — Scénář B

| Zdroj příjmů | Měsíční odhad (realistický) |
|---|---|
| Bistro — běžné dny (20 dnů × 30 zák. × 145 Kč) | 87 000 Kč |
| Bistro — víkendy ne-turnaj (4 dny × 33 zák. × 145 Kč) | 19 140 Kč |
| Bistro — turnajové dny (4 dny × 54 zák. × 145 Kč) | 31 320 Kč |
| Turnajový catering (4 turnaje × 30 balíčků × 169 Kč) | 20 280 Kč |
| Delivery (Wolt/Bolt, ~15 objednávek/den × 20 dnů × 180 Kč) | 54 000 Kč |
| **Celkové měsíční tržby** | **211 740 Kč** |

### Cash flow měsíc po měsíci — Scénář B (realistický)

Předpoklad: Scénář B startuje v měsíci 3 (po 3 měsících Quick Start). Kumulativní CF začíná na -159 180 Kč (konec Scénáře A M3).

| Měsíc | Tržby | Var. N (33 %) | Delivery provize (6 %) | Fixní N | EBITDA | Kumulativní CF |
|---|---|---|---|---|---|---|
| M3 (investice B) | — | — | — | — | -238 000 | **-397 180** |
| M4 | 140 000 | -46 200 | -8 400 | -124 000 | -38 600 | **-435 780** |
| M5 | 175 000 | -57 750 | -10 500 | -124 000 | -17 250 | **-453 030** |
| M6 | 200 000 | -66 000 | -12 000 | -124 000 | -2 000 | **-455 030** |
| M7 | 212 000 | -69 960 | -12 720 | -124 000 | +5 320 | **-449 710** |
| M8 | 220 000 | -72 600 | -13 200 | -124 000 | +10 200 | **-439 510** |
| M9 | 225 000 | -74 250 | -13 500 | -124 000 | +13 250 | **-426 260** |

**Náběh:** M4 = 65 % cílového obratu (nový kuchař, rozjezd delivery), M5 = 83 %, od M6 blízko plného provozu.

### Alternativní pohled: Cash flow pouze Scénář B (bez A fáze)

Pokud bistro startuje přímo ve Scénáři B (plná investice 376 000 Kč):

| Měsíc | Tržby | Var. N + Delivery prov. | Fixní N | EBITDA | Kumulativní CF |
|---|---|---|---|---|---|
| M0 (investice) | — | — | — | — | **-376 000** |
| M1 | 130 000 | -50 700 | -124 000 | -44 700 | **-420 700** |
| M2 | 165 000 | -64 350 | -124 000 | -23 350 | **-444 050** |
| M3 | 195 000 | -76 050 | -124 000 | -5 050 | **-449 100** |
| M4 | 210 000 | -81 900 | -124 000 | +4 100 | **-445 000** |
| M5 | 220 000 | -85 800 | -124 000 | +10 200 | **-434 800** |
| M6 | 225 000 | -87 750 | -124 000 | +13 250 | **-421 550** |

### Klíčové ukazatele — Scénář B

| Ukazatel | Hodnota |
|---|---|
| Break-even tržby (bez delivery) | 185 075 Kč/měs |
| Break-even tržby (s delivery 20 %) | 203 279 Kč/měs |
| **Break-even datum (provozní)** | **Měsíc 4 (7. měsíc od startu celkově)** |
| Návratnost investice (payback) | 30–36 měsíců |
| ROI (12 měsíců, od startu B) | -52 % (stále ve ztrátě z investice) |
| ROI (24 měsíců, od startu B) | +8 % |
| Maximální kumulativní ztráta | -455 000 Kč (měsíc 6 celkově) |
| Roční EBITDA (stabilizovaný provoz) | +100 000 – +160 000 Kč |

### Citlivostní analýza — Scénář B

| Parametr | -20 % tržby | Základ | +20 % tržby |
|---|---|---|---|
| Měsíční tržby (stabilní) | 170 000 Kč | 212 000 Kč | 254 000 Kč |
| Var. N + delivery provize | -66 300 Kč | -82 680 Kč | -99 060 Kč |
| EBITDA/měs | -20 300 Kč | +5 320 Kč | +30 940 Kč |
| Break-even dosažen? | NE (-20 300 Kč/měs) | ANO (M7) | ANO (M5) |
| Roční EBITDA | -243 600 Kč | +63 840 Kč | +371 280 Kč |

**KRITICKÝ POZNATEK:** Při poklesu tržeb o 20 % je Scénář B trvale ztrátový. Turnajový catering a delivery jsou klíčové pro dosažení break-even.

### Rizikové faktory — Scénář B

| Riziko | Pravděpodobnost | Dopad | Mitigace |
|---|---|---|---|
| Nenalezení kvalitního kuchaře | Střední | Kritický | Začít hledání ihned, nabídnout konkurenceschopnou mzdu |
| Nízká konverze delivery | Střední | Vysoký | A/B testování menu, foto/video optimalizace na platformách |
| Delivery provize 30 % sníží marži | Jistá | Střední | Limitovat delivery na 20–25 % tržeb, budovat vlastní objednávkový systém |
| Turnajový catering nedosáhne 40 % konverze | Střední | Vysoký | Předobjednávkový systém, sleva za předplatbu, cross-sell při registraci |
| Zvýšení food costu nad 30 % | Střední | Střední | Kalkulační karty, monitoring, úprava menu/cen |
| Sezónní propad (léto -30 %) | Jistá | Střední | Letní kempy, grilovací akce, redukce personálu |

---

## SCÉNÁŘ C — FULL OPERACE (měsíce 6–12)

### Koncept
Kompletní bistro + delivery + turnajový catering + pronájem salonků + grilovací/eventové akce. Rozšířený tým, maximální monetizace prostoru.

### Jednorázová investice (navíc oproti A+B)

| Položka | Částka |
|---|---|
| Smoker/BBQ pro grilovací akce | 35 000 Kč |
| Venkovní mobiliář (stoly, židle, slunečníky) | 40 000 Kč |
| Salonky — základní vybavení (projektor, osvětlení, reproduktor) | 43 000 Kč |
| TV obrazovky 2× (sportovní přenosy) | 30 000 Kč |
| Rozšíření výčepu (4 kohouty) | 15 000 Kč |
| Marketing — rozšířená kampaň (salonky, firemní akce) | 25 000 Kč |
| Online rezervační systém (salonky) | 10 000 Kč |
| Servírovací nádobí, poháry (salonky) | 8 000 Kč |
| Rezerva (10 %) | 20 600 Kč |
| **CELKEM dozbrojení C** | **226 600 Kč** |
| **CELKEM investice A + B + C** | **602 600 Kč** |

### Měsíční provozní náklady

| Položka | Kč/měs | Poznámka |
|---|---|---|
| **Personál** | | |
| Kuchař (HPP) | 42 000 | Beze změny |
| Pomocný kuchař / přípravář (DPP) | 14 000 | 100 h × 140 Kč/h |
| Obsluha/pokladní (DPP, 2 osoby) | 24 000 | |
| Brigádníci turnaje + eventy (DPP) | 12 000 | Rozšířený tým pro akce |
| Vedoucí bistra (0,75 úvazku, OSVČ) | 27 000 | Rozšířená agenda: salonky, eventy |
| **Provozní** | | |
| Energie | 0 | Hradí město |
| Nájem | 0 | Vlastní prostor |
| Odpady a oleje | 4 000 | Vyšší objem |
| Čisticí prostředky | 3 000 | |
| Obaly takeaway/delivery | 6 000 | |
| Praní + spotřební materiál | 2 500 | |
| POS software + terminál poplatky | 2 500 | |
| Marketing (social + salonky + firemní) | 8 000 | |
| Věrnostní program | 3 000 | |
| Účetnictví (podíl) | 4 000 | Vyšší administrativa |
| Pojištění | 2 500 | Rozšířené o eventy |
| Údržba a revize | 3 000 | |
| OSA/INTERGRAM licence | 1 000 | Hudba při akcích |
| Rezerva | 4 500 | |
| **Fixní náklady celkem** | **163 000 Kč** | |
| **Variabilní náklady** | **31 % z tržeb** | Food cost 26 % (nižší díky cateringu/eventům) + obaly/terminál/delivery 5 % |
| **Příspěvková marže** | **69 %** | Vyšší díky salonkům a eventům (vyšší marže) |

### Výnosový mix — Scénář C

| Zdroj příjmů | Měsíční odhad | Podíl | Marže |
|---|---|---|---|
| Bistro (přímý prodej) | 137 460 Kč | 40 % | 67 % |
| Delivery (Wolt/Bolt) | 54 000 Kč | 16 % | 37 % |
| Turnajový catering (4 turnaje) | 30 000 Kč | 9 % | 65 % |
| Salonky — pronájem | 22 000 Kč | 6 % | 85 % |
| Salonky — catering (povinný min. odběr) | 20 000 Kč | 6 % | 55 % |
| Firemní teambuilding balíčky | 26 000 Kč | 8 % | 55 % |
| Grilovací akce / venkovní eventy | 18 000 Kč | 5 % | 60 % |
| Dětské narozeninové párty | 12 000 Kč | 3 % | 60 % |
| Nápoje + bar (rozšířený, 4 kohouty) | 24 000 Kč | 7 % | 70 % |
| **CELKEM** | **343 460 Kč** | 100 % | **~61 % vážená** |

### Break-even Scénář C

**Break-even tržby = 163 000 / 0,61 = 267 213 Kč/měs**

(Efektivní marže 61 % zahrnuje vážený mix všech kanálů s různými maržemi.)

### Cash flow měsíc po měsíci — Scénář C (realistický)

Předpoklad: Start od měsíce 6 (po fázích A+B). Kumulativní CF z předchozích fází: -426 260 Kč.

| Měsíc | Tržby | Var. N (31 %) | Delivery prov. (5 %) | Fixní N | EBITDA | Kumulativní CF |
|---|---|---|---|---|---|---|
| M6 (investice C) | — | — | — | — | -226 600 | **-652 860** |
| M7 | 250 000 | -77 500 | -12 500 | -163 000 | -3 000 | **-655 860** |
| M8 | 290 000 | -89 900 | -14 500 | -163 000 | +22 600 | **-633 260** |
| M9 | 320 000 | -99 200 | -16 000 | -163 000 | +41 800 | **-591 460** |
| M10 | 340 000 | -105 400 | -17 000 | -163 000 | +54 600 | **-536 860** |
| M11 | 350 000 | -108 500 | -17 500 | -163 000 | +61 000 | **-475 860** |
| M12 | 345 000 | -106 950 | -17 250 | -163 000 | +57 800 | **-418 060** |

**Náběh:** M7 = 73 % cíle (nové kanály — salonky, eventy — nabíhají pomaleji), M8 = 84 %, od M9 blízko plného provozu. Sezónní korekce v M12 (prosinec — vánoční akce kompenzují částečně).

### Alternativní pohled: Kompletní 12měsíční cash flow (od nuly)

| Měsíc | Fáze | Tržby | Celkové N | EBITDA | Kumulativní CF |
|---|---|---|---|---|---|
| M0 | A (investice) | — | — | — | **-138 000** |
| M1 | A | 62 000 | -76 660 | -14 660 | **-152 660** |
| M2 | A | 75 000 | -82 250 | -7 250 | **-159 910** |
| M3 | A→B (investice) | 89 000 | -326 270 | -237 270 | **-397 180** |
| M4 | B | 140 000 | -178 600 | -38 600 | **-435 780** |
| M5 | B | 175 000 | -192 250 | -17 250 | **-453 030** |
| M6 | B→C (investice) | 200 000 | -428 600 | -228 600 | **-681 630** |
| M7 | C | 250 000 | -253 000 | -3 000 | **-684 630** |
| M8 | C | 290 000 | -267 400 | +22 600 | **-662 030** |
| M9 | C | 320 000 | -278 200 | +41 800 | **-620 230** |
| M10 | C | 340 000 | -285 400 | +54 600 | **-565 630** |
| M11 | C | 350 000 | -289 000 | +61 000 | **-504 630** |
| M12 | C | 345 000 | -287 250 | +57 800 | **-446 830** |

### Klíčové ukazatele — Scénář C

| Ukazatel | Hodnota |
|---|---|
| Celková investice (A+B+C) | 602 600 Kč |
| Break-even tržby (měsíční) | 267 213 Kč |
| **Break-even datum (provozní)** | **Měsíc 8 (od startu celkově)** |
| Návratnost celkové investice (payback) | 18–22 měsíců (od startu fáze C) |
| ROI (12 měsíců od startu C) | +12 % |
| ROI (24 měsíců od startu C) | +85 % |
| Maximální kumulativní ztráta | -685 000 Kč (měsíc 7) |
| Roční EBITDA (stabilizovaný provoz) | **+550 000 – +730 000 Kč** |
| Roční tržby (stabilizovaný provoz) | **3 600 000 – 4 100 000 Kč** |

### Citlivostní analýza — Scénář C

| Parametr | -20 % tržby | Základ | +20 % tržby |
|---|---|---|---|
| Měsíční tržby (stabilní) | 275 000 Kč | 343 460 Kč | 412 000 Kč |
| Celkové var. N | -99 000 Kč | -123 645 Kč | -148 320 Kč |
| EBITDA/měs | +13 000 Kč | +56 815 Kč | +100 680 Kč |
| Break-even dosažen? | ANO (těsně) | ANO (M8) | ANO (M7) |
| Roční EBITDA | +156 000 Kč | +681 780 Kč | +1 208 160 Kč |

**Klíčový závěr:** Scénář C je odolný i při -20 % tržeb díky diverzifikaci výnosových kanálů (salonky a eventy mají vysoké marže a nízkou variabilní složku).

### Rizikové faktory — Scénář C

| Riziko | Pravděpodobnost | Dopad | Mitigace |
|---|---|---|---|
| Nedostatečná poptávka po salonkách | Střední | Střední | Aktivní oslovení firem v Borské průmyslové zóně, balíčky |
| Sezónní propad grilovacích akcí (zima) | Jistá | Nízký | Nahrazení vánočními akcemi, firemními večírky |
| Vysoký personální náklad (163 000 Kč fixní) | — | Vysoký | Flexibilní DPP tým, redukce v slabých měsících |
| Komplex řízení — příliš mnoho kanálů najednou | Střední | Střední | Silný vedoucí bistra, jasné SOP pro každý kanál |
| Město zpochybní komerční využití nad rámec sportu | Nízká | Kritický | Dokumentovat přínos pro komunitu, sportovní zaměření akcí |
| Konkurence — otevření nového gastro provozu v okolí | Nízká | Střední | Monopolní pozice v areálu, věrnostní program |

---

## Srovnávací přehled scénářů

| Ukazatel | A — Quick Start | B — Standard | C — Full Operace |
|---|---|---|---|
| **Období** | Měsíce 0–3 | Měsíce 3–6 | Měsíce 6–12 |
| **Jednorázová investice** | 138 000 Kč | +238 000 Kč (celkem 376 000) | +226 600 Kč (celkem 602 600) |
| **Fixní N/měs** | 50 000 Kč | 124 000 Kč | 163 000 Kč |
| **Food cost** | 38 % | 28 % | 26 % |
| **Příspěvková marže** | 57 % | 61–67 % | 61–69 % |
| **Break-even tržby** | 87 719 Kč | 185 075–203 279 Kč | 267 213 Kč |
| **Cílové měsíční tržby** | 89 000 Kč | 212 000 Kč | 343 000 Kč |
| **Provozní break-even** | Měsíc 3 | Měsíc 7 (celkově) | Měsíc 8 (celkově) |
| **Personál na směně** | 1 | 2–3 | 3–4 |
| **Celkem zaměstnanců** | 3–4 | 6–8 | 8–10 |
| **Roční EBITDA (stabilizováno)** | 20 000–85 000 Kč | 100 000–160 000 Kč | 550 000–730 000 Kč |
| **Odolnost (-20 % tržby)** | Ztrátový | Ztrátový | Stále ziskový |
| **Maximální kumulativní ztráta** | -160 000 Kč | -455 000 Kč | -685 000 Kč |
| **Payback (celkový)** | 20–24 měs. | 30–36 měs. | 18–22 měs. (od C) |

---

## Doporučení

### Optimální postup: Fázový přístup A → B → C

1. **Měsíce 0–3 (Quick Start A):** Investice 138 000 Kč, ověření trhu s polotovary. Klíčové KPI: 22+ zákazníků/den, provozní break-even do M3.

2. **Měsíce 3–6 (Standard B):** Doinvestice 238 000 Kč, nábor kuchaře, spuštění delivery. Klíčové KPI: 200 000+ Kč tržeb/měs, delivery 15+ objednávek/den.

3. **Měsíce 6–12 (Full Operace C):** Doinvestice 226 600 Kč, spuštění salonků, eventů, grilovacích akcí. Klíčové KPI: 340 000+ Kč tržeb/měs, 6+ akcí v saloncích/měs.

### Go/No-Go kritéria mezi fázemi

| Přechod | Podmínka pro GO | Podmínka pro STOP |
|---|---|---|
| A → B | Tržby M2–M3 > 80 000 Kč/měs, 20+ zákazníků/den | Tržby < 50 000 Kč/měs po 3 měsících |
| B → C | Tržby M5–M6 > 180 000 Kč/měs, delivery spuštěno | Tržby < 140 000 Kč/měs, kuchař nenalezen |

### Klíčové předpoklady úspěchu

1. **Turnajový catering je zásadní** — přidává 20 000–30 000 Kč/měs při minimálních dodatečných fixních nákladech
2. **Delivery je doplňkový kanál, ne základ** — provize 30 % dramaticky snižují marži; cílový podíl max. 20 % tržeb
3. **Salonky a eventy mají nejvyšší marži** (55–85 %) — aktivní prodej firemním klientům je klíčový od fáze C
4. **Energie zdarma = zásadní konkurenční výhoda** — food cost a personál jsou jediné velké nákladové položky
5. **Sezónní management** — letní propad (-30 %) vyžaduje plánování (kempy, venkovní akce, redukce personálu)

---

> **Zpracováno:** 2026-02-19
> **Podklady:** BISTRO_STRATEGIE.md (verze 1.0), provozni-plan-hala-krasovska-2026.md (verze 1.0)
> **Další kroky:** Prezentace klientovi → rozhodnutí o startu fáze A → zahájení náboru vedoucího bistra
