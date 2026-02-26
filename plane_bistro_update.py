#!/usr/bin/env python3
"""Update Plane Bistro project to match actual production state.

Bistro has 81 issues in Plane (all Todo). Production has:
- Full Kanban board with 80 seeded tasks (mirror of Plane issues)
- Controlling dashboard (11 months KPI, inline edit)
- 8 strategy sections (hardcoded)
- Gantt chart, CEO Briefing viewer
- DB schema (bistro_phases, bistro_tasks, bistro_kpis)
- 4 API routes (phases, tasks, tasks/[id], kpis)
- NO Plane sync, NO dynamic strategy, NO CEO Briefing MD

The 81 Plane issues represent the OPERATIONAL plan for the physical bistro.
The code implements the MANAGEMENT TOOL to track those issues.

What's "Done" in code terms:
- Management app itself (Kanban, KPI, Strategy, Gantt, Briefing)
- Business case / strategy docs (hardcoded but complete)
- Legislative checklist UI

What's still "Todo" operationally:
- All 81 physical bistro tasks (permits, equipment, hiring, etc.)
- These START from Feb 26, 2026 (today!) with issue #8 "Rozhodnuti: spustit Quick Start"
"""

import json
import time
import urllib.request

API = "http://46.225.31.161/api/v1/workspaces/krasovska/projects/c7f73e13-5bf2-405e-a952-3cccf2177f19"
HEADERS = {
    "x-api-key": "plane_api_c3b023ea27254bfc8979a6d787dd7e0e",
    "Content-Type": "application/json",
}
DELAY = 1.5

# States
DONE = "8c5c6dba-0258-4bcc-8a5d-0daf7d66b1f1"
TODO = "0073bc7f-d4d5-4efa-b047-ad68d98c2c22"
IN_PROGRESS = "286087a1-4354-43ae-ba07-6688348c7ea5"

# Labels
TASK = "7e8fcc90-0213-4813-aebe-6068c77a640d"
MILESTONE = "121fae90-b788-48c4-8a25-de2a3fedff3d"
GOAL = "2589c177-4017-4f5a-bd75-4f05e5d3585d"

# Modules
MOD_QUICK = "09e65a5c-9608-45e6-bb70-e9ec1a6f8c19"   # Quick Start
MOD_MVP = "219320e7-b910-45f5-9ffb-c2d5c4da8b1b"      # MVP → Standard
MOD_STD = "d384407f-95d7-4f39-9dc1-1faa1a4b9667"       # Standard → Full
MOD_FULL = "c4900aa3-3e0b-4c6b-912f-80865ab9c00c"      # Full Operace


