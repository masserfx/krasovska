#!/usr/bin/env python3
"""Assign issues to modules for new projects + Bistro relations."""

import json
import time
import urllib.request
import urllib.error

BASE_URL = "http://46.225.31.161/api/v1"
WORKSPACE = "krasovska"
API_KEY = "plane_api_c3b023ea27254bfc8979a6d787dd7e0e"


def api_request(method, path, data=None):
    url = f"{BASE_URL}/{path}"
    headers = {"X-API-Key": API_KEY, "Content-Type": "application/json"}
    body = json.dumps(data).encode() if data else None
    for attempt in range(3):
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            err = e.read().decode() if e.fp else ""
            if e.code == 429 and attempt < 2:
                wait = 30 * (attempt + 1)
                print(f"  RATE LIMIT — waiting {wait}s")
                time.sleep(wait)
                continue
            print(f"  ERROR {e.code}: {method} ...{path[-60:]} — {err[:200]}")
            return {"error": e.code}
    return {"error": "max_retries"}


def get_issues(project_id):
    data = api_request("GET", f"workspaces/{WORKSPACE}/projects/{project_id}/issues/")
    return {i["name"]: i["id"] for i in data.get("results", [])}


def get_modules(project_id):
    data = api_request("GET", f"workspaces/{WORKSPACE}/projects/{project_id}/modules/")
    items = data.get("results", data) if isinstance(data, dict) else data
    return {m["name"]: m["id"] for m in items}


# ============================================================
# ČÁST 1: Přiřazení issues do modulů pro nové projekty
# ============================================================

PROJECTS = {
    "E-shop": "92793297-f6eb-498b-87d3-2f9f4cd7ff34",
    "EOS Integrace": "2fec08e8-eb48-4eaa-b991-71f30f5cbc7c",
    "Salonky": "1addbff0-cc91-4308-9063-262e6ee3fad3",
}

MODULE_ASSIGNMENTS = {
    "E-shop": {
        "Příprava": ["Analýza trhu a konkurence", "Výběr platformy", "Smlouvy s distributory"],
        "Vývoj": ["Katalog — první kolekce (50+ produktů)", "Fotografie a SEO popisky", "Beta testování", "Spuštění e-shopu"],
        "Provoz": ["Marketing a Google Ads", "Integrace s EOS (slevy členům)", "Vyhodnocení po 3 měsících"],
    },
    "EOS Integrace": {
        "Analýza a design": ["Analýza procesů členství", "Výběr/nastavení platformy"],
        "Vývoj": ["Migrace dat členů", "Platební modul — příspěvky", "Rezervační systém kurtů", "Integrace s bistrem", "Beta spuštění"],
        "Provoz": ["Plné spuštění + školení", "Mobilní PWA", "Vyhodnocení a optimalizace"],
    },
    "Salonky": {
        "Příprava": ["Průzkum poptávky", "Stavební úpravy, vybavení", "Cenová politika a balíčky", "Rezervační systém"],
        "Spuštění": ["Marketing — B2B Plzeň", "Soft opening salonků", "Plné spuštění", "Cross-promo s bistrem"],
        "Provoz": ["Vánoční firemní akce", "Vyhodnocení první sezony"],
    },
}

print("=" * 60)
print("ČÁST 1: Přiřazení issues do modulů")
print("=" * 60)

for proj_name, pid in PROJECTS.items():
    print(f"\n--- {proj_name} ---")
    time.sleep(1.5)
    issues = get_issues(pid)
    time.sleep(1.5)
    modules = get_modules(pid)
    print(f"  Issues: {len(issues)}, Modules: {len(modules)}")

    for mod_name, issue_names in MODULE_ASSIGNMENTS[proj_name].items():
        mod_id = modules.get(mod_name)
        if not mod_id:
            print(f"  SKIP module '{mod_name}': not found")
            continue

        issue_ids = [issues[n] for n in issue_names if n in issues]
        if not issue_ids:
            print(f"  SKIP module '{mod_name}': no matching issues")
            continue

        # First one already added for E-shop Příprava, but API handles duplicates
        time.sleep(1.5)
        result = api_request("POST",
            f"workspaces/{WORKSPACE}/projects/{pid}/modules/{mod_id}/module-issues/",
            {"issues": issue_ids})
        if "error" not in result:
            print(f"  OK '{mod_name}': {len(issue_ids)} issues")
        else:
            print(f"  WARN '{mod_name}': may have partial success")


