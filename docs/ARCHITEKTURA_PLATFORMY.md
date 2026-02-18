# Hala Krasovska -- Architektura IT platformy

**Verze:** 1.0
**Datum:** 2026-02-18
**Autor:** Solution Architect
**Projekt:** ERP/CRM system pro Sportovni halu Krasovska, Plzen

---

## Obsah

1. [Prehled architektury platformy](#1-prehled-architektury-platformy)
2. [Datovy model](#2-datovy-model)
3. [Modul-by-modul specifikace](#3-modul-by-modul-specifikace)
4. [Platebni infrastruktura](#4-platebni-infrastruktura)
5. [Integrace se stavajicimi systemy](#5-integrace-se-stavajicimi-systemy)
6. [Bezpecnost a GDPR](#6-bezpecnost-a-gdpr)
7. [Provozni system](#7-provozni-system)
8. [Deployment a infrastruktura](#8-deployment-a-infrastruktura)
9. [Implementacni roadmapa](#9-implementacni-roadmapa)

---

## 1. Prehled architektury platformy

### 1.1 Rozhodnuti: Modularni monolit

**Doporuceni: Modularni monolit v Next.js 16 s jasne oddelenymi domenami.**

Zduvodneni:

- **Maly tym** (1--3 vyvojari) -- mikroservisy by prinesly neprimerou provozni slozitost
- **Stavajici zaklad** -- dotaznikovy system jiz bezi na Next.js 16 / Vercel Postgres, coz je overena a funkcni architektura
- **Sdilena databaze** -- vsechny moduly potrebuji pristup k clenum, platbam a rezervacim; mikroservisy by vyzadovaly slozite synchronizacni patterny
- **Vercel deployment** -- App Router podporuje Route Handlers jako de-facto API vrstvu, coz umoznuje jasne oddeleni backend logiky od UI
- **Evoluce** -- modularni monolit lze v budoucnu rozdelit na mikroservisy extrakci Route Handlers do samostatnych sluzeb

Kazdemu modulu odpovida:

| Vrstva | Umisteni |
|---|---|
| API Routes | `src/app/api/{modul}/` |
| Business logika | `src/lib/{modul}/` |
| Typove definice | `src/types/{modul}.ts` |
| UI stranky | `src/app/(platform)/{modul}/` |
| UI komponenty | `src/components/{modul}/` |
| DB migrace | `src/lib/db/{modul}.ts` |

### 1.2 Build vs Buy analyza

| Modul | Doporuceni | Zduvodneni |
|---|---|---|
| **E-shop** | BUILD (interni) | Specificke produkty (permanentky, kredity, vouchery) nelze efektivne resit v Shoptet/WooCommerce; integrace by byla slozitejsi nez vlastni implementace |
| **Restaurace POS** | BUY: **Dotykacka** | Overene ceske POS reseni s API; certifikace pro fiskalizaci; HW terminaly |
| **CRM** | BUILD (interni) | 350 clenu -- specializovane CRM (Salesforce, HubSpot) je predrazene; vlastni reseni navazane na clenstvi a rezervace |
| **Rezervace** | HYBRID: zachovat **iSport.cz** + interni vrstva | iSport.cz ma existujici zakaznicku zakladnu; interni wrapper pro synchronizaci dat |
| **Turnaje** | BUILD (interni) | Specificke pozadavky (BWF format, live vysledky); zadne dostupne SaaS pro cesky badminton |
| **Aktivity** | BUILD (interni) | Primo navazano na CRM a rezervace; jednoduchy modul |
| **Finance** | HYBRID: interni platebni vrstva + export do **Pohoda/FlexiBee** | Vlastni credit system a platebni gateway; ucetni export v ISDOC formatu |
| **Reporting** | BUILD (interni) -- **jiz castecne existuje** | Dashboard a analyza uz bezi; rozsireni o dalsi moduly |

### 1.3 Systemovy diagram (landscape)

```
+------------------------------------------------------------------+
|                        KLIENTI                                    |
|                                                                   |
|   [Webovy prohlizec]    [Mobilni prohlizec]    [POS Terminal]     |
|        (clenove,             (treneri,          (recepce,         |
|        verejnost)            spravci)           restaurace)       |
+--------------|--------------------|--------------------|----------+
               |                    |                    |
               v                    v                    v
+------------------------------------------------------------------+
|                     VERCEL EDGE NETWORK                           |
|                                                                   |
|   +----------------------------------------------------------+   |
|   |              Next.js 16 App Router                        |   |
|   |                                                           |   |
|   |  +-- (platform) --------------------------------+        |   |
|   |  | /eshop    /crm     /rezervace  /turnaje      |        |   |
|   |  | /aktivity /finance /restaurace /reporting     |        |   |
|   |  +----------------------------------------------+        |   |
|   |                                                           |   |
|   |  +-- /api -------------------------------------------+   |   |
|   |  | /api/eshop/*     /api/crm/*      /api/reservations/*| |   |
|   |  | /api/tournaments/* /api/activities/* /api/finance/* | |   |
|   |  | /api/restaurant/*  /api/reports/*   /api/auth/*    | |   |
|   |  | /api/webhooks/*    /api/audit/*                     | |   |
|   |  +----------------------------------------------------+  |   |
|   |                                                           |   |
|   |  +-- /lib -------------------------------------------+   |   |
|   |  | eshop.ts  crm.ts  reservations.ts  tournaments.ts |   |   |
|   |  | activities.ts  finance.ts  audit.ts  auth.ts       |   |   |
|   |  +----------------------------------------------------+  |   |
|   +----------------------------------------------------------+   |
+------------------------------------------------------------------+
               |              |              |
               v              v              v
+------------------------------------------------------------------+
|                     DATOVA VRSTVA                                  |
|                                                                   |
|  +-----------------+  +------------------+  +------------------+  |
|  | Vercel Postgres |  | Vercel Blob      |  | Vercel KV        |  |
|  | (Neon)          |  | Storage          |  | (Redis)          |  |
|  |                 |  |                  |  |                  |  |
|  | - cleni         |  | - produktove     |  | - session cache  |  |
|  | - rezervace     |  |   fotky          |  | - rate limiting  |  |
|  | - objednavky    |  | - galerie        |  | - realtime data  |  |
|  | - platby        |  |   turnaju        |  | - cart data      |  |
|  | - turnaje       |  | - dokumenty      |  |                  |  |
|  | - aktivity      |  |                  |  |                  |  |
|  | - audit_log     |  |                  |  |                  |  |
|  +-----------------+  +------------------+  +------------------+  |
+------------------------------------------------------------------+
               |              |              |
               v              v              v
+------------------------------------------------------------------+
|                   EXTERNI INTEGRACE                               |
|                                                                   |
|  +-----------+  +----------+  +---------+  +------------------+  |
|  | iSport.cz |  | Comgate  |  | Dotycka |  | SMTP             |  |
|  | (rezervace)|  | (platby) |  | (POS)   |  | (Resend/         |  |
|  |           |  |          |  |         |  |  Mailgun)         |  |
|  +-----------+  +----------+  +---------+  +------------------+  |
|                                                                   |
|  +-----------+  +----------+  +---------+  +------------------+  |
|  | EOS       |  | ISDOC    |  | Czech   |  | SMS              |  |
|  | (migrace) |  | (export) |  | QR std  |  | (GoSMS.cz)      |  |
|  +-----------+  +----------+  +---------+  +------------------+  |
+------------------------------------------------------------------+
```

### 1.4 Mapa integraci

| Externi system | Typ integrace | Smer | Priorita |
|---|---|---|---|
| **iSport.cz** | REST API / scraping + iframe embed | Obousmerny | Vysoka |
| **EOS software** | Jednorazova migrace CSV/XML | Import | Vysoka (jednor.) |
| **Comgate** | REST API v1.0 | Odchozi + webhook | Kriticka |
| **Dotykacka** | REST API v2 | Obousmerny | Stredni |
| **Ucetni system** | ISDOC XML export | Odchozi | Stredni |
| **Resend** | REST API | Odchozi | Vysoka |
| **GoSMS.cz** | REST API | Odchozi | Nizka |
| **Google Calendar** | CalDAV / Google API v3 | Odchozi | Nizka |

---

## 2. Datovy model

### 2.1 Core entity a vztahy

```
+------------------+       +-------------------+       +------------------+
|     members      |       |    reservations    |       |    court_slots   |
|------------------|       |-------------------|       |------------------|
| id (UUID PK)     |<---+  | id (UUID PK)      |------>| id (UUID PK)     |
| eos_legacy_id    |    |  | member_id (FK)     |       | court_id (FK)    |
| first_name       |    |  | court_slot_id (FK) |       | date             |
| last_name        |    |  | status             |       | start_time       |
| email (UNIQUE)   |    |  | type               |       | end_time         |
| phone            |    |  | source             |       | price_tier       |
| date_of_birth    |    |  | isport_ref         |       | is_blocked       |
| rfid_card_number |    |  | payment_id (FK)    |       +------------------+
| membership_type  |    |  | created_at         |              |
| membership_until |    |  +-------------------+               |
| credit_balance   |    |                                      |
| family_group_id  |    +-----+                    +-----------+
| avatar_url       |          |                    |
| gdpr_consent_at  |    +-----|--------------------|-----------+
| tags JSONB       |    |     |    courts          |           |
| metadata JSONB   |    |     |    --------------- |           |
| created_at       |    |     |    | id (UUID PK) |<----------+
| updated_at       |    |     |    | name         |
+------------------+    |     |    | sport_type   |
        |               |     |    | capacity     |
        |               |     |    +------------- |
        |               |     |
   +----+----+          |     |
   |         |          |     |
   v         v          v     v
+-------+ +--------+ +-------------------+    +------------------+
|family | |member  | |     orders         |    |    products      |
|groups | |visits  | |-------------------|    |------------------|
|-------| |--------| | id (UUID PK)      |--->| id (UUID PK)     |
| id PK | | id PK  | | member_id (FK)    |    | name             |
| name  | | member | | status            |    | slug (UNIQUE)    |
+-------+ | _id FK | | total_amount      |    | type             |
          | type   | | discount_amount   |    | category         |
          | ref_id | | payment_id (FK)   |    | price            |
          | meta   | | billing_info JSONB|    | description      |
          | created| | shipping_info JSONB|   | images JSONB     |
          +--------+ | items JSONB       |    | stock_quantity   |
                      | source            |    | metadata JSONB   |
                      | created_at        |    | is_active        |
                      +-------------------+    +------------------+
                               |
                               v
                      +-------------------+
                      |    payments        |
                      |-------------------|
                      | id (UUID PK)      |
                      | member_id (FK)    |
                      | amount            |
                      | currency          |
                      | method            |
                      | gateway           |
                      | gateway_ref       |
                      | status            |
                      | metadata JSONB    |
                      | created_at        |
                      +-------------------+

+-------------------+    +-------------------+    +-------------------+
|    tournaments     |    |  tournament_      |    |    tournament_    |
|                   |    |  participants     |    |    matches        |
|-------------------|    |-------------------|    |-------------------|
| id (UUID PK)      |    | id (UUID PK)      |    | id (UUID PK)      |
| name              |    | tournament_id FK  |    | tournament_id FK  |
| type              |    | member_id FK      |    | round             |
| sport             |    | seed              |    | court_id FK       |
| date_from         |    | group_name        |    | player1_id FK     |
| date_to           |    | status            |    | player2_id FK     |
| max_participants  |    | registration_fee  |    | score JSONB       |
| registration_until|    | payment_id FK     |    | status            |
| rules JSONB       |    +-------------------+    | scheduled_at      |
| status            |                              +-------------------+
| metadata JSONB    |
+-------------------+

+-------------------+    +-------------------+
|    activities      |    |  activity_        |
|                   |    |  enrollments      |
|-------------------|    |-------------------|
| id (UUID PK)      |    | id (UUID PK)      |
| name              |    | activity_id FK    |
| type              |    | member_id FK      |
| trainer_id FK     |    | status            |
| schedule JSONB    |    | payment_id FK     |
| capacity          |    | attendance JSONB  |
| price_per_session |    | created_at        |
| price_per_month   |    +-------------------+
| age_group         |
| description       |
| is_active         |
+-------------------+

+-------------------+
|  credit_           |
|  transactions      |
|-------------------|
| id (UUID PK)      |
| member_id FK      |
| amount            |
| type              |
| reference_type    |
| reference_id      |
| balance_after     |
| note              |
| created_at        |
+-------------------+
```

### 2.2 Rozhodnuti JSONB vs normalizovane tabulky

| Entita / atribut | Rozhodnuti | Zduvodneni |
|---|---|---|
| `members.tags` | **JSONB** | Flexibilni stitky pro segmentaci; nepotrebuje relacni integritni omezeni |
| `members.metadata` | **JSONB** | Rozsiritelna metadata (sport preference, poznamky); schema se bude menit |
| `orders.items` | **JSONB** | Snimek objednanych polozek v case objednavky (denormalizace zamerne -- ucetni immutabilita) |
| `orders.billing_info` | **JSONB** | Fakturacni adresa je snapshot, ne reference |
| `orders.shipping_info` | **JSONB** | Dorucovaci info je snapshot |
| `tournaments.rules` | **JSONB** | Pravidla turnaje jsou strukturovana, ale variabilni dle typu |
| `tournament_matches.score` | **JSONB** | Sety/gemy maji ruznou strukturu dle sportu |
| `activities.schedule` | **JSONB** | Rozvrh (den, cas, opakování) -- flexibilni schema |
| `activity_enrollments.attendance` | **JSONB** | Pole dat dochazky -- `{dates: ["2026-02-18", ...], present: [true, ...]}` |
| `payments.metadata` | **JSONB** | Gateway-specificke informace (GoPay vs Comgate maji ruzne response formaty) |
| `products.images` | **JSONB** | Pole URL obrazku `["url1", "url2"]` |
| `products.metadata` | **JSONB** | Atributy specificke pro typ produktu (velikost, barva, EAN...) |
| `court_slots` | **Normalizovana tabulka** | Vysoky pocet dotazu s filtrem dle data/casu; index-friendly |
| `credit_transactions` | **Normalizovana tabulka** | Financni ledger -- musi byt audit-safe, immutable, s integritnimi omezenimi |
| `payments` | **Normalizovana tabulka** | Financni data -- relacni integrita kriticka |
| `reservations` | **Normalizovana tabulka** | Caste joiny s cleny a kurty; casove dotazy |

### 2.3 Indexy (klicove)

```sql
-- Vyhledavani clenu
CREATE INDEX idx_members_email ON members (email);
CREATE INDEX idx_members_rfid ON members (rfid_card_number) WHERE rfid_card_number IS NOT NULL;
CREATE INDEX idx_members_family ON members (family_group_id) WHERE family_group_id IS NOT NULL;
CREATE INDEX idx_members_membership ON members (membership_type, membership_until);

-- Rezervace
CREATE INDEX idx_reservations_member ON reservations (member_id);
CREATE INDEX idx_reservations_slot ON reservations (court_slot_id);
CREATE INDEX idx_reservations_date ON court_slots (date, start_time);
CREATE INDEX idx_court_slots_available ON court_slots (date, is_blocked) WHERE is_blocked = false;

-- Objednavky a platby
CREATE INDEX idx_orders_member ON orders (member_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_payments_member ON payments (member_id);
CREATE INDEX idx_payments_gateway_ref ON payments (gateway_ref);

-- Kredit
CREATE INDEX idx_credit_transactions_member ON credit_transactions (member_id, created_at DESC);

-- Turnaje
CREATE INDEX idx_tournament_matches_tournament ON tournament_matches (tournament_id, round);
CREATE INDEX idx_tournament_participants_tournament ON tournament_participants (tournament_id);

-- Full-text search na cleny (cesky slovnik)
CREATE INDEX idx_members_fulltext ON members USING GIN (
  to_tsvector('czech', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, ''))
);
```

---

## 3. Modul-by-modul specifikace

### 3.1 E-shop (PRIORITA 1)

**Rozhodnuti: BUILD -- vlastni implementace v Next.js**

Zduvodneni: Sortiment neni klasicky e-commerce (fyzicke zbozi). Klicove produkty jsou **permanentky, kreditni balicky, vouchery, vstupenky na turnaje** -- to vyzaduje primo integraci s kreditnim systemem, CRM a rezervacemi. Shoptet/WooCommerce by znamenal druhou databazi, samostatne ucty a slozitou synchronizaci.

**Specificke ceske produkty zvazovane a zamitnuté:**
- **Shoptet** -- zamitnut: mesicni poplatky 500-2000 Kc, ale hlavne nemoznost prodavat "permanentky" jako nabiti kreditu do interniho systemu bez custom pluginu
- **WooCommerce** -- zamitnut: vyzadoval by druhy server (PHP/WordPress), duplicitni uzivatele
- **Upgates** -- zamitnut: podobne jako Shoptet, predrazene pro <200 produktu

**API pristup:**
- Route Handlers v `src/app/api/eshop/`
- Endpointy: `products`, `cart`, `orders`, `checkout`, `webhooks/payment`

**Klicove stranky:**

| Stranka | Popis | Route |
|---|---|---|
| Katalog produktu | Grid s filtrovanim dle kategorii | `/eshop` |
| Detail produktu | Popis, galerie, varianta, tlacitko do kosiku | `/eshop/[slug]` |
| Kosik | Prehled polozek, slevovy kod, vyber platby | `/eshop/kosik` |
| Checkout | Fakturacni udaje, vyber dopravy, platba | `/eshop/pokladna` |
| Moje objednavky | Historie objednavek clena | `/profil/objednavky` |
| Admin: produkty | CRUD sprava produktu | `/admin/eshop/produkty` |
| Admin: objednavky | Prehled a sprava objednavek | `/admin/eshop/objednavky` |

**Datove toky:**

```
Zakaznik -> [Katalog] -> [Kosik (Vercel KV)] -> [Checkout]
    -> [Comgate API] -> [Webhook callback]
    -> [Payment potvrzena] -> [Order status update]
    -> [Kredit nabiti / voucher vygenerovan / fyzicke zbozi k odeslani]
    -> [ISDOC faktura vygenerovana] -> [Email s potvrzenim]
```

**Typy produktu:**

| Typ | Chovani po zaplaceni |
|---|---|
| `pass` (permanentka) | Nabiti kreditniho uctu, vytvoreni opakujicich se rezervaci |
| `credit` (kredit) | Nabiti kreditniho uctu o danou castku |
| `voucher` (poukaz) | Generovani unikatniho kodu s expiraci |
| `ticket` (vstupenka) | Registrace na turnaj/akci, QR kod pro vstup |
| `physical` (zbozi) | Spusteni fulfillment procesu (osobni odber / doruceni) |
| `merch` (merchandising) | Jako physical, ale s moznosti personalzace (potisk) |

### 3.2 Restaurace POS

**Rozhodnuti: BUY -- Dotykacka Cloud POS**

Zduvodneni: Dotykacka je cesky POS system s plnou certifikaci pro EET/fiskalizaci, HW terminaly, tiskarny uctenek a integraci s platebnimi terminaly. Vlastni vyvoj POS systemu pro restauraci je neefektivni a regulacne narocny.

**Specificke ceske produkty zvazovane:**
- **Dotykacka** (doporuceno): cena od 349 Kc/mesic, REST API v2, integrace s terminaly, cloud sprava
- **Storyous**: drazsi (od 990 Kc/mes), lepsi pro velke restaurace, predrazene pro bistro
- **iKelp**: levnejsi, ale slabsi API, omezena podpora
- **Markeeta**: dobra alternativa, ale Dotykacka ma sirsi ekosystem

**API integrace s Dotykacka:**

```
Dotykacka REST API v2 (https://api.dotykacka.cz/v2/)

Integracni body:
1. Synchronizace produktu (menu polozky) -> GET /products
2. Nacitani objednavek -> GET /orders
3. Denni trzba -> GET /reports/sales
4. Webhook na novou objednavku -> POST /webhooks
5. Propojeni clena -> vlozeni clenskeho ID do objednavky
```

**Klicove stranky (v nasi platforme):**

| Stranka | Popis |
|---|---|
| Denni menu | Verejne zobrazeni denniho menu s cenami |
| Online objednavka | Objednani jidla z menu (takeaway/rozvoz) |
| Admin: menu | Sprava denniho menu (sync z Dotykacky) |
| Admin: statistiky | Prehled trzeb z restaurace |

**Datove toky:**

```
Dotykacka POS (recepce/kuchyne) -> [Webhook] -> [Nase API]
    -> [Aktualizace trzeb v dashboardu]
    -> [Propojeni platby s clenem (pokud identifikovan)]

Nase platforma -> [Dotykacka API] -> [Online objednavka vytvorena v POS]
```

### 3.3 CRM

**Rozhodnuti: BUILD -- interni CRM modul**

Zduvodneni: 350 clenu je prilis malo pro enterprise CRM (Salesforce, HubSpot). Vlastni modul primo navazany na clenstvi, rezervace a platby je efektivnejsi. HubSpot Free by mohl byt alternativa, ale duplicita dat a absence integrace s RFID/EOS je limitujici.

**API pristup:**
- `src/app/api/crm/members/` -- CRUD clenu
- `src/app/api/crm/segments/` -- segmentace
- `src/app/api/crm/campaigns/` -- email/SMS kampane
- `src/app/api/crm/families/` -- rodinne ucty

**Klicove stranky:**

| Stranka | Popis |
|---|---|
| Seznam clenu | Tabulka s filtrovanim, vyhledavanim, tagy |
| Detail clena | 360 pohled: udaje, navstevy, platby, rezervace, aktivity |
| Segmentace | Vytvareni segmentu dle kriterii (sport, vek, aktivita, utrata) |
| Kampane | Editor email/SMS kampani s vyberem segmentu |
| Rodinne ucty | Sprava rodinnich skupin, sdileny kredit |
| Vernostni program | Prehled bodu, pravidla sbrani, odmeny |
| Import/export | CSV import, GDPR export, hromadne operace |

**Segmentacni kriteria:**

```typescript
interface SegmentFilter {
  sport?: string[];              // badminton, volejbal, gymnastika...
  age_group?: string[];          // child, teen, adult, senior
  membership_type?: string[];    // basic, premium, vip
  membership_active?: boolean;
  min_visits_last_30d?: number;
  max_visits_last_30d?: number;
  min_total_spent?: number;
  max_total_spent?: number;
  registered_after?: string;     // ISO date
  registered_before?: string;
  tags_include?: string[];
  tags_exclude?: string[];
  has_email?: boolean;
  has_phone?: boolean;
}
```

**Email marketing stack:**
- **Resend** (doporuceno): 3000 emailu/mesic zdarma, cesky DKIM/SPF setup, React Email sablony
- Alternativa: **Mailgun** (levnejsi na objemu, ale slozitejsi setup)

**SMS stack:**
- **GoSMS.cz**: cesky operator, cena ~0.70 Kc/SMS, REST API, cesky DPH

### 3.4 Rezervace

**Rozhodnuti: HYBRID -- zachovat iSport.cz + interni synchronizacni vrstva**

Zduvodneni: iSport.cz ma existujici zakaznicke rozhrani, ktere clenove znaji. Uplna nahradu provedeme az ve Fazi 3, po overeni interniho systemu.

**Faze implementace:**

| Faze | Pristup |
|---|---|
| Faze 1 | iSport.cz embed (iframe) na webu + manualni sync |
| Faze 2 | API polling iSport.cz -> interni cache -> zobrazeni v platforme |
| Faze 3 | Vlastni rezervacni modul s migracni z iSport.cz |

**API pristup (Faze 2-3):**
- `src/app/api/reservations/` -- CRUD rezervaci
- `src/app/api/reservations/slots/` -- dostupne sloty
- `src/app/api/reservations/sync/` -- iSport synchronizace (cron)

**Klicove stranky:**

| Stranka | Popis |
|---|---|
| Kalendar rezervaci | Tydenni/denni pohled na vsechny kurty |
| Rezervacni formular | Vyber kurtu, casu, platby |
| Moje rezervace | Prehled aktivnich a minulych rezervaci clena |
| Admin: sprava slotu | Blokovani, cenova pravidla, permanentky |
| Admin: storno | Sprava zruseni a vraceni plateb |

**Datove toky:**

```
Clen -> [Kalendar] -> [Vyber slotu] -> [Overeni dostupnosti]
    -> [Platba (kredit/karta/hotovost)] -> [Potvrzeni]
    -> [Email/SMS notifikace] -> [Google Calendar (volitelne)]

iSport.cz -> [Sync job (kazdych 15 min)] -> [Interni DB]
    -> [Zobrazeni v platforme]
```

**Cenova pravidla engine:**

```typescript
interface PricingRule {
  id: string;
  court_type: string;          // badminton, viceucel, sal
  day_of_week: number[];       // 0=Ne, 1=Po, ..., 6=So
  time_from: string;           // "06:00"
  time_to: string;             // "22:00"
  tier: "peak" | "off_peak" | "weekend";
  base_price: number;          // Kc za hodinu
  member_discount_pct: number; // sleva pro cleny (%)
  pass_deduction: number;      // kolik kreditu strhne permanentka
  valid_from: string;          // ISO date
  valid_to: string | null;
}
```

### 3.5 Turnaje

**Rozhodnuti: BUILD -- interni turnajovy modul**

Zduvodneni: Specificke pozadavky na badmintonove turnaje (BWF format, skupiny + pavouk, seeding, mezinarodni hrace) nejsou pokryty zadnym dostupnym SaaS. Tournament Planner je offline desktop aplikace bez API.

**API pristup:**
- `src/app/api/tournaments/` -- CRUD turnaju
- `src/app/api/tournaments/[id]/participants/` -- registrace
- `src/app/api/tournaments/[id]/draw/` -- los a skupiny
- `src/app/api/tournaments/[id]/matches/` -- zapasy a vysledky
- `src/app/api/tournaments/[id]/rankings/` -- zebricek

**Klicove stranky:**

| Stranka | Popis |
|---|---|
| Prehled turnaju | Nadchazejici a minule turnaje |
| Detail turnaje | Info, registrace, vysledky, fotogalerie |
| Live vysledky | Realtime aktualizace skore (SSE/polling) |
| Pavouk / skupiny | Vizualizace turnajoveho formatu |
| Zebricek | Celkovy zebricek hracu (ELO/bodovy system) |
| Fotogalerie | Fotky z turnaje (Vercel Blob Storage) |
| Admin: sprava | Vytvareni turnaju, los, zadavani vysledku |
| Admin: rozhodci | Prirazeni rozhodcich ke kurtum |

**Datove toky:**

```
Admin -> [Vytvoreni turnaje] -> [Otevreni registrace]
    -> Hraci -> [Online registrace + platba]
    -> Admin -> [Uzavreni registrace] -> [Automaticky los]
    -> [Generovani skupin + pavouku]
    -> Rozhodci -> [Zadavani vysledku v realnm case]
    -> [SSE broadcast] -> [Live vysledky na webu]
    -> [Automaticky postup do dalsiho kola]
    -> [Finalni zebricek] -> [Tisk diplomu (PDF)]
```

**Live vysledky -- technicka implementace:**

```typescript
// Server-Sent Events endpoint
// src/app/api/tournaments/[id]/live/route.ts

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Poll DB kazdych 3 sekundy pro zmeny
      const interval = setInterval(async () => {
        const matches = await getUpdatedMatches(id);
        const data = `data: ${JSON.stringify(matches)}\n\n`;
        controller.enqueue(encoder.encode(data));
      }, 3000);

      request.signal.addEventListener("abort", () => clearInterval(interval));
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

### 3.6 Aktivity a krouzky

**Rozhodnuti: BUILD -- interni modul**

**API pristup:**
- `src/app/api/activities/` -- CRUD aktivit
- `src/app/api/activities/[id]/enrollments/` -- prihlasovani
- `src/app/api/activities/[id]/attendance/` -- dochazka

**Klicove stranky:**

| Stranka | Popis |
|---|---|
| Rozvrh aktivit | Tydenni pohled s filtrovanim dle sportu/veku |
| Detail aktivity | Popis, trener, kapacita, cena, prihlaseni |
| Online registrace | Formular s platbou za kurz/pololeti |
| Trenersky pohled | Dochazka, seznam ucastniku, poznamky |
| Rodicovsky portal | Prehled krouzku deti, platby, dochazka |
| Admin: sprava | Vytvareni aktivit, prirazeni treneru |
| Cekaci listina | Automaticke zarazeni pri uvolneni mista |

**Datove toky:**

```
Rodic/clen -> [Rozvrh] -> [Vyber aktivity] -> [Registrace]
    -> [Platba (mesicne / pololetne)] -> [Potvrzeni]

Trener -> [Trenersky pohled] -> [Oznaceni dochazky]
    -> [Automaticke upozorneni rodicum pri absenci]

System -> [Cekaci listina check] -> [Misto se uvolnilo]
    -> [Email/SMS oznameni] -> [Automaticke prihlaseni / potvrzeni]
```

### 3.7 Finance

**Rozhodnuti: HYBRID -- interni platebni vrstva + ISDOC export**

**API pristup:**
- `src/app/api/finance/payments/` -- prehled plateb
- `src/app/api/finance/credit/` -- kreditni system
- `src/app/api/finance/invoices/` -- faktury (ISDOC generovani)
- `src/app/api/finance/reports/` -- financni reporty
- `src/app/api/finance/webhooks/comgate/` -- platebni webhook

**Klicove stranky:**

| Stranka | Popis |
|---|---|
| Prehled plateb | Tabulka vsech plateb s filtrovanim |
| Kreditni ucet | Stav kreditu clena, historie transakci |
| Nabiti kreditu | Vyber castky, platba, automaticke nabiti |
| Fakturace | Generovani a odesilani faktur (ISDOC) |
| Financni dashboard | Grafy trzeb, KPI, porovnani obdobi |
| Admin: vraceni | Sprava refundu a kreditnich korekci |
| Export ucetnictvi | ISDOC XML export pro ucetni |

**Kreditni system -- design:**

```typescript
// Kreditni ucet je soucast tabulky members (credit_balance)
// Kazda operace generuje zaznam v credit_transactions

type CreditTransactionType =
  | "topup_card"       // nabiti kartou
  | "topup_transfer"   // nabiti prevodem
  | "topup_cash"       // nabiti hotovosti
  | "topup_voucher"    // nabiti voucherem
  | "deduction_reservation" // strzeni za rezervaci
  | "deduction_eshop"  // strzeni za nakup v eshopu
  | "deduction_activity" // strzeni za aktivitu
  | "refund"           // vraceni
  | "correction"       // manualni korekce (admin)
  | "expiration";      // expirace kreditu (volitelne)

// Pravidlo: credit_balance = SUM(credit_transactions.amount WHERE member_id = ?)
// Balance se drzi i v members tabulce pro rychle cteni (denormalizovano)
// Rekoncialiace kazdou noc: porovnani balance vs SUM(transactions)
```

### 3.8 Reporting

**Rozhodnuti: BUILD -- rozsireni stavajiciho systemu**

Stavajici stav: Dashboard, analysis, SWOT a project tracking jiz existuji v kodu (`/dashboard`, `/analysis`, `/projects`, `/audit`). Tento modul je rozsireni o metriky z novych modulu.

**API pristup:**
- Stavajici `src/app/api/dashboard/[questionnaireId]/` -- rozsireni
- Novy `src/app/api/reports/` -- generovani reportu
- Novy `src/app/api/reports/kpi/` -- KPI metriky

**Klicove stranky:**

| Stranka | Popis |
|---|---|
| Dashboard (stavajici) | Rozsireni o financni a provozni metriky |
| KPI prehled | Klicove ukazatele: obsazenost, trzby, retence |
| Report builder | Uzivatelsky nastavitelne reporty s filtry |
| Export reportu | PDF/CSV/Excel export |
| Audit log (stavajici) | Jiz implementovan -- rozsireni o nove moduly |

**KPI metriky:**

| KPI | Vzorec | Zdroj |
|---|---|---|
| Obsazenost kurtu | rezervovane_sloty / celkove_sloty * 100 | reservations + court_slots |
| Mesicni trzby | SUM(payments.amount) WHERE status='completed' | payments |
| Retence clenu | cleni_aktivni_tento_mesic / cleni_aktivni_minuly_mesic | member_visits |
| Prumerna utrata/clen | celkove_trzby / pocet_aktivnich_clenu | payments + members |
| Churn rate | cleni_odchozi / celkem_clenu * 100 | members |
| Konverzni pomer e-shop | dokoncene_objednavky / navstevy_eshopu | orders + analytics |
| Obsazenost aktivit | prihlaseni / kapacita * 100 | activities + enrollments |
| NPS (volitelne) | % promoters - % detractors | ankety |

---

## 4. Platebni infrastruktura

### 4.1 Porovnani platebnich bran pro cesky trh

| Kritrium | **Comgate** | **GoPay** | **Stripe** |
|---|---|---|---|
| **Cesky trh** | Nativni ceska spolecnost | Ceska spolecnost | Globalni, CZ podpora |
| **Poplatky** | 1.1-1.5% + 3 Kc (karta) | 1.3-1.9% + 0 Kc | 1.5% + 5.50 Kc |
| **QR platby** | Ano (cesky standard) | Ano | Ne (pouze Stripe QR, ne cesky standard) |
| **Apple/Google Pay** | Ano | Ano | Ano |
| **Bankovni prevody** | Ano (ceske banky) | Ano | Ano (omezene) |
| **Opakujici se platby** | Ano | Ano | Ano |
| **API kvalita** | Dobra (REST) | Dobra (REST) | Vynikajici (REST + SDK) |
| **Dokumentace** | Cesky, strucna | Cesky, dobra | Anglicky, vynikajici |
| **Onboarding** | 2-5 dnu | 3-7 dnu | 1-3 dny |
| **ISDOC podpora** | Ne (externi) | Ne (externi) | Ne (externi) |
| **Spolek (z.s.) podpora** | Ano | Ano | Komplikovane (vyzaduje IBANy, overovani) |
| **Min. mesicni poplatek** | 0 Kc | 0 Kc | 0 Kc |

**Doporuceni: Comgate jako primarni brana.**

Zduvodneni:
1. Nejnizsi poplatky na ceskem trhu pro objemy sportovni haly
2. Nativni podpora ceskeho QR standardu pro platby
3. Snadny onboarding pro spolek (z.s.)
4. Ceska spolecnost s ceskou podporou
5. Podpora vsech pozadovanych metod (karta, prevod, QR, Apple Pay)

**Alternativni varianta:** GoPay jako sekundarni brana pro redundanci.

### 4.2 Platebni terminal (hardware)

**Doporuceni: SumUp Air nebo Comgate terminal**

| Terminal | Cena | Poplatek | Pripojeni | Vhody |
|---|---|---|---|---|
| **SumUp Air** | 799 Kc (jednorazove) | 1.49% | Bluetooth | Nizka vstupni cena, mobilni |
| **Comgate Terminal** | Pronajem ~300 Kc/mes | 1.1-1.5% | Wi-Fi/LAN | Sjednoceni s online brannou |
| **mPOS Worldline** | Pronajem ~500 Kc/mes | individualni | LAN | Bankove reseni, EET ready |

**Doporuceni pro Halu Krasovska:**
- **Recepce**: Comgate terminal (pevny, Wi-Fi/LAN, integrace s platformou)
- **Restaurace**: Dotykacka platebni terminal (soucst POS)
- **Mobilni (turnaje)**: SumUp Air (prenosny, Bluetooth k telefonu/tabletu)

### 4.3 QR platby -- cesky standard (SPD)

Implementace podle ceskeho standardu Short Payment Descriptor (SPD) dle CNB:

```typescript
// src/lib/finance/qr-payment.ts

interface QRPaymentData {
  iban: string;           // IBAN uctu prijemce
  amount: number;         // castka v CZK
  currency: "CZK";
  vs?: string;            // variabilni symbol (max 10 cislic)
  ss?: string;            // specificky symbol
  ks?: string;            // konstantni symbol
  message?: string;       // zprava pro prijemce (max 60 znaku)
  recipient_name?: string;
}

function generateSPD(data: QRPaymentData): string {
  // Format dle ceske normy SPD
  let spd = `SPD*1.0`;
  spd += `*ACC:${data.iban}`;
  spd += `*AM:${data.amount.toFixed(2)}`;
  spd += `*CC:${data.currency}`;
  if (data.vs) spd += `*X-VS:${data.vs}`;
  if (data.ss) spd += `*X-SS:${data.ss}`;
  if (data.ks) spd += `*X-KS:${data.ks}`;
  if (data.message) spd += `*MSG:${data.message.substring(0, 60)}`;
  if (data.recipient_name) spd += `*RN:${data.recipient_name}`;
  return spd;
}

// Generovani QR kodu pomoci knihovny `qrcode`
// npm: qrcode@1.5.4
import QRCode from "qrcode";

export async function generateQRPaymentImage(data: QRPaymentData): Promise<string> {
  const spd = generateSPD(data);
  return QRCode.toDataURL(spd, {
    errorCorrectionLevel: "M",
    width: 300,
    margin: 2,
  });
}
```

**Pouziti v systemu:**
- Faktura obsahuje QR kod pro mobilni bankovnictvi
- Nabiti kreditu -- QR platba primo v profilu clena
- Potvrzeni objednavky v e-shopu -- alternativni platba QR kodem

### 4.4 Kreditni/prepaid wallet system

Viz sekce 3.7 (Finance) -- kreditni system je navrzen jako double-entry ledger s immutable transakcemi a nocni rekoncialiaci.

**Klicove vlastnosti:**
- Nabiti: kartou (Comgate), prevodem (automaticky parovani dle VS), hotovosti (recepce), voucherem
- Strzeni: automaticke pri rezervaci, nakupu, registraci na aktivitu
- Minimalni zustatek: konfigurovatelny (napr. moznost jit do minusu o 100 Kc pro overene cleny)
- Expirace: volitelna (napr. kredit plati 12 mesicu od posledniho nabiti)
- Rodinne sdileni: clenove jedne rodiny mohou sdilet kreditni zustatek

### 4.5 Opakujici se platby (subscriptions)

Pro mesicni clensky prispevky a opakujici se permanentky:

```typescript
// Comgate recurring payments flow
// 1. Prvni platba -- clen zadava kartu, Comgate uklada token
// 2. Kazdy mesic -- system vola Comgate API s tokenem

interface RecurringSetup {
  member_id: string;
  amount: number;
  interval: "monthly" | "quarterly" | "yearly";
  description: string;
  start_date: string;
  card_token: string;  // z prvni platby
}

// Cron job (Vercel Cron): 1x denne kontrola splatnych plateb
// src/app/api/cron/recurring-payments/route.ts
// Vercel cron config v vercel.json:
// { "crons": [{ "path": "/api/cron/recurring-payments", "schedule": "0 6 * * *" }] }
```

---

## 5. Integrace se stavajicimi systemy

### 5.1 iSport.cz

**Aktualni stav:**
iSport.cz je externi SaaS pro online rezervace sportovist. Pouziva se jako widget na webu haly.

**Dostupne API moznosti:**
- iSport.cz **nema verejne REST API** -- to je zasadni omezeni
- Moznosti integrace:
  1. **iframe embed** (stavajici stav) -- funka, ale zero datove integrace
  2. **Screen scraping** -- techicky mozne, ale nestabilni a v rozporu s ToS
  3. **iCal/ICS feed** -- iSport.cz exportuje kalendar ve formatu iCal (read-only)
  4. **Kontakt s iSport.cz** -- vyjednat API pristup (priorita!)
  5. **Nahrada vlastnim systemem** (Faze 3)

**Doporuceny postup:**

| Krok | Cas | Akce |
|---|---|---|
| 1 | Ihned | Kontaktovat iSport.cz ohledne API pristupu |
| 2 | Mesic 1 | Implementovat iCal import pro read-only synchronizaci |
| 3 | Mesic 2-4 | Pokud API dostupne: obousmerna synchronizace |
| 4 | Mesic 7-9 | Vlastni rezervacni modul (nahrada iSport.cz) |

**iCal import implementace:**

```typescript
// src/lib/reservations/isport-sync.ts
import ical from "node-ical"; // npm: node-ical@0.18.0

export async function syncFromISport(icalUrl: string): Promise<void> {
  const events = await ical.async.fromURL(icalUrl);

  for (const [, event] of Object.entries(events)) {
    if (event.type !== "VEVENT") continue;

    // Mapovani iCal eventu na interni rezervaci
    await upsertReservation({
      isport_ref: event.uid,
      court_name: parseCourtFromSummary(event.summary),
      start_time: event.start,
      end_time: event.end,
      member_name: parseNameFromDescription(event.description),
      source: "isport",
    });
  }
}
```

### 5.2 EOS -- strategie migrace clenskych dat

**Aktualni stav:**
EOS software spravuje cleny s RFID cipovymi kartami. Presny format exportu neni znam (sekce IT v dotazniku prazdna).

**Migracni plan:**

| Krok | Akce | Detail |
|---|---|---|
| 1 | **Audit EOS dat** | Zjistit: format exportu (CSV/XML/DB dump), pocet zaznamu, kvalitu dat |
| 2 | **Export z EOS** | Pozadavek na export: jmeno, prijmeni, email, telefon, datum narozeni, cislo RFID karty, typ clenstvi, datum expirace |
| 3 | **Cisteni dat** | Deduplikace, normalizace telefonnich cisel (+420...), validace emailu, kodovani znaku (windows-1250 -> UTF-8) |
| 4 | **Mapovaci tabulka** | Mapovani EOS membership typu na novy system |
| 5 | **Import skript** | Node.js skript pro import do Vercel Postgres |
| 6 | **Validace** | Porovnani poctu, nahodna kontrola 20 zaznamu |
| 7 | **RFID mapovani** | Prirazeni existujicich RFID karet k novym member_id |
| 8 | **Paralelni provoz** | 2-4 tydny soubezny beh (EOS + nova platforma) |
| 9 | **Vypnuti EOS** | Po overeni datove konzistence |

**Import skript (kostra):**

```typescript
// scripts/migrate-eos.ts
import { parse } from "csv-parse/sync"; // npm: csv-parse@5.6.0
import { sql } from "@vercel/postgres";
import iconv from "iconv-lite"; // npm: iconv-lite@0.6.3

interface EOSMember {
  cislo_karty: string;
  jmeno: string;
  prijmeni: string;
  email: string;
  telefon: string;
  datum_narozeni: string;
  typ_clenstvi: string;
  platnost_do: string;
}

async function migratEOS(csvPath: string) {
  // EOS typicky exportuje v Windows-1250
  const rawBuffer = fs.readFileSync(csvPath);
  const content = iconv.decode(rawBuffer, "win1250");

  const records: EOSMember[] = parse(content, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
  });

  let imported = 0;
  let skipped = 0;

  for (const record of records) {
    const phone = normalizePhone(record.telefon);
    const email = record.email?.trim().toLowerCase() || null;

    // Deduplikace podle emailu
    if (email) {
      const existing = await sql`SELECT id FROM members WHERE email = ${email}`;
      if (existing.rows.length > 0) {
        skipped++;
        continue;
      }
    }

    await sql`
      INSERT INTO members (
        first_name, last_name, email, phone,
        date_of_birth, rfid_card_number,
        membership_type, membership_until,
        eos_legacy_id
      ) VALUES (
        ${record.jmeno}, ${record.prijmeni}, ${email}, ${phone},
        ${parseDate(record.datum_narozeni)}, ${record.cislo_karty},
        ${mapMembershipType(record.typ_clenstvi)},
        ${parseDate(record.platnost_do)},
        ${record.cislo_karty}
      )
    `;
    imported++;
  }

  console.log(`Import dokoncen: ${imported} importovano, ${skipped} preskoceno`);
}
```

### 5.3 Ucetni export -- ISDOC format

ISDOC (Information System Document) je cesky standard pro elektronickou fakturaci.

**Implementace:**

```typescript
// src/lib/finance/isdoc.ts

interface ISDOCInvoice {
  invoice_number: string;
  issue_date: string;       // YYYY-MM-DD
  due_date: string;
  supplier: {
    name: string;
    ico: string;
    dic?: string;
    address: string;
  };
  customer: {
    name: string;
    ico?: string;
    address?: string;
    email?: string;
  };
  items: {
    description: string;
    quantity: number;
    unit_price: number;
    vat_rate: number;       // 0, 12, 21 (ceske sazby DPH od 2024)
  }[];
  payment_method: string;
  variable_symbol: string;
  note?: string;
}

export function generateISDOC(invoice: ISDOCInvoice): string {
  // ISDOC 6.0.1 XML format
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="http://isdoc.cz/namespace/2013"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://isdoc.cz/namespace/2013 isdoc-invoice-6.0.1.xsd"
         version="6.0.1">
  <DocumentType>1</DocumentType>
  <ID>${invoice.invoice_number}</ID>
  <UUID>${crypto.randomUUID()}</UUID>
  <IssueDate>${invoice.issue_date}</IssueDate>
  <TaxPointDate>${invoice.issue_date}</TaxPointDate>
  <VATApplicable>${invoice.supplier.dic ? "true" : "false"}</VATApplicable>
  <Note>${invoice.note || ""}</Note>
  <LocalCurrencyCode>CZK</LocalCurrencyCode>
  <ForeignCurrencyCode>CZK</ForeignCurrencyCode>
  <CurrRate>1</CurrRate>
  <RefCurrRate>1</RefCurrRate>
  <AccountingSupplierParty>
    <Party>
      <PartyIdentification><ID>${invoice.supplier.ico}</ID></PartyIdentification>
      <PartyName><Name>${invoice.supplier.name}</Name></PartyName>
      <PostalAddress><StreetName>${invoice.supplier.address}</StreetName></PostalAddress>
      ${invoice.supplier.dic ? `<PartyTaxScheme><CompanyID>${invoice.supplier.dic}</CompanyID></PartyTaxScheme>` : ""}
    </Party>
  </AccountingSupplierParty>
  <AccountingCustomerParty>
    <Party>
      <PartyName><Name>${invoice.customer.name}</Name></PartyName>
      ${invoice.customer.ico ? `<PartyIdentification><ID>${invoice.customer.ico}</ID></PartyIdentification>` : ""}
    </Party>
  </AccountingCustomerParty>
  <InvoiceLines>
    ${invoice.items.map((item, i) => `
    <InvoiceLine>
      <ID>${i + 1}</ID>
      <InvoicedQuantity>${item.quantity}</InvoicedQuantity>
      <LineExtensionAmount>${(item.quantity * item.unit_price).toFixed(2)}</LineExtensionAmount>
      <LineExtensionAmountTaxInclusive>${(item.quantity * item.unit_price * (1 + item.vat_rate / 100)).toFixed(2)}</LineExtensionAmountTaxInclusive>
      <LineExtensionTaxAmount>${(item.quantity * item.unit_price * item.vat_rate / 100).toFixed(2)}</LineExtensionTaxAmount>
      <UnitPrice>${item.unit_price.toFixed(2)}</UnitPrice>
      <ClassifiedTaxCategory><Percent>${item.vat_rate}</Percent></ClassifiedTaxCategory>
      <Item><Description>${item.description}</Description></Item>
    </InvoiceLine>
    `).join("")}
  </InvoiceLines>
  <PaymentMeans>
    <Payment><PaidAmount>${invoice.items.reduce((sum, i) => sum + i.quantity * i.unit_price * (1 + i.vat_rate / 100), 0).toFixed(2)}</PaidAmount></Payment>
    <PaymentDueDate>${invoice.due_date}</PaymentDueDate>
    ${invoice.variable_symbol ? `<Details><PaymentReferenceInfo><ID>${invoice.variable_symbol}</ID></PaymentReferenceInfo></Details>` : ""}
  </PaymentMeans>
</Invoice>`;
}
```

**Export pro ucetni systemy:**
- **Pohoda**: ISDOC import (Pohoda mXML alternativne)
- **Money S3**: ISDOC import (nebo vlastni XML format S3)
- **FlexiBee (ABRA)**: REST API + ISDOC
- **Genericka cesta**: ISDOC 6.0.1 -- podporovany vsemi velkymi ceskymi ucetnimi systemy

---

## 6. Bezpecnost a GDPR

### 6.1 Autentizace

**Tri typy uzivatelu:**

| Typ | Pristup | Metoda autentizace |
|---|---|---|
| **Verejnost** | E-shop, turnaje (verejne), denni menu | Zadna (nebo volitelna registrace) |
| **Clenove** (350) | Profil, rezervace, kredit, aktivity, objednavky | Email + heslo / Magic link |
| **Personl** (5-15) | Admin rozhrani, sprava vsech modulu | Email + heslo + 2FA (TOTP) |

**Doporucena knihovna: NextAuth.js v5 (Auth.js)**

```typescript
// src/lib/auth.ts
// NextAuth.js v5 konfigurace

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs"; // npm: bcryptjs@2.4.3

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Heslo", type: "password" },
      },
      authorize: async (credentials) => {
        const { rows } = await sql`
          SELECT id, email, password_hash, role, first_name, last_name
          FROM members WHERE email = ${credentials.email as string}
        `;
        if (rows.length === 0) return null;

        const user = rows[0];
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role,
        };
      },
    }),
    // Magic link provider (volitelne pro cleny)
    // EmailProvider({ server: process.env.EMAIL_SERVER, from: "noreply@halakrasovska.cz" })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/prihlaseni",
    error: "/prihlaseni/chyba",
  },
});
```

### 6.2 Role-Based Access Control (RBAC) matice

| Zdroj / Akce | Verejnost | Clen | Trener | Recepce | Spravce | Admin |
|---|---|---|---|---|---|---|
| **E-shop: prohlizeni** | R | R | R | R | R | R |
| **E-shop: objednavka** | - | CRUD | CRUD | CRUD | CRUD | CRUD |
| **Rezervace: prohlizeni** | R | R | R | R | R | R |
| **Rezervace: vytvoreni** | - | CR | CR | CRUD | CRUD | CRUD |
| **Rezervace: admin** | - | - | - | RU | CRUD | CRUD |
| **Profil: vlastni** | - | RU | RU | RU | RU | CRUD |
| **CRM: clenove** | - | - | R (vlastni) | R | CRUD | CRUD |
| **CRM: kampane** | - | - | - | - | CRUD | CRUD |
| **Aktivity: prohlizeni** | R | R | R | R | R | R |
| **Aktivity: registrace** | - | CR | CR | CRUD | CRUD | CRUD |
| **Aktivity: dochazka** | - | - | CRUD | CRUD | CRUD | CRUD |
| **Turnaje: prohlizeni** | R | R | R | R | R | R |
| **Turnaje: registrace** | - | CR | CR | CRUD | CRUD | CRUD |
| **Turnaje: vysledky** | - | - | - | CRU | CRUD | CRUD |
| **Turnaje: admin** | - | - | - | - | CRUD | CRUD |
| **Finance: vlastni** | - | R | R | R | R | CRUD |
| **Finance: vsechny** | - | - | - | R | CRUD | CRUD |
| **Finance: refundy** | - | - | - | - | CRU | CRUD |
| **Restaurace: menu** | R | R | R | R | R | R |
| **Restaurace: admin** | - | - | - | - | CRUD | CRUD |
| **Reporting** | - | - | - | R | R | CRUD |
| **Audit log** | - | - | - | - | R | R |
| **Nastaveni systemu** | - | - | - | - | - | CRUD |
| **Uzivatelske role** | - | - | - | - | - | CRUD |

Legenda: C=Create, R=Read, U=Update, D=Delete, `-` = zadny pristup

**Implementace RBAC:**

```typescript
// src/lib/auth/rbac.ts

export type UserRole = "public" | "member" | "trainer" | "reception" | "manager" | "admin";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  public: 0,
  member: 1,
  trainer: 2,
  reception: 3,
  manager: 4,
  admin: 5,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Middleware pro Route Handlers
export function requireRole(requiredRole: UserRole) {
  return async (request: Request) => {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (!hasRole(session.user.role as UserRole, requiredRole)) {
      return new Response("Forbidden", { status: 403 });
    }
    return null; // OK, pokracuj
  };
}
```

### 6.3 GDPR compliance checklist (cesky zakon c. 110/2019 Sb.)

| # | Pozadavek | Stav | Implementace |
|---|---|---|---|
| 1 | **Zaznamy o zpracovani** | K implementaci | Tabulka `data_processing_records` s popisem ucelu, pravniho zakladu, doby uchovavani |
| 2 | **Pravni zaklad zpracovani** | K implementaci | Souhlas (marketing), smlouva (clenstvi), opravneny zajem (bezpecnost) |
| 3 | **Informovani subjektu** | K implementaci | Stranka `/gdpr` s informacemi o zpracovani |
| 4 | **Souhlas se zpracovanim** | K implementaci | Granularni checkboxy pri registraci; tabulka `gdpr_consents` |
| 5 | **Pravo na pristup** | K implementaci | Endpoint `/api/gdpr/my-data` -- export vsech dat clena (JSON/PDF) |
| 6 | **Pravo na opravu** | K implementaci | Profil clena -- editace vlastnich udaju |
| 7 | **Pravo na vymaz** | K implementaci | Endpoint `/api/gdpr/delete-account` -- anonymizace (ne smazani -- ucetni povinnosti) |
| 8 | **Pravo na prenositelnost** | K implementaci | Export dat ve strojove citelnem formatu (JSON) |
| 9 | **Pravo na omezeni** | K implementaci | Flag `processing_restricted` na profilu |
| 10 | **Pravo vznest namitku** | K implementaci | Formular pro namitku, workflow pro vyrizeni |
| 11 | **DPO (Poverenec)** | K rozhodnuti | Spolek s 350 cleny pravdepodobne nepotrebuje DPO (neni "rozsahle zpracovani") |
| 12 | **DPIA** | K provedeni | Posouzeni vlivu -- nutne pro RFID sledovani a zdravotni udaje (sportovni prohlidky) |
| 13 | **Zpracovatelske smlouvy** | K priprave | Smlouvy s Comgate, Resend, Vercel, GoSMS, Dotykacka |
| 14 | **Oznameni incidentu** | K implementaci | Proces pro oznameni UOOU do 72 hodin |
| 15 | **Sifrovani dat** | Castecne | HTTPS (Vercel), sifrovani hesel (bcrypt), Vercel Postgres (encryption at rest) |
| 16 | **Minimalizace dat** | K revizi | Sbírat pouze nezbytne udaje |

### 6.4 Politiky uchovavani dat

| Kategorie dat | Doba uchovavani | Zduvodneni |
|---|---|---|
| **Clenske udaje (aktivni)** | Po dobu clenstvi + 3 roky | Opravneny zajem + ucetni predpisy |
| **Clenske udaje (neaktivni)** | 3 roky od posledni aktivity | Poté anonymizace |
| **Ucetni doklady** | 10 let | Zakon o ucetnictvi (563/1991 Sb.) |
| **Danove doklady** | 10 let | Zakon o DPH (235/2004 Sb.) |
| **Audit log** | 5 let | Opravneny zajem (bezpecnost) |
| **Komunikacni log** | 3 roky | Opravneny zajem |
| **Souhlasy GDPR** | Po dobu platnosti + 3 roky | Prokazatelnost souhlasu |
| **IP adresy (audit)** | 90 dnu | Anonymizace po 90 dnech |
| **Zdravotni udaje** | Po dobu clenstvi | Se souhlasem; smazat pri odchodu |
| **Fotografe turnaju** | 5 let (verejny zajem) | Souhlas nebo opravneny zajem media |

### 6.5 Sprava souhlasu

```typescript
// src/lib/gdpr/consents.ts

interface ConsentRecord {
  id: string;
  member_id: string;
  consent_type: ConsentType;
  granted: boolean;
  granted_at: string | null;
  revoked_at: string | null;
  ip_address: string | null;
  source: "registration" | "profile" | "admin";
  version: string;  // verze textu souhlasu
}

type ConsentType =
  | "marketing_email"      // Newsletter a marketingove emaily
  | "marketing_sms"        // SMS kampane
  | "photo_publication"    // Zverejneni fotek z akci
  | "health_data"          // Zpracovani zdravotnich udaju
  | "children_data"        // Zpracovani udaju deti (rodic udeluje)
  | "profiling"            // Segmentace a cíleni nabidek
  | "third_party_sharing"; // Sdileni dat s partnery (svaz, sponzori)

// Kazdy souhlas ma vlastni verzi textu
// Pri zmene textu se musi souhlas znovu ziskat
```

---

## 7. Provozni system

### 7.1 Projektove rizeni (Kanban)

Stavajici stav: Projektovy management uz existuje v `src/app/projects/` s tabulkami `projects` a `tasks` v DB.

**Rozsireni:**

| Funkce | Stav | Popis |
|---|---|---|
| Kanban board | K implementaci | Drag & drop (dnd-kit v6) mezi sloupci todo/in_progress/done |
| Ganttov diagram | K implementaci | Casova osa projektu (volitelne, Faze 3) |
| Prirazeni odpovednych | Existuje (`assignee`) | Rozsireni o FK na `members` |
| Komentare k ukolu | K implementaci | Tabulka `task_comments` |
| Prilohy | K implementaci | Upload souboru (Vercel Blob) |
| Notifikace | K implementaci | Email pri prirazeni ukolu, blizici se deadline |

**Implementace Kanban:**

```typescript
// Pouziti @dnd-kit/core@6.3.1 a @dnd-kit/sortable@9.0.0
// Komponenta src/components/projects/KanbanBoard.tsx

// Sloupce: TASK_STATUS_LABELS z existujiciho types.ts
// { todo: "K reseni", in_progress: "Probiha", done: "Hotovo" }

// Drag & drop aktualizuje:
// 1. task.status (presun mezi sloupci)
// 2. task.sort_order (poradí ve sloupci)
// API call: PATCH /api/tasks/[id] { status, sort_order }
```

### 7.2 Kontaktni/CRM databaze

Viz sekce 3.3 (CRM modul). Kontaktni databaze je primo soucasti CRM modulu s tabulkou `members`.

**Doplnkove entity pro provozni kontakty (ne clenove):**

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,  -- 'supplier', 'sponsor', 'partner', 'official', 'media'
  company_name VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  ico VARCHAR(20),
  dic VARCHAR(20),
  address TEXT,
  notes TEXT,
  tags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.3 Report builder

**Pristup: Konfigurovatelne reporty s prednastavenymi sablobami**

```typescript
// src/lib/reports/builder.ts

interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  data_source: "members" | "reservations" | "payments" | "orders" | "tournaments" | "activities";
  columns: ReportColumn[];
  filters: ReportFilter[];
  group_by?: string[];
  order_by?: { column: string; direction: "asc" | "desc" }[];
  chart_type?: "bar" | "line" | "pie" | "table";
}

// Preddefinovane sablony:
const REPORT_TEMPLATES: ReportDefinition[] = [
  {
    id: "monthly-revenue",
    name: "Mesicni trzby",
    data_source: "payments",
    // ...
  },
  {
    id: "court-utilization",
    name: "Obsazenost kurtu",
    data_source: "reservations",
    // ...
  },
  {
    id: "member-retention",
    name: "Retence clenu",
    data_source: "members",
    // ...
  },
];
```

### 7.4 Kontrolni mechanismy (approval workflows)

```typescript
// src/lib/workflows/approval.ts

interface ApprovalWorkflow {
  id: string;
  type: ApprovalType;
  subject_type: string;    // "refund", "expense", "event", "membership_exception"
  subject_id: string;
  requested_by: string;    // member_id (zamestnanec)
  approved_by: string | null;
  status: "pending" | "approved" | "rejected";
  amount?: number;
  note: string;
  created_at: string;
  resolved_at: string | null;
}

type ApprovalType =
  | "refund_over_500"      // Vraceni platby nad 500 Kc
  | "expense_over_5000"    // Vydaj nad 5000 Kc
  | "event_budget"         // Rozpocet akce
  | "membership_exception" // Vyjimka z clenskych pravidel
  | "discount_over_20pct"; // Sleva nad 20%

// Pravidla: kdo muze schvalit
const APPROVAL_RULES: Record<ApprovalType, UserRole> = {
  refund_over_500: "manager",
  expense_over_5000: "admin",
  event_budget: "manager",
  membership_exception: "manager",
  discount_over_20pct: "manager",
};
```

### 7.5 Sledovani legislativnich povinnosti

```sql
CREATE TABLE obligations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,  -- 'license', 'inspection', 'insurance', 'tax', 'gdpr', 'safety'
  responsible_member_id UUID REFERENCES members(id),
  due_date DATE NOT NULL,
  recurring_interval VARCHAR(20), -- 'monthly', 'quarterly', 'yearly', NULL
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'overdue'
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES members(id),
  document_url TEXT,              -- odkaz na dokument ve Vercel Blob
  alert_days_before INTEGER DEFAULT 30,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Typicke zaznamy:
-- "Revize hasicich pristroju" (yearly)
-- "Revize elektroinstalace" (5-yearly)
-- "BOZP skoleni" (yearly)
-- "Prodlouzeni pojistky" (yearly)
-- "Danove priznanA" (yearly, due 31.3.)
-- "Vykaz pro MSMT/NSA" (yearly)
-- "Obnoveni provozniho radu" (dle potreby)
-- "HACCP kontrola" (quarterly)
-- "Kalibrace vah (restaurace)" (yearly)
```

**Cron job pro upozorneni:**

```typescript
// src/app/api/cron/obligation-alerts/route.ts
// Vercel Cron: denne v 8:00

export async function GET() {
  const upcoming = await sql`
    SELECT o.*, m.email, m.first_name
    FROM obligations o
    LEFT JOIN members m ON o.responsible_member_id = m.id
    WHERE o.status = 'pending'
      AND o.due_date <= CURRENT_DATE + (o.alert_days_before || ' days')::interval
      AND o.due_date >= CURRENT_DATE
  `;

  for (const obligation of upcoming.rows) {
    await sendObligationAlert(obligation);
  }

  // Oznacit prekrocene jako overdue
  await sql`
    UPDATE obligations SET status = 'overdue'
    WHERE status = 'pending' AND due_date < CURRENT_DATE
  `;

  return Response.json({ checked: upcoming.rows.length });
}
```

### 7.6 Financni reporting / vykaznictvi

| Vykaz | Frekvence | Obsah |
|---|---|---|
| **Denni uzaverka** | Denne | Trzby dle kanalu (recepce, e-shop, restaurace), platebni metody |
| **Mesicni report** | Mesicne | P&L, trzby dle segmentu, obsazenost, clenska zakladna |
| **Kvartalni report** | Kvartalne | Srovnani s planem, KPI trendy, forecast |
| **Rocni uzaverka** | Rocne | Kompletni financni prehled pro ucetni zaverku |
| **Dotacni vykazy** | Dle pozadavku | MSMT, NSA, město Plzen -- specificke formaty |

---

## 8. Deployment a infrastruktura

### 8.1 Vercel (stavajici) vs self-hosted

| Kritrium | **Vercel (doporuceno)** | **Self-hosted (Hetzner)** |
|---|---|---|
| **Dostupnost** | 99.99% SLA | Zavisi na sprave (~99.9%) |
| **Naklady (mesicne)** | Pro plan $20/mes + usage | VPS ~250-500 Kc/mes + cas spravy |
| **Scaling** | Automaticky | Manualni |
| **SSL/TLS** | Automaticky (Let's Encrypt) | Nutno nastavit (certbot) |
| **CI/CD** | Integrovane (git push = deploy) | Nutno nastavit (GitHub Actions) |
| **Edge network** | Globalni CDN | Jeden server v EU |
| **Databaze** | Vercel Postgres (Neon) -- integrovane | Nutno spravovat PostgreSQL |
| **Blob storage** | Vercel Blob -- integrovane | MinIO / S3 compatible |
| **Cron jobs** | Vercel Cron (integrovane) | systemd timers / crontab |
| **Monitoring** | Vercel Analytics + Speed Insights | Nutno nastavit (Grafana/Prometheus) |
| **Complexity** | Nizka (managed) | Vysoka (self-managed) |
| **Vendor lock-in** | Stredni (Next.js je portable) | Zadny |

**Doporuceni: Zustat na Vercel Pro ($20/mesic).**

Zduvodneni:
- Stavajici infrastruktura funguje
- Vercel Pro plan pokryte potreby sportovni haly (100GB bandwidth, 1000 build minut)
- Casove naklady na spravu self-hosted rešeni (Hetzner VPS `ssh -i ~/.ssh/hetzner_server_ed25519 leos@91.99.126.53`) prevysuji financni usporu
- Hetzner VPS pouzit jako **sekundarni prostredi** pro staging/testovani a zalohy

**Doporucena Vercel konfigurace:**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/recurring-payments",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/obligation-alerts",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/isport-sync",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/credit-reconciliation",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/gdpr-cleanup",
      "schedule": "0 3 1 * *"
    }
  ]
}
```

### 8.2 Databazovy scaling plan

**Aktualni stav:** Vercel Postgres (Neon) -- Free/Hobby tier.

**Scaling plan:**

| Faze | Tier | Kapacita | Cena | Kdy |
|---|---|---|---|---|
| Aktualni | Hobby | 0.5 GB storage, 100 compute hours | $0 | Ted |
| Faze 1 | Pro | 10 GB storage, neomezene compute | $20/mes (soucst Vercel Pro) | Mesic 1 |
| Faze 2 | Pro + read replicas | 10 GB + read replica | ~$30-40/mes | Mesic 6 |
| Faze 3 | Scale | 50 GB, autoscaling | ~$69/mes | Rok 2 |

**Optimalizace:**
- Connection pooling (PgBouncer -- soucst Neon)
- Read replicas pro reporting dotazy
- Materialized views pro slozite agregace (KPI dashboard)
- Partitioning pro audit_log (po mesicich) pri > 1M zaznamu

### 8.3 Zalochovaci strategie

| Vrstva | Metoda | Frekvence | Retence | Umisteni |
|---|---|---|---|---|
| **Databaze** | Neon automatic backups | Kontinualni (point-in-time) | 7 dnu (Pro), 30 dnu (Scale) | Neon cloud (AWS EU) |
| **Databaze** | pg_dump export | Denne v 2:00 | 90 dnu | Hetzner VPS + Backblaze B2 |
| **Blob storage** | Vercel Blob replication | Automaticky | Neomezene | Vercel CDN |
| **Blob storage** | Sync na Backblaze B2 | Tydne | 365 dnu | Backblaze B2 |
| **Kod** | Git (GitHub) | Kazdy commit | Neomezene | GitHub |
| **Konfigurace** | Env vars export | Mesicne | 12 mesicu | Encrypted file na Hetzner |

**Zalohovy skript:**

```bash
#!/bin/bash
# scripts/backup.sh -- spousten pres Hetzner cron
# Pripojeni: ssh -i ~/.ssh/hetzner_server_ed25519 leos@91.99.126.53

DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/home/leos/backups/krasovska"

# Databazovy dump (Neon connection string z env)
pg_dump "$DATABASE_URL" --format=custom --file="$BACKUP_DIR/db-$DATE.dump"

# Komprese a sifrovani
gpg --symmetric --cipher-algo AES256 "$BACKUP_DIR/db-$DATE.dump"
rm "$BACKUP_DIR/db-$DATE.dump"

# Upload na Backblaze B2
b2 upload-file krasovska-backups "$BACKUP_DIR/db-$DATE.dump.gpg" "db/$DATE.dump.gpg"

# Cisteni starych lokalnich zaloh (>30 dnu)
find "$BACKUP_DIR" -name "*.gpg" -mtime +30 -delete

echo "Backup completed: $DATE"
```

### 8.4 Monitoring a alerting

| Nastroj | Ucel | Cena |
|---|---|---|
| **Vercel Analytics** | Web vitals, page views, performance | Soucst Pro |
| **Vercel Speed Insights** | Real User Monitoring (RUM) | Soucst Pro |
| **Sentry** (sentry.io) | Error tracking, performance monitoring | Free tier (5k events/mes) |
| **Better Uptime** (betterstack.com) | Uptime monitoring, status page | Free tier (10 monitoru) |
| **Vercel Logs** | Runtime logy, API logy | Soucst Pro |

**Sentry integrace:**

```typescript
// src/lib/monitoring.ts
// npm: @sentry/nextjs@8.47.0

// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% transakci pro performance monitoring
  environment: process.env.VERCEL_ENV || "development",
  release: process.env.VERCEL_GIT_COMMIT_SHA,
});
```

**Alerty:**

| Alert | Podminka | Kanal |
|---|---|---|
| Web down | Response time > 5s nebo HTTP 5xx | Email + SMS |
| DB connection error | Neni mozne se pripojit k Neon | Email + SMS |
| Payment webhook failure | Comgate webhook vraci 5xx | Email |
| High error rate | > 10 erroru za 5 minut | Email |
| Disk space (Hetzner) | > 80% | Email |
| SSL certifikat expirace | < 14 dnu | Email |

---

## 9. Implementacni roadmapa

### Faze 1: MVP (Mesic 1--3)

**Cil: Spusteni e-shopu a zakladu CRM**

| Tyden | Modul | Ukoly |
|---|---|---|
| T1-T2 | **Zakladni infrastruktura** | Autentizace (NextAuth.js v5), RBAC, DB migrace pro nove tabulky, CI/CD pipeline |
| T3-T4 | **CRM zaklad** | Import EOS dat, tabulka `members`, profil clena, vyhledavani, zakladni segmentace |
| T5-T6 | **E-shop: produkty** | Katalog, detail produktu, sprava v admin, Vercel Blob pro fotky |
| T7-T8 | **E-shop: platby** | Integrace Comgate, kosik (Vercel KV), checkout, webhook processing |
| T9-T10 | **E-shop: permanentky + kredit** | Kreditni system, nabiti, strzeni, permanentky jako produkt |
| T11-T12 | **Testovani + launch** | E2E testy, security audit, GDPR soulad, soft launch |

**Deliverables Faze 1:**
- Funkcni e-shop s permanentkami, kredity, vouchery a fyzickym zbozim
- Kreditni system s nabienim pres Comgate
- Zakladni CRM s 350 importovanymi cleny z EOS
- Autentizacni system (clenove + personal)
- QR platby (cesky standard)

### Faze 2: Core platforma (Mesic 4--6)

| Tyden | Modul | Ukoly |
|---|---|---|
| T13-T14 | **Rezervace: read-only** | iSport.cz iCal sync, zobrazeni rezervaci v platforme |
| T15-T16 | **CRM: komunikace** | Email marketing (Resend), SMS (GoSMS.cz), kampane |
| T17-T18 | **Aktivity** | Rozvrh, online registrace, platby za kurzy |
| T19-T20 | **Finance: reporting** | Financni dashboard, denni uzaverky, ISDOC export |
| T21-T22 | **Restaurace** | Integrace Dotykacka API, denni menu na webu, online objednavky |
| T23-T24 | **Testovani + stabilizace** | Performance testy, UX vyladeni, skoleni personalu |

**Deliverables Faze 2:**
- Zobrazeni rezervaci z iSport.cz v platforme
- Email a SMS marketing s segmentaci
- Online registrace do aktivit a krouzku
- Financni reporty a ISDOC export pro ucetni
- Denni menu a online objednavky z restaurace/bistra

### Faze 3: Kompletni platforma (Mesic 7--12)

| Mesic | Modul | Ukoly |
|---|---|---|
| M7 | **Rezervace: vlastni** | Kompletni rezervacni system (nahrada iSport.cz), cenova pravidla, storno |
| M8 | **Turnaje** | Turnajovy modul, registrace, los, skupiny, pavouk, live vysledky |
| M9 | **Turnaje: pokracovani** | Zebricek, fotogalerie, PDF diplomy, statistiky hracu |
| M10 | **CRM: advanced** | Vernostni program, rodinne ucty, rodičovsky portal |
| M11 | **Provozni system** | Kanban board (dnd-kit), legislativni tracker, approval workflows |
| M12 | **Stabilizace + launch** | Kompletni migrace z iSport.cz, skoleni, full launch |

**Deliverables Faze 3:**
- Vlastni rezervacni system (iSport.cz nahrazeno)
- Turnajovy modul s live vysledky
- Kompletni vernostni program
- Provozni nastroje (Kanban, legislativa, schvalovani)

### Faze 4: Pokrocile funkce (Rok 2)

| Kvartl | Modul | Ukoly |
|---|---|---|
| Q1 | **Mobilni aplikace** | PWA (Progressive Web App) s offline podporou, push notifikace |
| Q1 | **Pokrocily reporting** | Report builder, custom dashboardy, export do Excel |
| Q2 | **Integrace se svazem** | Propojeni s Ceskym badmintonovym svazem (registrace, zebricek) |
| Q2 | **Mezinarodni turnaje** | BWF/BE formaty, vicejazycna registrace |
| Q3 | **AI asistent** | Doporuceni aktivit, predikce obsazenosti, churn prediction |
| Q3 | **Automacni scenare** | Zapier-like workflow builder (napr. "pri registraci noveho clena posli uvitaci email") |
| Q4 | **Analyticka platforma** | Pokrocila business intelligence, benchmarking s jinymi halami |
| Q4 | **Marketplace** | Sdileni modulu s jinymi sportovnimi halami |

### 9.1 Pozadavky na vyvojove zdroje

| Role | Uvazek | Faze 1 | Faze 2 | Faze 3 | Faze 4 |
|---|---|---|---|---|---|
| **Senior Full-stack vyvojar** | Plny uvazek | 1 | 1 | 1 | 1 |
| **Junior/Mid vyvojar** | Plny uvazek | 0-1 | 1 | 1 | 1 |
| **UI/UX designer** | Castecny | 0.3 | 0.2 | 0.2 | 0.1 |
| **QA / Tester** | Castecny | 0.2 | 0.3 | 0.3 | 0.2 |
| **Projektovy manazer** | Castecny | 0.2 | 0.2 | 0.2 | 0.1 |

**Odhad nakladu na vyvoj (orientacni):**

| Faze | Casovy rozsah | Odhad MD | Naklady (ext. firma) |
|---|---|---|---|
| Faze 1 (MVP) | 3 mesice | 90-120 MD | 450.000-600.000 Kc |
| Faze 2 (Core) | 3 mesice | 80-100 MD | 400.000-500.000 Kc |
| Faze 3 (Full) | 6 mesicu | 120-160 MD | 600.000-800.000 Kc |
| Faze 4 (Advanced) | 12 mesicu | 80-120 MD | 400.000-600.000 Kc |
| **CELKEM** | **24 mesicu** | **370-500 MD** | **1.850.000-2.500.000 Kc** |

**Mesicni provozni naklady po spusteni:**

| Polozka | Cena / mesic |
|---|---|
| Vercel Pro | 500 Kc ($20) |
| Vercel Postgres (Pro) | v cene Vercel Pro |
| Comgate (transakce) | ~1.500-3.000 Kc (pri 100-200k Kc trzeb) |
| Dotykacka Cloud POS | 349-699 Kc |
| Resend (email) | 0 Kc (free tier) / 500 Kc (Team) |
| GoSMS.cz (SMS) | ~500-1.000 Kc |
| Sentry (monitoring) | 0 Kc (free tier) |
| Better Uptime | 0 Kc (free tier) |
| Backblaze B2 (zalohy) | ~50-100 Kc |
| Domena + DNS | ~50 Kc |
| **CELKEM** | **~3.000-6.000 Kc/mesic** |

---

## Technicke zavislosti (package.json rozsireni)

```json
{
  "dependencies": {
    "@vercel/postgres": "^0.10.0",
    "@vercel/blob": "^0.27.0",
    "@vercel/kv": "^3.0.0",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "next-auth": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "lucide-react": "^0.564.0",
    "qrcode": "^1.5.4",
    "node-ical": "^0.18.0",
    "csv-parse": "^5.6.0",
    "iconv-lite": "^0.6.3",
    "resend": "^4.1.0",
    "@sentry/nextjs": "^8.47.0",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^9.0.0",
    "date-fns": "^4.1.0",
    "zod": "^3.24.0",
    "recharts": "^2.15.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^2.4.6",
    "@types/qrcode": "^1.5.5",
    "@types/node": "^20",
    "@types/react": "^19",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.1.0",
    "playwright": "^1.49.0"
  }
}
```

---

## Adresarova struktura (cilovy stav)

```
src/
├── app/
│   ├── (public)/              # Verejne stranky (bez autentizace)
│   │   ├── eshop/
│   │   │   ├── page.tsx       # Katalog
│   │   │   ├── [slug]/page.tsx # Detail produktu
│   │   │   ├── kosik/page.tsx  # Kosik
│   │   │   └── pokladna/page.tsx # Checkout
│   │   ├── turnaje/
│   │   │   ├── page.tsx       # Prehled turnaju
│   │   │   └── [id]/page.tsx  # Detail turnaje + live vysledky
│   │   ├── aktivity/
│   │   │   └── page.tsx       # Rozvrh aktivit
│   │   ├── menu/
│   │   │   └── page.tsx       # Denni menu restaurace
│   │   ├── prihlaseni/
│   │   │   └── page.tsx       # Login
│   │   └── gdpr/
│   │       └── page.tsx       # GDPR informace
│   │
│   ├── (member)/              # Clenske stranky (autentizace: member+)
│   │   ├── profil/
│   │   │   ├── page.tsx       # Muj profil
│   │   │   ├── kredit/page.tsx # Kreditni ucet
│   │   │   ├── rezervace/page.tsx # Moje rezervace
│   │   │   └── objednavky/page.tsx # Moje objednavky
│   │   └── layout.tsx
│   │
│   ├── (admin)/               # Admin stranky (autentizace: reception+)
│   │   ├── dashboard/page.tsx # Dashboard (stavajici, rozsireny)
│   │   ├── crm/
│   │   │   ├── page.tsx       # Seznam clenu
│   │   │   ├── [id]/page.tsx  # Detail clena
│   │   │   ├── segmenty/page.tsx
│   │   │   └── kampane/page.tsx
│   │   ├── rezervace/
│   │   │   ├── page.tsx       # Kalendar
│   │   │   └── nastaveni/page.tsx
│   │   ├── eshop/
│   │   │   ├── produkty/page.tsx
│   │   │   └── objednavky/page.tsx
│   │   ├── turnaje/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx  # Sprava turnaje
│   │   ├── aktivity/
│   │   │   └── page.tsx
│   │   ├── finance/
│   │   │   ├── page.tsx       # Prehled plateb
│   │   │   ├── faktury/page.tsx
│   │   │   └── reporty/page.tsx
│   │   ├── restaurace/
│   │   │   └── page.tsx
│   │   ├── projekty/page.tsx  # Stavajici
│   │   ├── analyza/page.tsx   # Stavajici
│   │   ├── audit/page.tsx     # Stavajici
│   │   ├── legislativa/page.tsx
│   │   ├── nastaveni/page.tsx
│   │   └── layout.tsx
│   │
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── eshop/
│   │   │   ├── products/route.ts
│   │   │   ├── cart/route.ts
│   │   │   ├── orders/route.ts
│   │   │   └── checkout/route.ts
│   │   ├── crm/
│   │   │   ├── members/route.ts
│   │   │   ├── segments/route.ts
│   │   │   └── campaigns/route.ts
│   │   ├── reservations/
│   │   │   ├── route.ts
│   │   │   ├── slots/route.ts
│   │   │   └── sync/route.ts
│   │   ├── tournaments/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── participants/route.ts
│   │   │       ├── matches/route.ts
│   │   │       ├── draw/route.ts
│   │   │       └── live/route.ts
│   │   ├── activities/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── enrollments/route.ts
│   │   │       └── attendance/route.ts
│   │   ├── finance/
│   │   │   ├── payments/route.ts
│   │   │   ├── credit/route.ts
│   │   │   ├── invoices/route.ts
│   │   │   └── webhooks/
│   │   │       └── comgate/route.ts
│   │   ├── restaurant/
│   │   │   ├── menu/route.ts
│   │   │   └── orders/route.ts
│   │   ├── reports/
│   │   │   ├── route.ts
│   │   │   └── kpi/route.ts
│   │   ├── gdpr/
│   │   │   ├── my-data/route.ts
│   │   │   └── delete-account/route.ts
│   │   ├── cron/
│   │   │   ├── recurring-payments/route.ts
│   │   │   ├── obligation-alerts/route.ts
│   │   │   ├── isport-sync/route.ts
│   │   │   ├── credit-reconciliation/route.ts
│   │   │   └── gdpr-cleanup/route.ts
│   │   ├── questionnaires/     # Stavajici
│   │   ├── projects/           # Stavajici
│   │   ├── tasks/              # Stavajici
│   │   ├── analysis/           # Stavajici
│   │   ├── dashboard/          # Stavajici
│   │   └── audit/              # Stavajici
│   │
│   ├── layout.tsx              # Root layout (stavajici)
│   └── globals.css             # Stavajici
│
├── components/
│   ├── ui/                     # Sdilene UI komponenty (Button, Input, Modal...)
│   ├── eshop/                  # E-shop komponenty
│   ├── crm/                    # CRM komponenty
│   ├── reservations/           # Rezervacni komponenty
│   ├── tournaments/            # Turnajove komponenty
│   ├── activities/             # Komponenty aktivit
│   ├── finance/                # Financni komponenty
│   ├── restaurant/             # Restauracni komponenty
│   └── ...                     # Stavajici komponenty
│
├── lib/
│   ├── auth/                   # Autentizace a RBAC
│   │   ├── index.ts
│   │   └── rbac.ts
│   ├── db/                     # DB migrace a schema
│   │   ├── index.ts            # Stavajici (rozsireny)
│   │   ├── members.ts
│   │   ├── eshop.ts
│   │   ├── reservations.ts
│   │   ├── tournaments.ts
│   │   ├── activities.ts
│   │   ├── finance.ts
│   │   └── obligations.ts
│   ├── eshop/                  # Business logika e-shopu
│   ├── crm/                    # Business logika CRM
│   ├── reservations/           # Business logika rezervaci
│   │   └── isport-sync.ts
│   ├── tournaments/            # Business logika turnaju
│   ├── activities/             # Business logika aktivit
│   ├── finance/                # Business logika financi
│   │   ├── credit.ts
│   │   ├── comgate.ts
│   │   ├── qr-payment.ts
│   │   └── isdoc.ts
│   ├── gdpr/                   # GDPR utilities
│   │   └── consents.ts
│   ├── monitoring/             # Sentry + logging
│   ├── email/                  # Resend sablony
│   ├── sms/                    # GoSMS integrace
│   ├── analysis.ts             # Stavajici
│   ├── audit.ts                # Stavajici
│   ├── api.ts                  # Stavajici (rozsireny)
│   └── db.ts                   # Stavajici (rozsireny)
│
├── types/
│   ├── index.ts                # Stavajici (refaktorovany)
│   ├── members.ts
│   ├── eshop.ts
│   ├── reservations.ts
│   ├── tournaments.ts
│   ├── activities.ts
│   ├── finance.ts
│   └── gdpr.ts
│
├── hooks/
│   ├── useQuestionnaireId.ts   # Stavajici
│   ├── useAutoSave.ts          # Stavajici
│   ├── useAuth.ts              # Novy
│   ├── useCart.ts              # Novy
│   └── useRealtime.ts         # Novy (SSE pro live vysledky)
│
└── data/
    └── fields.ts               # Stavajici
```

---

## Zaver

Tento dokument definuje kompletni IT architekturu pro Halu Krasovska. Klicova rozhodnuti:

1. **Modularni monolit** v Next.js 16 -- navazuje na existujici kod, minimalizuje provozni slozitost
2. **Comgate** jako primarni platebni brana -- nejlepsi pomer cena/funkce pro cesky spolek
3. **Dotykacka** pro restauracni POS -- overene ceske reseni, ne reinventovat kolo
4. **iSport.cz** zachovat docasne, nahradit vlastnim systemem ve Faze 3
5. **ISDOC** pro ucetni export -- univerzalni cesky standard
6. **Vercel** jako hostingova platforma -- minimalni provozni naklady a slozitost
7. **Postupna implementace** ve 4 fazich za 24 mesicu

Odhadovane celkove naklady: **1.85-2.5 mil. Kc** za vyvoj + **3-6 tis. Kc/mesic** provoz.
