# PRD: Hala Krašovská — ERP/CRM Systém

> **Verze:** 1.2 | **Datum:** 2026-02-19 | **Zdroj dat:** Dotazník „Schůzka 16. 2. 2026" vyplněný klientem

---

## 1. Souhrn projektu

### Klient
- **Organizace:** Badmintonová Akademie Plzeň, z.s. (IČO: 07461216)
- **Sídlo:** Krašovská 32, 323 00 Plzeň-Bolevec
- **Statutární orgán:** Tomáš Knopp (provozní ředitel, OSVČ)
- **Provoz haly od:** leden 2023

### Kontext
Sportovní hala Krašovská je multifunkční sportovní areál vlastněný městem Plzeň, provozovaný spolkem BAP. Hala disponuje 9 badmintonovými kurty, víceúčelovou plochou 77×24 m, cvičebním sálem, saunou a bistrem. Město hradí energie výměnou za provozování dětských aktivit a kroužků.

### Hlavní bolesti (z dotazníku)
- Dotazník vyplňovali **2 různí lidé** ze 2 různých lokací (Plzeň + České Budějovice) — chybí jakýkoli centrální systém
- Bistro/restaurace je **pozastaveno** — nemají pokladní systém ani zaměstnance
- Platby pouze hotovost, převod, fakturace — **chybí terminál, QR, online platby**
- Rezervace přes externí systém iSport.cz — omezená kontrola
- Členská evidence ve specializovaném SW (EOS) — chybí integrace
- Turnaje týdně (50–100 hráčů) — registrace přes svazový web, chybí vlastní systém
- Žádné dotace (0 Kč) — potenciál pro grantové financování nevyužit

### Klíčová poznámka klienta
> _„náplň práce, čím začít, !!!E-shop, bistro - fastfood (burger, pizza)"_

---

## 2. Organizační struktura

| Role | Osoba | Typ |
|------|-------|-----|
| Provozní ředitel / manažer | Tomáš Knopp | OSVČ |
| Údržba a provoz | Martin Suttr | OSVČ |
| Recepce (3 dny/týden) | Paní na ZTP | DPP |
| Recepce (ostatní) | Studenti-brigádníci | DPP |
| Trenéři | 7 osob | DPP / fakturace |
| Externí spolupracovníci | 2 | OSVČ |
| Dobrovolníci | 5 | — |
| **HPP celkem** | **1** | — |

**Provozní doba:** 08:00–22:00, směnný provoz recepce
**Mzdy:** externí účetní firma
**Plánované rozšíření:** koordinátor akcí (PM)

---

## 3. Finance

| Ukazatel | Hodnota |
|-----------|---------|
| Roční obrat | 3,5 mil. Kč |
| Pronájem sportovišť | ~65 % příjmů |
| Turnaje a akce | ~25 % |
| Kurzy | ~10 % |
| Dotace | **0 Kč** |
| Účetní systém | Externí účetní (jiný) |

### Aktuální platební metody
Hotovost, bankovní převod, fakturace

### Požadované platební metody
- Platební terminál
- QR platba
- Kreditní systém / předplatné

---

## 4. Požadované moduly

Na základě vyplněných dat, frekvence editací a explicitních požadavků klienta seřazeno dle priority:

### 4.1 🔴 E-shop a prodej (NEJVYŠŠÍ PRIORITA)
> Klient explicitně označil `!!!E-shop` jako prioritu

**Aktuální stav:** Žádný online prodej
**Požadavky:**
- Prodej permanentek, kreditních balíčků, voucherů
- Vstupenky na akce a turnaje
- Merchandising (trička, mikiny)
- Badmintonové vybavení (rakety, košíčky, doplňky)
- Integrace s platební bránou (GoPay/Comgate/Stripe)
- Skladové hospodářství

**Nezodpovězené sekce** (nutno doplnit): sortiment, počet produktů, dodavatelé, doprava

### 4.2 🔴 Restaurace / Bistro — Fastfood modul
> Klient explicitně chce: _„bistro - fastfood (burger, pizza)"_

**Aktuální stav:** Pozastaveno, nevyužito. Plně vybavená restaurace, 55 míst.
**Provozní model:** Samoobslužný bufet, vlastní provoz haly
**Požadavky z dotazníku:**
- Objednávkový systém
- Denní menu online
- Skladové hospodářství (suroviny)
- Kalkulace jídel
- Propojení s pokladním systémem
- Rozvoz / takeaway
- Věrnostní program

