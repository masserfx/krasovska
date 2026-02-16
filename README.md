# Hala Krašovská — Projektový dotazník

Webová aplikace pro sběr požadavků na ERP/CRM systém **Sportovní haly Krašovská** v Plzni. Slouží jako strukturovaný vstupní dotazník pro první schůzku s vedením haly.

## O projektu

Sportovní hala Krašovská (Badmintonová Akademie Plzeň, z.s.) je moderní sportovní centrum s 9 badmintonovými kurty, víceúčelovou plochou, cvičebním sálem, saunou a bistrem. Hala pořádá turnaje včetně mezinárodních, provozuje kroužky a kurzy pro všechny věkové kategorie.

Cílem projektu je navrhnout a implementovat on-premise ERP/CRM systém, který pokryje:

- Rezervace sportovišť
- Členskou evidenci a CRM
- Správu aktivit, kroužků a kurzů
- Organizaci turnajů a akcí
- E-shop s prodejem sportovního vybavení
- Provoz restaurace / bistra
- Finance, fakturaci a reporting
- Marketing a komunikaci

## Dotazník

Aplikace obsahuje **14 tematických sekcí** se **130+ otázkami** pokrývajícími kompletní analýzu potřeb:

| Sekce | Zaměření |
|-------|----------|
| Organizace a vedení | Právní forma, struktura, rozhodování |
| Personální zajištění | Zaměstnanci, trenéři, směny, mzdy |
| Finance a rozpočet | Příjmy, dotace, platby, účetnictví |
| Sportoviště a prostory | Kurty, sály, sauna, kapacity |
| Rezervační systém | Současný stav, požadavky na nový systém |
| Členství a CRM | Členské programy, evidence, komunikace |
| Aktivity a kroužky | Sporty, kurzy, registrace, docházka |
| Turnaje a akce | Organizace, mezinárodní akce, rozpočty |
| E-shop a prodej | Sortiment, platby, sklad, doprava |
| Restaurace / Bistro | Provoz, menu, pokladna, HACCP |
| Marketing a komunikace | Web, soc. sítě, branding, PR |
| IT infrastruktura | HW, síť, server, bezpečnost |
| Legislativa a GDPR | Ochrana dat, smlouvy, pojištění |
| Cíle a vize projektu | Priority, termíny, kritéria úspěchu |

## Funkce

- **Automatické ukládání** — data se průběžně ukládají do localStorage
- **Progress tracking** — vizuální přehled vyplněnosti každé sekce
- **Export JSON** — pro strojové zpracování a opětovný import
- **Export TXT** — čitelný textový report pro tisk a sdílení
- **Import** — načtení dříve uloženého dotazníku
- **Tisk** — optimalizovaný tiskový výstup
- **Responzivní design** — desktop, tablet i mobil

## Technologie

- [Next.js](https://nextjs.org/) 16 (App Router)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Lucide React](https://lucide.dev/) (ikony)

## Spuštění

```bash
npm install
npm run dev
```

Aplikace poběží na [http://localhost:3000](http://localhost:3000).

## Licence

Interní projekt — všechna práva vyhrazena.