# ============================================================
# ČÁST 2: Závislosti pro Bistro
# ============================================================

BISTRO_PROJECT_ID = "c7f73e13-5bf2-405e-a952-3cccf2177f19"

BISTRO_RELATIONS = [
    (8, 10), (10, 6), (6, 2), (2, 12), (2, 14), (2, 16), (2, 22),
    (2, 24), (2, 30), (2, 32), (2, 26), (2, 28), (2, 18), (2, 20),
    (24, 4), (30, 4), (32, 4), (28, 34), (22, 38), (28, 40), (34, 40),
    (30, 46), (18, 46), (32, 48), (18, 48), (26, 50), (22, 52),
    (24, 54), (52, 54), (54, 56), (14, 58), (46, 58), (48, 58),
    (20, 44), (52, 44), (52, 60), (54, 60), (58, 60),
    (52, 62), (46, 62), (40, 62), (58, 64), (46, 64), (48, 64),
    (38, 66), (60, 68), (66, 68), (54, 80), (54, 70), (62, 70),
    (36, 76), (54, 76), (46, 42), (48, 42), (58, 42), (60, 42),
    (64, 84), (64, 94), (94, 96), (70, 116), (96, 98), (94, 100),
    (100, 104), (100, 102), (100, 108), (102, 118), (102, 106), (108, 106),
    (106, 86), (106, 122), (86, 110), (86, 112), (86, 114), (86, 120),
    (100, 90), (116, 92), (102, 88),
    (88, 134), (88, 128), (98, 136), (134, 138), (136, 138),
    (120, 140), (134, 132), (140, 130), (140, 142), (142, 124),
    (134, 148), (124, 144), (142, 158), (142, 160), (144, 146),
    (142, 126), (134, 150), (144, 162), (138, 152), (134, 154),
    (124, 156), (142, 156),
]

print("\n\n" + "=" * 60)
print("ČÁST 2: Závislosti pro Bistro (99 relations)")
print("=" * 60)

time.sleep(1.5)
issues = api_request("GET", f"workspaces/{WORKSPACE}/projects/{BISTRO_PROJECT_ID}/issues/")
seq_to_id = {i["sequence_id"]: i["id"] for i in issues.get("results", [])}
print(f"Loaded {len(seq_to_id)} issues")

created = 0
errors = 0
for blocker_seq, blocked_seq in BISTRO_RELATIONS:
    blocker_id = seq_to_id.get(blocker_seq)
    blocked_id = seq_to_id.get(blocked_seq)

    if not blocker_id or not blocked_id:
        print(f"  SKIP BIS-{blocker_seq} -> BIS-{blocked_seq}: ID not found")
        errors += 1
        continue

    time.sleep(1.5)
    result = api_request("POST",
        f"workspaces/{WORKSPACE}/projects/{BISTRO_PROJECT_ID}/issues/{blocked_id}/relations/",
        {
            "relation_type": "blocked_by",
            "related_issue": blocker_id,
            "project_id": BISTRO_PROJECT_ID,
        })

    if "error" not in result:
        print(f"  OK BIS-{blocker_seq:3d} → BIS-{blocked_seq:3d}")
        created += 1
    else:
        errors += 1

print(f"\nRelations: {created} created, {errors} errors (of {len(BISTRO_RELATIONS)} planned)")
print("\nHOTOVO!")
