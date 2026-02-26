#!/usr/bin/env python3
"""Create modules for new projects and assign issues."""

import json
import time
import urllib.request
import urllib.error

BASE_URL = "http://46.225.31.161/api/v1"
WORKSPACE = "krasovska"
API_KEY = "plane_api_c3b023ea27254bfc8979a6d787dd7e0e"

PROJECTS = {
    "E-shop": "92793297-f6eb-498b-87d3-2f9f4cd7ff34",
    "EOS Integrace": "2fec08e8-eb48-4eaa-b991-71f30f5cbc7c",
    "Salonky": "1addbff0-cc91-4308-9063-262e6ee3fad3",
}

ESHOP_MODULES = [
    {"name": "Příprava", "start": "2026-04-01", "end": "2026-05-30", "issue_names": [
        "Analýza trhu a konkurence", "Výběr platformy", "Smlouvy s distributory"]},
    {"name": "Vývoj", "start": "2026-05-15", "end": "2026-07-15", "issue_names": [
        "Katalog — první kolekce (50+ produktů)", "Fotografie a SEO popisky", "Beta testování", "Spuštění e-shopu"]},
    {"name": "Provoz", "start": "2026-07-15", "end": "2026-10-31", "issue_names": [
        "Marketing a Google Ads", "Integrace s EOS (slevy členům)", "Vyhodnocení po 3 měsících"]},
]

EOS_MODULES = [
    {"name": "Analýza a design", "start": "2026-03-15", "end": "2026-04-30", "issue_names": [
        "Analýza procesů členství", "Výběr/nastavení platformy"]},
    {"name": "Vývoj", "start": "2026-05-01", "end": "2026-07-31", "issue_names": [
        "Migrace dat členů", "Platební modul — příspěvky", "Rezervační systém kurtů", "Integrace s bistrem", "Beta spuštění"]},
    {"name": "Provoz", "start": "2026-08-01", "end": "2026-11-30", "issue_names": [
        "Plné spuštění + školení", "Mobilní PWA", "Vyhodnocení a optimalizace"]},
]

SALONKY_MODULES = [
    {"name": "Příprava", "start": "2026-05-01", "end": "2026-07-31", "issue_names": [
        "Průzkum poptávky", "Stavební úpravy, vybavení", "Cenová politika a balíčky", "Rezervační systém"]},
    {"name": "Spuštění", "start": "2026-08-01", "end": "2026-09-30", "issue_names": [
        "Marketing — B2B Plzeň", "Soft opening salonků", "Plné spuštění", "Cross-promo s bistrem"]},
    {"name": "Provoz", "start": "2026-10-01", "end": "2026-12-31", "issue_names": [
        "Vánoční firemní akce", "Vyhodnocení první sezony"]},
]


def api_request(method, path, data=None):
    url = f"{BASE_URL}/{path}"
    headers = {"X-API-Key": API_KEY, "Content-Type": "application/json"}
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            err = e.read().decode() if e.fp else ""
            if e.code == 429 and attempt < 2:
                wait = 30 * (attempt + 1)
                print(f"  RATE LIMIT — waiting {wait}s")
                time.sleep(wait)
                req = urllib.request.Request(url, data=body, headers=headers, method=method)
                continue
            print(f"  ERROR {e.code}: {method} {path} — {err[:200]}")
            return {"error": e.code}
    return {"error": "max_retries"}


def get_issues(project_id):
    data = api_request("GET", f"workspaces/{WORKSPACE}/projects/{project_id}/issues/")
    return {i["name"]: i["id"] for i in data.get("results", [])}


def create_modules_for_project(proj_name, project_id, modules_def):
    print(f"\n--- {proj_name} ---")
    time.sleep(1.5)
    name_to_id = get_issues(project_id)
    print(f"  Found {len(name_to_id)} issues")

    for mod in modules_def:
        time.sleep(1.5)
        result = api_request("POST", f"workspaces/{WORKSPACE}/projects/{project_id}/modules/", {
            "name": mod["name"],
            "start_date": mod["start"],
            "target_date": mod["end"],
        })
        if "error" in result:
            print(f"  ERROR module '{mod['name']}'")
            continue

        module_id = result["id"]
        print(f"  OK module '{mod['name']}': {module_id[:12]}...")

        issue_ids = [name_to_id[n] for n in mod["issue_names"] if n in name_to_id]
        if issue_ids:
            time.sleep(1.5)
            add = api_request("POST",
                f"workspaces/{WORKSPACE}/projects/{project_id}/modules/{module_id}/issues/",
                {"issues": issue_ids})
            if "error" not in add:
                print(f"    Added {len(issue_ids)} issues")
            else:
                print(f"    ERROR adding issues")


for proj_name, modules in [("E-shop", ESHOP_MODULES), ("EOS Integrace", EOS_MODULES), ("Salonky", SALONKY_MODULES)]:
    create_modules_for_project(proj_name, PROJECTS[proj_name], modules)

print("\nModuly hotové!")