**Stávající infrastruktura:** Smlouvy na vývoz olejů/odpadů, ŽL, zásobování (BigFood, Makro)
**Catering:** Zajišťují sami pro turnaje

### 4.3 🟠 Rezervační systém (rozšíření)

**Aktuální stav:** iSport.cz (externí)
**Typy rezervací:** Jednorázové (kurt/hodina), skupinové (kurzy, tréninky)
**Storno:** 12 h předem
**Integrace:** Google Calendar
**Problém:** Omezená kontrola, závislost na externím poskytovateli

**Doporučení:** Zvážit vlastní modul nebo hlubokou integraci s iSport API

### 4.4 🟠 Členství a CRM

**Aktuální stav:** 350 aktivních členů, EOS software, čipové RFID karty, pololetní příspěvky
**Požadavky:**
- Evidence kontaktních údajů
- Historie návštěv a rezervací
- Automatické upomínky (expirace členství)
- Email marketing / newsletter
- SMS notifikace
- Segmentace členů (sport, věk, aktivita)
- Věrnostní program / body
- Přehled plateb a pohledávek
- Rodinné účty

**Komunikační kanály:** Email, telefon, SMS, WhatsApp, Facebook/Instagram, web, nástěnka

### 4.5 🟡 Turnaje a akce

**Frekvence:** Týdně (!)
**Typy:** Klubové, regionální, celostátní, mezinárodní, mládežnické, firemní
**Účastníci:** 50–100 hráčů
**Aktuální systém:** Tournament software, registrace přes svazový web
**Požadavky:**
- Live výsledky a žebříčky
- Fotogalerie a záznamy

**Poznámka:** Tato sekce byla nejčastěji editována (10×), zejména klientem z Českých Budějovic

### 4.6 🟡 Aktivity a kroužky

**Aktuální sporty:** Badminton, florbal, gymnastika, futsal, bojové sporty
**Plánované:** Spinning, přednášky
**Evidence docházky:** Elektronická
**Chybí:** Registrační systém pro kroužky, online přihlašování

### 4.7 🟢 Finanční modul

**Priorita:** Integrace plateb + reporting
- Napojení na platební terminál a QR platby
- Kreditní systém / předplatné
- Export pro externího účetního
- Přehled příjmů dle zdroje (pronájem, turnaje, kurzy)

### 4.8 🟢 Marketing a komunikace

**Nezodpovězeno** — sekce prázdná, ale z ostatních odpovědí vyplývá potřeba:
- Web / CMS
- Newsletter systém (požadováno v CRM sekci)
- Správa sociálních sítí

### 4.9 🟢 IT infrastruktura

**Nezodpovězeno** — nutno doplnit:
- HW vybavení, síť, server/cloud
- Kamerový systém, zabezpečení
- Požadavky na on-premise vs cloud

### 4.10 🟢 Legislativa a GDPR

**Nezodpovězeno** — nutno doplnit:
- Stav GDPR compliance
- Zpracování osobních údajů (350+ členů, děti)
- Audit log (již implementováno v dotazníkovém systému)

---

## 5. Sportoviště a prostory

| Prostor | Detail |
|---------|--------|
| Badmintonové kurty | 9 ks, Taraflex povrch, 200 diváků, regulované osvětlení |
| Víceúčelová plocha | 77×24 m — basketbal, florbal, házená, volejbal (sítě strop-podlaha) |
| Cvičební sál | 9×9 m |
| Sauna | Parní, 10 osob, ochlazovací bazén + sprchy |
| Restaurace | 55 míst, plně vybavená, **nevyužitá** |
| Šatny | Kapacita 400 |
| Parkování | 50 venkovních míst, zdarma |
| Bezbariérovost | Plně bezbariérové |

**Plánované investice:** Zprovoznění restaurace, využití nevyužitých salonků
**Technické zázemí:** Teplo = parovod (Plzeňská teplárenská), elektřina hradí město

---

## 6. Datový model — audit trail

Z implementovaného audit logu vyplývá:

| Ukazatel | Hodnota |
|-----------|---------|
| Celkem editací | 42 |
| Období | 16.–17. 2. 2026 (2 dny) |
| Unikátní IP | 2 |
| Unikátní zařízení | 2 |

### Profil editujících

| # | Lokace | Platforma | Obrazovka | Editací | Sekce |
|---|--------|-----------|-----------|---------|-------|
| 1 | České Budějovice | Win32 | 1536×864 | 33× | turnaje, členství, finance, rezervace, aktivity, personál |
| 2 | Plzeň (PilsFree) | MacIntel | — | 9× | organizace, turnaje, cíle, finance, sportoviště |

