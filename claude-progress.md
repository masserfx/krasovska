# Claude Progress — Krasovská

> Kontrakt mezi sessions. Agent čte na začátku, aktualizuje na konci.

## Stav projektu
- **Fáze**: Vývoj management app + E-shop provoz + Web přestavba
- **Poslední session**: 2026-02-27
- **Poslední agent**: Claude Opus 4.6

## Feature List

| # | Feature | Stav | Ověřeno | Poznámka |
|---|---------|------|---------|----------|
| 1 | Kanban board (drag & drop) | done | ano | Plane API |
| 2 | Dashboard napojený na Plane | done | ano | ISR 5min cache |
| 3 | CEO Briefing viewer | done | ano | react-markdown |
| 4 | E-shop Go Live | pending | ne | Comgate prod credentials potřeba |
| 5 | QR generátor štítků | wip | ne | ~20% hotovo |
| 6 | Session Discipline systém | done | ano | 5 změn: startup protocol, progress bridging, skill, pravidla, hook |
| 7 | MKT strategický plán | done | ano | MKT_PLAN.md (627 řádků, 10 sekcí) |
| 8 | Bistro launch content calendar | done | ano | BISTRO_LAUNCH_CONTENT.md (689 řádků, 10 hotových postů) |
| 9 | Email kampaně | done | ano | EMAIL_KAMPANE.md (317 řádků, 5 automatizovaných sekvencí) |
| 10 | Sezónní kampaně | done | ano | SEZONNI_KAMPANE.md (347 řádků, 12 měsíců) |
| 11 | MKT skills (mkt-post, bistro-promo, seo-audit) | done | ano | 3 skills + 3 šablony (mkt-post, mkt-campaign, mkt-email) |
| 12 | SEO audit halakrasovska.cz | done | ano | Skóre 28/100, 7 kritických + 5 středních + 3 nízké nálezy, 15-bodový akční plán |
| 13 | Web přestavba (Next.js) | done | ano | 12 stránek, 32 souborů, tsc+build OK, port 3002 |

### Stavy
- `pending` — ještě nezačato
- `wip` — rozděláno
- `done` — hotovo a ověřeno
- `failing` — pokus selhal, viz poznámka

## Blokované
- [ ] Comgate produkční credentials (čeká na smlouvu)
- [ ] Distributoři — smlouvy ESH #4

## Deník
### 2026-02-27
- Session: Implementace session discipline systému (startup protocol, progress bridging, hooks)
- Změny: CLAUDE.md (+startup protocol), settings.json (rozšířený hook pro tsc+ruff), nový skill session-discipline, MEMORY.md (+pravidla), claude-progress.md (tento soubor)
- Git: inicializace repo v krasovska/, .gitignore (vyloučen vault, .mcp.json, questionnaire)
- Vault: strategický doc SESSION_DISCIPLINE.md + daily 2026-02-27.md
- Test: PostToolUse hook ověřen na .py (ruff F401) i .tsx (tsc TS2322)
- MKT systém: 5 paralelních agentů vytvořilo kompletní marketingový systém:
  - MKT_PLAN.md (627 řádků) — strategický plán s 10 sekcemi
  - BISTRO_LAUNCH_CONTENT.md (689 řádků) — launch content calendar s 10 hotovými posty
  - EMAIL_KAMPANE.md (317 řádků) — 6 automatizovaných email sekvencí
  - SEZONNI_KAMPANE.md (347 řádků) — 12 měsíčních kampaní
  - 3 šablony: mkt-post, mkt-campaign, mkt-email (vault/06-templates/)
  - 3 skills: /mkt-post, /bistro-promo, /seo-audit
  - Reference přidány do CLAUDE.md a vault/CLAUDE.md
- SEO audit: halakrasovska.cz — skóre 28/100
  - 7 kritických nálezů: chybí robots.txt, sitemap.xml, schema.org, og:title/description, canonical, single-page architektura, zastaralý obsah (ceník 2024)
  - 5 středních: krátký title (36 znaků), krátká description (128 znaků), generický H1, generické alt texty, žádné interní linky
  - 3 nízké: GBP neověřen, NAP konzistence, og:url HTTP
  - Quick wins (#1-9): robots.txt, sitemap, canonical, OG tagy, title, description, H1, alt texty → odhadovaný dopad na ~55/100
  - Uloženo: vault/00-inbox/2026-02-27-seo-audit.md (238 řádků)
- Web přestavba halakrasovska.cz → Next.js 16 (`web/`)
  - Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, port 3002
  - 12 statických stránek: /, /badminton, /viceucelova-plocha, /cvicebni-sal, /cenik, /rezervace, /bistro, /salonky, /kontakt, /gdpr, robots.txt, sitemap.xml
  - SEO: JSON-LD (SportsActivityLocation + Restaurant), OG tagy, canonical, unikátní title/description, popisné alt texty
  - Komponenty: HeroCarousel, ServicesGrid, PricingCards, ReservationSteps, InfoBoxes, MapSection (animovaný pin + tooltip s thumbnail)
  - Layout: Navbar (sticky, mobile hamburger), Footer (4-sloupcový), CookieConsent, GTM integrace
  - Obrázky: 7 staženo z Azure Blob (hero 3× + services 3× + og-image)
  - Client components: pouze 3 (HeroCarousel, MobileMenu, CookieConsent) + MapSection
  - Build: 0 chyb, ~2s kompilace, vše staticky předrenderováno
  - Git: e14f924 (web projekt), 26076ae (fix tooltip z-index)
  - Zbývá: nasazení na Vercel, přesměrování DNS halakrasovska.cz
