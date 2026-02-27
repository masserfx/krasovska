# Claude Progress — Krasovská

> Kontrakt mezi sessions. Agent čte na začátku, aktualizuje na konci.

## Stav projektu
- **Fáze**: Vývoj management app + E-shop provoz
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