**Závěr:** Klient č. 1 (ČB) je hlavní vyplňovatel, zaměřený na provozní moduly. Klient č. 2 (Plzeň) se soustředil na organizační strukturu a strategické cíle.

---

## 7. Nevyplněné sekce (nutno doplnit)

Tyto sekce dotazníku zůstaly **kompletně prázdné**:

- **E-shop** — paradoxně označen jako `!!!` priorita, ale sekce nevyplněna
- **Marketing a komunikace** — žádná data
- **IT infrastruktura** — žádná data
- **Legislativa a GDPR** — žádná data
- **Cíle a vize** — pouze poznámka, chybí strukturované odpovědi

**Doporučení:** Před zahájením vývoje uspořádat follow-up schůzku zaměřenou na tyto sekce.

---

## 8. Technická doporučení pro dev tým

### Architektura
- **Next.js 16** (App Router) — již běží dotazníkový systém na Vercel
- **Vercel Postgres (Neon)** — stávající DB
- **Lucide React** — ikonový systém
- **Tailwind CSS 4** — styling

### Navrhovaný tech stack pro ERP moduly
- **Platby:** Stripe nebo GoPay API
- **E-shop:** Vlastní implementace nebo integrace Shopify Storefront API
- **Restaurace POS:** Integrace s Dotykačka/Storyous nebo vlastní PWA
- **CRM:** Rozšíření stávající DB o members tabulku, napojení na EOS API (pokud existuje)
- **Turnaje:** Vlastní modul s real-time WebSocket pro live výsledky
- **Reservace:** iSport.cz API integrace nebo vlastní modul

### Prioritní pořadí implementace
1. **Platební infrastruktura** (terminál, QR, online) — blokuje e-shop i bistro
2. **E-shop** — explicitní priorita klienta
3. **Bistro/restaurace modul** — explicitní priorita klienta
4. **CRM rozšíření** — 350 členů, existující EOS data
5. **Turnajový modul** — týdenní frekvence, high-traffic
6. **Ostatní moduly** dle kapacity

---

## 9. Rizika a omezení

| Riziko | Dopad | Mitigace |
|--------|-------|----------|
| Pouze 1 HPP zaměstnanec | Omezená kapacita pro správu systému | Maximální automatizace, self-service portál |
| Nulové dotace | Omezený rozpočet | Phased rollout, MVP přístup |
| Bistro bez personálu | Modul se nezprovozní bez lidí | Řešit paralelně s náborem |
| Závislost na městě (energie) | Politické riziko | Dokumentovat dohodu |
| 2 lidé editují vzdáleně | Potřeba collaboration features | Implementováno (audit log) |
| Prázdné sekce dotazníku | Neúplné požadavky | Follow-up schůzka |

---

## 10. Implementovaný stav — E-shop (v1.0)

> Stav k 19. 2. 2026 — 5 sprintů dokončeno, deploy na Vercel

### 10.1 Základní e-shop (pre-sprint)
- Katalog produktů s kategoriemi (rakety, košíčky, oblečení, doplňky, permanentky, vouchery)
- Nákupní košík (localStorage) s množstevním ovládáním
- Checkout s platební bránou Comgate (produkční)
- Slevové kódy (procentuální i pevné)
- Admin CRUD pro produkty (obrázky, ceny v haléřích, aktivní/neaktivní)
- Správa objednávek se stavovým workflow: pending → paid → preparing → ready → completed / cancelled

### 10.2 Sprint 1 — POS Quick Sale
- **Rychlý prodej na recepci** — modální okno s gridem produktů, vyhledáváním, košíkem
- Platba hotovost / karta (bez Comgate) — objednávka se vytvoří rovnou jako dokončená
- API endpoint `/api/eshop/quick-sale` s autorizací pro recepci+
- Automatické odpočítání skladu při prodeji
- Badge typu platby v tabulce objednávek (Hotovost / Karta)

### 10.3 Sprint 2 — QR kódy
- **QR štítky na produkty** — stránka `/eshop/admin/qr` s výběrem produktů, generováním QR kódů a tiskovým layoutem (3 sloupce)
- QR kód = URL `/eshop/s/{product-uuid}` → redirect na produkt
- **QR skener v mobilu** — nativní `BarcodeDetector` API, kamera, scan guide overlay
- Integrace skeneru do POS modalu — sken přidá produkt do košíku
- CSS `@media print` optimalizace pro tisk štítků