def api_call(method, path, data=None):
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(f"{API}{path}", data=body, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  ERROR {e.code}: {e.read().decode()[:200]}")
        return None


# Get all issues
print("Loading all 81 issues...")
issues_data = api_call("GET", "/issues/?per_page=100")
issues = {i["sequence_id"]: i for i in issues_data.get("results", [])}
print(f"  Loaded {len(issues)} issues\n")


# ═══════════════════════════════════════════════════════════════
# 1. UPDATE EXISTING ISSUES — mark what's relevant today
# ═══════════════════════════════════════════════════════════════

print("═══ UPDATING EXISTING OPERATIONAL ISSUES ═══\n")

# Today is 2026-02-26. Quick Start phase starts now.
# Issue #8 "Rozhodnuti: spustit Quick Start" has start_date 2026-02-26
# Mark it as In Progress since we're deciding today

today_in_progress = [8]  # Rozhodnuti: spustit Quick Start

for seq_id in today_in_progress:
    if seq_id in issues:
        issue = issues[seq_id]
        time.sleep(DELAY)
        result = api_call("PATCH", f"/issues/{issue['id']}/", {"state": IN_PROGRESS})
        if result:
            print(f"  🔄 #{seq_id} → In Progress: {issue['name']}")


# ═══════════════════════════════════════════════════════════════
# 2. ASSIGN ALL ISSUES TO MODULES (they weren't assigned before)
# ═══════════════════════════════════════════════════════════════

print("\n═══ ASSIGNING ISSUES TO MODULES ═══\n")

# Phase mapping based on sequence_id ranges and dates:
# Quick Start (Feb-Mar): #2-#40 (issues with dates in Feb-Mar 2026)
# MVP→Standard (Apr): #42-#82 (issues with dates in Apr 2026)
# Standard→Full (May-Jun): #84-#122 (issues with dates in May-Jun 2026)
# Full Operace (Jul-Dec): #124-#162 (issues with dates Jul-Dec 2026)

module_ranges = {
    MOD_QUICK: range(2, 41, 2),    # #2-#40 (even numbers)
    MOD_MVP: range(42, 83, 2),     # #42-#82
    MOD_STD: range(84, 123, 2),    # #84-#122
    MOD_FULL: range(124, 163, 2),  # #124-#162
}

for module_id, seq_range in module_ranges.items():
    batch = []
    for seq_id in seq_range:
        if seq_id in issues:
            batch.append(issues[seq_id]["id"])

    if batch:
        time.sleep(DELAY)
        result = api_call("POST", f"/modules/{module_id}/module-issues/", {"issues": batch})
        mod_name = {MOD_QUICK: "Quick Start", MOD_MVP: "MVP→Standard", MOD_STD: "Standard→Full", MOD_FULL: "Full Operace"}[module_id]
        print(f"  ✓ {mod_name}: assigned {len(batch)} issues")


# ═══════════════════════════════════════════════════════════════
# 3. CREATE NEW ISSUES — for the management app itself
# ═══════════════════════════════════════════════════════════════

print("\n═══ CREATING NEW ISSUES (management app — Done in prod) ═══\n")

app_issues = [
    {
        "name": "Bistro management app — Kanban board",
        "description_html": "<p>Plně funkční Kanban board se 3 sloupci (todo/in_progress/done), drag-drop (dnd-kit), task modal (CRUD), overdue notifikace, optimistic updates. KanbanBoard.tsx + PhaseSwimLane.tsx + TaskCard.tsx + TaskModal.tsx = 1204 řádků.</p>",
        "state": DONE, "labels": [TASK], "priority": "high",
        "start_date": "2026-02-10", "target_date": "2026-02-18",
    },
    {
        "name": "Bistro management app — Controlling dashboard",
        "description_html": "<p>Tabulka 11 měsíců (únor-prosinec 2026) s inline editací KPI: plán/skut. tržby, pokryvy, avg ticket, break-even%, delta. POST na /api/bistro/kpis. ControllingDashboard.tsx = 267 řádků.</p>",
        "state": DONE, "labels": [TASK], "priority": "high",
        "start_date": "2026-02-12", "target_date": "2026-02-18",
    },
    {
        "name": "Bistro management app — Strategie (8 sekcí)",
        "description_html": "<p>ExecutiveSummary, VariantComparison (A/B/C), FinancialModel (220K investice), PersonnelPlan (4 pozice), MarketingPlan (3 fáze), LegislativeChecklist (9 bodů), SuppliersSection (10 dodavatelů), SalonkySection (4 balíčky). Celkem 1135 řádků. Hardcoded data.</p>",
        "state": DONE, "labels": [TASK], "priority": "high",
        "start_date": "2026-02-14", "target_date": "2026-02-20",
    },
    {
        "name": "Bistro management app — Gantt chart",
        "description_html": "<p>Vizuální Gantt chart: 4 fáze na ose Y, měsíce (únor-prosinec) na ose X. Barevné pruhy, tooltip s daty. GanttChart.tsx = 180 řádků.</p>",
        "state": DONE, "labels": [TASK], "priority": "medium",
        "start_date": "2026-02-16", "target_date": "2026-02-20",
    },
    {
        "name": "Bistro management app — CEO Briefing viewer",
        "description_html": "<p>BriefingViewer.tsx: čte /public/docs/CEO_BRIEFING.md, renderuje react-markdown + remark-gfm, tlačítko Tisk. 95 řádků. MD soubor zatím chybí.</p>",
        "state": DONE, "labels": [TASK], "priority": "medium",
        "start_date": "2026-02-18", "target_date": "2026-02-22",
    },
    {
        "name": "Bistro DB schéma + API routes (4 endpointy)",
        "description_html": "<p>DB: bistro_phases, bistro_tasks, bistro_kpis (auto-seed). API: GET/POST /phases, GET/POST /tasks, PATCH/DELETE /tasks/[id], GET/POST /kpis. Celkem ~440 řádků. Vercel Postgres.</p>",
        "state": DONE, "labels": [TASK], "priority": "urgent",
        "start_date": "2026-02-08", "target_date": "2026-02-15",
    },
    {
        "name": "Bistro Plane integration — sync tasks",
        "description_html": "<p>Propojit Kanban board s Plane API místo lokální DB. Synchronizace: Plane → bistro_tasks → UI. Včetně závislostí (blocking/blocked_by). Aktuálně Kanban a Plane žijí odděleně.</p>",
        "state": TODO, "labels": [TASK], "priority": "high",
        "start_date": "2026-03-15", "target_date": "2026-04-15",
    },
    {
        "name": "Strategie — přesun dat z kódu do DB",
        "description_html": "<p>8 strategických sekcí je hardcoded v komponentách. Přesunout do DB nebo Plane pages pro editovatelnost: finanční model, personální plán, marketing, dodavatelé, legislativa.</p>",
        "state": TODO, "labels": [TASK], "priority": "medium",
        "start_date": "2026-04-01", "target_date": "2026-04-30",
    },
    {
        "name": "CEO Briefing — generovat MD z dat",
        "description_html": "<p>Automaticky generovat CEO_BRIEFING.md z aktuálních dat: KPI, stav úkolů, milníky, rizika. Aktuálně BriefingViewer existuje, ale MD soubor chybí.</p>",
        "state": TODO, "labels": [TASK], "priority": "medium",
        "start_date": "2026-04-15", "target_date": "2026-05-15",
    },
    {
        "name": "Controlling — import tržeb z e-shop orders",
        "description_html": "<p>Automaticky plnit revenue_actual v KPI z tabulky orders (e-shop). Aktuálně se KPI vyplňují ručně inline editací. Hook: orders → bistro_kpis.revenue_actual.</p>",
        "state": TODO, "labels": [TASK], "priority": "low",
        "start_date": "2026-05-01", "target_date": "2026-06-01",
    },
]

for issue_data in app_issues:
    time.sleep(DELAY)
    result = api_call("POST", "/issues/", issue_data)
    if result:
        state_name = "Done" if issue_data["state"] == DONE else "Todo"
        print(f"  ✓ #{result['sequence_id']} [{state_name}] {result['name']}")


# ═══════════════════════════════════════════════════════════════
# 4. UPDATE MODULE STATUS — Quick Start is starting NOW
# ═══════════════════════════════════════════════════════════════

print("\n═══ UPDATING MODULE STATUS ═══\n")

# Quick Start: starts today (Feb 26), mark as active
# Others stay planned
# (Plane API doesn't support "active" status, only planned/completed)

print("  Module status unchanged (API only supports planned/completed)")


print("\n═══ HOTOVO ═══")
print(f"  81 original issues: 1 In Progress, 80 Todo (operational plan)")
print(f"  10 new issues: 6 Done (management app), 4 Todo (improvements)")
print(f"  All issues assigned to 4 modules")
