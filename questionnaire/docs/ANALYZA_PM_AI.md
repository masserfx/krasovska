# Analýza: AI-augmentovaný projekt management pro Hala Krasovská

## Aktuální stav

| Vrstva | Nástroj | Stav |
|--------|---------|------|
| Projekt management | Plane CE v1.2.2 | ✅ 4 projekty, 111 issues, 99 závislostí |
| AI bridge | Plane MCP Server | ✅ Claude Code čte/píše do Plane |
| Knowledge base | Markdown docs (statické) | ⚠️ 10+ dokumentů, ale bez AI vrstvy |
| RAG / embeddings | — | ❌ neexistuje |
| Obsidian vault | — | ❌ neexistuje |
| Automatizace | — | ❌ žádné cron joby, hooky, agenti |

---

## Zjištěné přístupy z praxe

### 1. CCPM — Claude Code Project Management
**Zdroj**: [automazeio/ccpm](https://github.com/automazeio/ccpm)

Spec-driven workflow: PRD → Epic → Issues → paralelní agenti v git worktrees.

| Vlastnost | Detail |
|-----------|--------|
| Source of truth | GitHub Issues |
| Paralelismus | Každý agent vlastní worktree, bez merge konfliktů |
| Traceabilita | Každý commit → acceptance criteria → issue → epic → PRD |
| Příkazy | `/pm:prd-new`, `/pm:prd-parse`, `/pm:epic-oneshot`, `/pm:issue-start` |

**Relevance pro Krasovskou**: Vysoká. Nahradí ad-hoc práci s Claude Code strukturovaným workflow. Ale vyžaduje GitHub Issues — my máme Plane.

### 2. Obsidian + Claude Code PKM
**Zdroj**: [ballred/obsidian-claude-pkm](https://github.com/ballred/obsidian-claude-pkm)

Hierarchický systém: 3letá vize → roční cíle → projekty → měsíční → týdenní → denní.

| Vlastnost | Detail |
|-----------|--------|
| Agenti | 4 specializovaní (goal-aligner, weekly-reviewer, note-organizer, inbox-processor) |
| Skills | `/daily`, `/weekly`, `/monthly`, `/project`, `/review` |
| Hooky | Auto-commit po každé změně, session init |
| Paměť | Cross-session memory přes `memory: project` |

**Relevance**: Střední. Skvělé pro osobní produktivitu CEO/manažera, ale nepokrývá týmový PM.

### 3. Knowledge Vault (Claude Code + Obsidian)
**Zdroj**: [naushadzaman/knowledge-vault](https://gist.github.com/naushadzaman/164e85ec3557dc70392249e548b423e9)

Nahrazuje Evernote + Notion + Asana + Otter.ai jedním Obsidian vaultem.

| Vlastnost | Detail |
|-----------|--------|
| Pilíře | Content digestion, Project knowledge, Task management, Meetings |
| Skills | `/digest`, `/meeting-summary`, `/deep-research`, `/code-review` |
| Kontext | CLAUDE.md v každém projektovém adresáři |
| Struktura | 00-inbox → 01-todos → 02-projects → 03-resources |

**Relevance**: Vysoká pro knowledge management část. Přesně řeší problém ztracených znalostí.

### 4. Teresa Torres — Lazy Prompting
**Zdroj**: [chatprd.ai](https://www.chatprd.ai/how-i-ai/teresa-torres-claude-code-obsdian-task-management)

Markdown tasky v Obsidianu + `/today` příkaz + automatizovaný research digest.

| Vlastnost | Detail |
|-----------|--------|
| Tasky | Každý = markdown soubor s YAML front matter |
| Příkazy | `/today` generuje denní přehled |
| Research | Cron joby: arXiv/Scholar search + Claude sumarizace |
| Kontext | Desítky modulárních MD souborů místo jednoho CLAUDE.md |

**Relevance**: Vysoká pro denní workflow. Jednoduchá implementace s okamžitým efektem.

### 5. Obsidian RAG (LightRAG / Qdrant)
**Zdroj**: [dasroot.net](https://dasroot.net/posts/2025/12/rag-personal-knowledge-management-obsidian-integration/)

Plná RAG pipeline: vault → embeddings → vector store → semantic search → LLM.

| Vlastnost | Detail |
|-----------|--------|
| Framework | LightRAG (10× úspornější než GraphRAG) |
| Embeddings | BAAI/bge-m3 |
| Vector DB | Qdrant / PostgreSQL / ChromaDB |
| Výkon | 2000+ notes/sec, 97% recall na 5000 dokumentech |

**Relevance**: Budoucí fáze. Overkill pro 10 dokumentů, ale cenný při 100+.

### 6. Claude Task Master
**Zdroj**: [eyaltoledano/claude-task-master](https://github.com/eyaltoledano/claude-task-master)

PRD → strukturované tasky s dependencies + complexity analysis.

| Vlastnost | Detail |
|-----------|--------|
| Vstup | PRD dokument |
| Výstup | Tasky se subtasky, závislostmi, statusy |
| AI modely | Claude, OpenAI, Gemini, Perplexity |
| Integrace | MCP server pro editory |

**Relevance**: Střední. Zajímavá complexity analysis, ale duplikuje Plane.

---

## Doporučená architektura pro Krasovskou

### Cílový stav

```
┌─────────────────────────────────────────────────┐
│                  CEO / Manažer                   │
│         (Obsidian vault + Claude Code)           │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐ │
│  │ /daily   │  │ /weekly  │  │ /bistro-status│ │
│  │ /project │  │ /monthly │  │ /finance      │ │
│  └────┬─────┘  └────┬─────┘  └──────┬────────┘ │
│       │              │               │           │
│  ┌────▼──────────────▼───────────────▼────────┐ │
│  │          Knowledge Vault (Obsidian)         │ │
│  │  00-inbox/ 01-todos/ 02-projects/           │ │
│  │  03-resources/ 04-meetings/ docs/           │ │
│  └────────────────────┬───────────────────────┘ │
│                       │                          │
│  ┌────────────────────▼───────────────────────┐ │
│  │          Claude Code + MCP Servery          │ │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────────┐ │ │
│  │  │Plane MCP│ │Obsidian  │ │Context7 MCP │ │ │
│  │  │(issues) │ │MCP (vault│ │(docs)       │ │ │
│  │  └────┬────┘ └────┬─────┘ └─────────────┘ │ │
│  └───────┼───────────┼───────────────────────┘ │
│          │           │                          │
├──────────┼───────────┼──────────────────────────┤
│          ▼           ▼                          │
│  ┌─────────────┐  ┌──────────────────┐         │
│  │  Plane CE   │  │  Qdrant (budoucí)│         │
│  │  4 projekty │  │  RAG pipeline    │         │
│  │  111 issues │  │  embeddings      │         │
│  └─────────────┘  └──────────────────┘         │
│                                                  │
│  Server: 46.225.31.161                          │
└─────────────────────────────────────────────────┘
```

### Fáze implementace

#### Fáze 1: Knowledge Vault (1–2 dny) — okamžitý efekt

Vytvořit Obsidian vault s modulární strukturou:

```
krasovska-vault/
├── CLAUDE.md                    # AI kontext a navigace
├── .claude/
│   ├── skills/
│   │   ├── daily.md             # /daily — denní přehled
│   │   ├── weekly.md            # /weekly — týdenní review
│   │   ├── bistro-status.md     # /bistro-status — stav z Plane
│   │   └── finance.md           # /finance — finanční přehled
│   └── settings.json
├── 00-inbox/                    # Rychlé poznámky, nápady
├── 01-projekty/
│   ├── bistro/CLAUDE.md         # Kontext pro Bistro
│   ├── eshop/CLAUDE.md
│   ├── eos/CLAUDE.md
│   └── salonky/CLAUDE.md
├── 02-strategie/                # Existující docs (migrace)
│   ├── BISTRO_STRATEGIE.md
│   ├── BISTRO_FINANCNI_MODEL.md
│   └── ...
├── 03-meetings/                 # Zápisy z jednání
├── 04-finance/                  # Finanční reporty
└── 05-templates/                # Šablony
```

**Přínos**: Všechny znalosti na jednom místě, Claude Code má kontext, `/daily` a `/weekly` přehled.

#### Fáze 2: Plane ↔ Obsidian sync (3–5 dní)

Python skripty (cron) pro obousměrný sync:

| Směr | Co | Frekvence |
|------|----|-----------|
| Plane → Obsidian | Stav issues, milestones, timeline | Denně |
| Plane → Obsidian | KPI dashboard (tržby, food cost) | Týdně |
| Obsidian → Plane | Nové tasky z inbox | On-demand |

Skill `/bistro-status` zavolá Plane MCP a vygeneruje markdown report.

**Přínos**: CEO vidí vše v Obsidianu, nemusí přepínat do Plane UI.

#### Fáze 3: AI agenti (1–2 týdny)

Specializovaní agenti s cross-session pamětí:

| Agent | Účel | Trigger |
|-------|------|---------|
| **progress-tracker** | Kontroluje Plane, hlásí zpožděné úkoly | Denně 8:00 |
| **finance-analyst** | Analyzuje food cost, tržby vs. plán | Týdně pondělí |
| **risk-monitor** | Identifikuje blokované závislosti | Denně |
| **meeting-scribe** | Sumarizuje zápisy, vytváří action items | Po meetingu |

**Přínos**: Proaktivní upozornění místo reaktivního checkování.

#### Fáze 4: RAG pipeline (budoucí, při 100+ dokumentech)

Až naroste knowledge base:

```
Obsidian vault (markdown)
    ↓ indexer (cron, při změně)
Qdrant (vector store, na 46.225.31.161)
    ↓ semantic search
Claude Code (augmentované odpovědi)
```

**Přínos**: "Jaký byl food cost v červnu?" → odpověď z dat, ne z paměti.

---

## Srovnání přístupů

| Přístup | Složitost | Efekt | Vhodnost |
|---------|-----------|-------|----------|
| Pouze Plane + MCP (současný stav) | ★☆☆☆☆ | ★★☆☆☆ | Základ je hotový |
| + Obsidian Knowledge Vault (Fáze 1) | ★★☆☆☆ | ★★★★☆ | **Nejlepší poměr effort/value** |
| + Plane↔Obsidian sync (Fáze 2) | ★★★☆☆ | ★★★★☆ | Eliminuje přepínání kontextu |
| + AI agenti (Fáze 3) | ★★★★☆ | ★★★★★ | Proaktivní management |
| + RAG pipeline (Fáze 4) | ★★★★★ | ★★★☆☆ | Až při velké knowledge base |
| CCPM (GitHub Issues) | ★★★☆☆ | ★★★★☆ | Spíš pro dev týmy, ne bistro |
| Claude Task Master | ★★☆☆☆ | ★★★☆☆ | Duplikuje Plane |

---

## Doporučení

**Začít Fází 1** — Obsidian Knowledge Vault. Důvody:

1. **Nulové náklady** — Obsidian je zdarma, vault = složka s markdown soubory
2. **Okamžitý přínos** — `/daily` přehled za 1 den práce
3. **Využití existujícího** — migrace 10+ dokumentů z `questionnaire/docs/`
4. **Základ pro vše další** — RAG, agenti, sync — vše staví na vaultu
5. **CEO-friendly** — jeden nástroj místo tří (Plane + Next.js + terminál)

Druhý krok: Fáze 2 (sync) pro eliminaci nutnosti přepínat mezi Obsidian a Plane.

---

## Zdroje

- [CCPM — Claude Code Project Management](https://github.com/automazeio/ccpm)
- [Obsidian + Claude Code PKM](https://github.com/ballred/obsidian-claude-pkm)
- [Knowledge Vault (Claude + Obsidian)](https://gist.github.com/naushadzaman/164e85ec3557dc70392249e548b423e9)
- [Teresa Torres — Claude Code + Obsidian workflow](https://www.chatprd.ai/how-i-ai/teresa-torres-claude-code-obsdian-task-management)
- [RAG pro Obsidian (LightRAG)](https://dasroot.net/posts/2025/12/rag-personal-knowledge-management-obsidian-integration/)
- [Claude Task Master](https://github.com/eyaltoledano/claude-task-master)
- [Plane MCP Server](https://mcpservers.org/servers/makeplane/plane-mcp-server)
- [Obsidian RAG plugin (Qdrant + Ollama)](https://github.com/Vasallo94/ObsidianRAG)
- [Hierarchical Planning with KG-RAG (ICML 2025)](https://arxiv.org/abs/2504.04578)