### 10.4 Sprint 3 — Email notifikace
- **Resend SDK** pro transakční emaily
- Potvrzení objednávky zákazníkovi (HTML šablona s položkami, cenami, pickup info)
- Notifikace o nové objednávce na provozní email
- Odesílání po online platbě (checkout) i po Comgate callback (PAID)
- Lazy inicializace SDK (build-time kompatibilita bez env vars)

### 10.5 Sprint 4 — Skladové hospodářství + Shopify-style editor
- **Stránka Sklad** (`/eshop/admin/sklad`) — Shopify-inspirovaný editor s dvousloupcovým layoutem
- **Inline editace** — klik na číslo Skladem/Minimum → vstupní pole → Enter/blur uloží (PATCH API)
- **+/- adjustment buttons** — rychlá úprava ±1 kus bez otevírání editoru
- **Stock level bary** — barevný vizuální indikátor stavu (zelená/amber/červená)
- **Filtr** — Vše / Pod minimem + dropdown kategorie + fulltext vyhledávání
- **Správa kategorií** — pravý panel s editací, přejmenováním a mazáním kategorií
- DB tabulka `product_categories` s auto-seed 10 výchozích kategorií
- API: `PATCH /api/eshop/stock/[id]` (stock_quantity, stock_delta, low_stock_threshold)
- API: CRUD `/api/eshop/categories` + `/api/eshop/categories/[slug]`
- Optimistic update lokálního stavu při úpravách
- CSV export produktů pod minimem (BOM + středníkový separátor pro Excel CZ)
- **Badge v navigaci** — červený indikátor počtu produktů pod minimem
- `low_stock_threshold` sloupec v DB — konfigurovatelné minimum na produkt

### 10.6 Sprint 5 — KPI Dashboard
- **API `/api/eshop/dashboard`** — agregované SQL dotazy přes orders tabulku
- Tržby: dnes / týden / měsíc / rok (jen zaplacené objednávky)
- Progress bar k ročnímu cíli 350 000 Kč
- Mini bar chart denních tržeb za posledních 7 dní (hover tooltip)
- Top 5 produktů měsíce (množství + tržba) pomocí `jsonb_array_elements`
- Čekající objednávky panel (zaplaceno / příprava / k vydání)
- Integrace nad tabulkou objednávek na stránce `/eshop/admin/objednavky`

### 10.7 UX — Dropdown navigace
- **5 skupin místo 13 plochých tabů** — Dashboard (link), Projekty ▾, Provoz ▾, E-shop správa ▾, Správa ▾
- Dropdown menu s click-to-open, click-outside-to-close
- Aktivní skupina zvýrazněna modře (podle aktuální stránky)
- Low stock badge na skupině „E-shop správa"
- Viditelnost skupin respektuje user role a per-user section permissions

### 10.8 EOS — Checklist pro schůzku
- Interaktivní stránka `/eos` s 8 sekcemi a 32 otázkami
- Sekce: Základní info, Evidence členů, RFID karty, Platby, API/Integrace, Workflow, GDPR, Budoucnost
- Checkboxy s progress barem, inline poznámky, tisk
- Příprava na integraci se systémem správy členů (350 RFID karet)

### 10.9 Plánované sprinty

| Sprint | Popis | Stav |
|--------|-------|------|
| Sprint 6 | RFID kreditní systém — propojení s 350 čipovými kartami | Čeká na EOS rešerši |
| Sprint 7 | Turnajové pre-ordery — předobjednávky na akce | Plánován |

### 10.10 E-shop technické parametry

| Parametr | Hodnota |
|----------|---------|
| Platební brána | Comgate (produkční) |
| Email provider | Resend (volitelný, graceful degradation) |
| Měna | CZK (haléřové ukládání) |
| QR formát | URL s UUID produktu |
| Autorizace admin | NextAuth + role (admin/reception) |
| Roční cíl tržeb | 350 000 Kč |
| DB | Vercel Postgres (Neon) — JSONB pro položky objednávek |

---

## Přílohy

- **Zdrojová data:** `https://hala-krasovska.vercel.app/api/questionnaires/780348e1-313a-4f32-8bc4-1d78e2414c5d`
- **Audit log:** `https://hala-krasovska.vercel.app/api/audit`
- **Audit UI:** `https://hala-krasovska.vercel.app/audit`
- **Dotazníkový systém:** `https://hala-krasovska.vercel.app`
