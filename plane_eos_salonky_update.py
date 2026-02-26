#!/usr/bin/env python3
"""Update Plane EOS Integrace and Salonky projects to match actual state."""

import json
import time
import urllib.request

HEADERS = {
    "x-api-key": "plane_api_c3b023ea27254bfc8979a6d787dd7e0e",
    "Content-Type": "application/json",
}
DELAY = 1.5


def api(base, method, path, data=None):
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(f"{base}{path}", data=body, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  ERROR {e.code}: {e.read().decode()[:200]}")
        return None


# ═══════════════════════════════════════════════════════════════
# EOS INTEGRACE
# ═══════════════════════════════════════════════════════════════

EOS_API = "http://46.225.31.161/api/v1/workspaces/krasovska/projects/2fec08e8-eb48-4eaa-b991-71f30f5cbc7c"

# States
EOS_STATES = {}
for s in api(EOS_API, "GET", "/states/").get("results", []):
    EOS_STATES[s["group"]] = s["id"]
EOS_DONE = EOS_STATES["completed"]
EOS_TODO = EOS_STATES["unstarted"]
EOS_PROGRESS = EOS_STATES["started"]
EOS_BACKLOG = EOS_STATES["backlog"]

# Labels
EOS_LABELS = {}
for l in api(EOS_API, "GET", "/labels/").get("results", []):
    EOS_LABELS[l["name"]] = l["id"]
EOS_TASK = EOS_LABELS["task"]
EOS_MILESTONE = EOS_LABELS["milestone"]
EOS_GOAL = EOS_LABELS["goal"]

# Modules
EOS_MODULES = {}
for m in api(EOS_API, "GET", "/modules/").get("results", []):
    EOS_MODULES[m["name"]] = m["id"]
EOS_MOD_ANALYZA = EOS_MODULES["Analýza a design"]
EOS_MOD_VYVOJ = EOS_MODULES["Vývoj"]
EOS_MOD_PROVOZ = EOS_MODULES["Provoz"]

print("\n" + "=" * 60)
print("  EOS INTEGRACE — UPDATE")
print("=" * 60)

# --- 1. Update existing issues ---
# Production: only a checklist UI for EOS meeting (discovery/analysis phase)
# Issue #1 "Analýza procesů členství" → In Progress (checklist exists in prod)

eos_existing = {
    # #1 Analýza procesů členství → In Progress (checklist UI built)
    "0750647e-53b3-4fb4-a45b-b4e8318f5e52": {
        "state": EOS_PROGRESS, "labels": [EOS_TASK],
        "description_html": "<p>V produkci existuje interaktivní checklist pro schůzku s EOS (8 sekcí, 32 otázek). UI hotové, data se sbírají.</p>",
    },
    # #2 Výběr/nastavení platformy → Todo
    "fcd0ba51-d73e-4555-83b2-a7b06dcbad86": {"state": EOS_TODO, "labels": [EOS_TASK]},
    # #3 Migrace dat členů → Todo
    "529db02b-ba75-49e8-8e1a-43f5f27e06ee": {"state": EOS_TODO, "labels": [EOS_TASK]},
    # #4 Platební modul → Todo
    "4464c83c-1e18-4178-ab2a-e6f959b55e97": {"state": EOS_TODO, "labels": [EOS_TASK]},
    # #5 Rezervační systém kurtů → Todo
    "f82ad599-2d3c-4b2e-8e98-2e9e6e99d91c": {"state": EOS_TODO, "labels": [EOS_TASK]},
    # #6 Integrace s bistrem → Todo
    "e577cccf-73af-46aa-a9dc-c27f1b8c01d5": {"state": EOS_TODO, "labels": [EOS_TASK]},
    # #7 Beta spuštění → Todo + milestone
    "7a02b844-fdab-4e06-b2b2-b1331bda3c7b": {"state": EOS_TODO, "labels": [EOS_MILESTONE]},
    # #8 Plné spuštění → Todo + milestone
    "ed66142e-0f45-454b-bbc7-f6acf3b73abf": {"state": EOS_TODO, "labels": [EOS_MILESTONE]},
    # #9 Mobilní PWA → Todo
    "61baa5a0-3fa6-4fcc-9ad4-98b5d2e2e2ad": {"state": EOS_TODO, "labels": [EOS_TASK]},
    # #10 Vyhodnocení → Todo + goal
    "1af24868-fd94-4db1-a5e1-e8e9d67e1fc1": {"state": EOS_TODO, "labels": [EOS_GOAL]},
}

print("\n--- Updating existing issues ---")
for issue_id, data in eos_existing.items():
    time.sleep(DELAY)
    result = api(EOS_API, "PATCH", f"/issues/{issue_id}/", data)
    if result:
        print(f"  ✓ #{result['sequence_id']} {result['name']}")

# --- 2. Create new issues for what exists in production ---

print("\n--- Creating new issues ---")

eos_new_issues = [
    {
        "name": "EOS Discovery checklist — UI",
        "description_html": "<p>Interaktivní checklist pro schůzku s EOS (/eos). 8 sekcí: základní info, evidence členů, RFID, platby, API, workflow, GDPR, budoucnost. 32 otázek s checkboxy a poznámkami. Tisk. Hotovo v produkci.</p>",
        "state": EOS_DONE,
        "labels": [EOS_TASK],
        "start_date": "2026-02-15",
        "target_date": "2026-02-25",
        "priority": "high",
        "module": EOS_MOD_ANALYZA,
    },
    {
        "name": "Schůzka s EOS — zodpovědět 32 otázek",
        "description_html": "<p>Naplánovat a provést schůzku s EOS týmem. Projít všech 32 otázek checklistu: verze, hosting, API dostupnost, RFID čipy, platební metody, GDPR. Výstup: vyplněný checklist + rozhodnutí náhrada vs. integrace.</p>",
        "state": EOS_TODO,
        "labels": [EOS_MILESTONE],
        "start_date": "2026-03-15",
        "target_date": "2026-03-31",
        "priority": "urgent",
        "module": EOS_MOD_ANALYZA,
    },
    {
        "name": "Rozhodnutí: EOS nahradit vs. integrovat",
        "description_html": "<p>Na základě odpovědí z checklistu rozhodnout zda: (A) integrovat přes API/webhooky, (B) nahradit vlastním řešením, (C) hybrid. Závisí na: dostupnost EOS API, licence, RFID kompatibilita.</p>",
        "state": EOS_TODO,
        "labels": [EOS_GOAL],
        "start_date": "2026-04-01",
        "target_date": "2026-04-15",
        "priority": "urgent",
        "module": EOS_MOD_ANALYZA,
    },
    {
        "name": "E-shop: kategorie memberships a tickets existují",
        "description_html": "<p>V e-shopu už existují kategorie 'memberships' (permanentky) a 'tickets' (vstupenky). Platební flow přes Comgate je hotové. Základ pro prodej členství online je připravený.</p>",
        "state": EOS_DONE,
        "labels": [EOS_TASK],
        "start_date": "2026-02-01",
        "target_date": "2026-02-20",
        "priority": "medium",
        "module": EOS_MOD_ANALYZA,
    },
    {
        "name": "DB schéma: eos_members, eos_visits, court_reservations",
        "description_html": "<p>Navrhnout a implementovat DB tabulky: eos_members (evidence členů), eos_visits (historie vstupů), court_reservations (rezervace kurtů), credit_accounts (předplacený kredit). Závisí na rozhodnutí náhrada vs. integrace.</p>",
        "state": EOS_TODO,
        "labels": [EOS_TASK],
        "start_date": "2026-05-01",
        "target_date": "2026-05-15",
        "priority": "high",
        "module": EOS_MOD_VYVOJ,
    },
    {
        "name": "RFID/QR identifikace členů na recepci",
        "description_html": "<p>POS na recepci už má QR skener (jsQR). Rozšířit o RFID čtení nebo QR členské karty. Napojení na eos_members pro automatickou identifikaci při vstupu.</p>",
        "state": EOS_TODO,
        "labels": [EOS_TASK],
        "start_date": "2026-06-01",
        "target_date": "2026-06-30",
        "priority": "medium",
        "module": EOS_MOD_VYVOJ,
    },
]

eos_created = {}
for issue_data in eos_new_issues:
    module = issue_data.pop("module")
    time.sleep(DELAY)
    result = api(EOS_API, "POST", "/issues/", issue_data)
    if result:
        print(f"  ✓ Created #{result['sequence_id']} {result['name']}")
        eos_created[result["id"]] = module

# --- 3. Assign to modules ---

print("\n--- Assigning to modules ---")

eos_module_map = {
    "0750647e-53b3-4fb4-a45b-b4e8318f5e52": EOS_MOD_ANALYZA,  # #1 Analýza procesů
    "fcd0ba51-d73e-4555-83b2-a7b06dcbad86": EOS_MOD_ANALYZA,  # #2 Výběr platformy
    "529db02b-ba75-49e8-8e1a-43f5f27e06ee": EOS_MOD_VYVOJ,    # #3 Migrace dat
    "4464c83c-1e18-4178-ab2a-e6f959b55e97": EOS_MOD_VYVOJ,    # #4 Platební modul
    "f82ad599-2d3c-4b2e-8e98-2e9e6e99d91c": EOS_MOD_VYVOJ,    # #5 Rezervační systém
    "e577cccf-73af-46aa-a9dc-c27f1b8c01d5": EOS_MOD_VYVOJ,    # #6 Integrace s bistrem
    "7a02b844-fdab-4e06-b2b2-b1331bda3c7b": EOS_MOD_VYVOJ,    # #7 Beta spuštění
    "ed66142e-0f45-454b-bbc7-f6acf3b73abf": EOS_MOD_PROVOZ,   # #8 Plné spuštění
    "61baa5a0-3fa6-4fcc-9ad4-98b5d2e2e2ad": EOS_MOD_PROVOZ,   # #9 PWA
    "1af24868-fd94-4db1-a5e1-e8e9d67e1fc1": EOS_MOD_PROVOZ,   # #10 Vyhodnocení
}

all_eos = {**eos_module_map, **eos_created}
for issue_id, module_id in all_eos.items():
    time.sleep(DELAY)
    api(EOS_API, "POST", f"/modules/{module_id}/module-issues/", {"issues": [issue_id]})
    print(f"  ✓ Assigned to module")

# --- 4. Update module status ---

print("\n--- Updating modules ---")
time.sleep(DELAY)
api(EOS_API, "PATCH", f"/modules/{EOS_MOD_ANALYZA}/", {
    "start_date": "2026-02-15",
    "target_date": "2026-04-30",
})
print("  ✓ Analýza → dates updated (feb-apr)")


# ═══════════════════════════════════════════════════════════════
# SALONKY
# ═══════════════════════════════════════════════════════════════

SAL_API = "http://46.225.31.161/api/v1/workspaces/krasovska/projects/1addbff0-cc91-4308-9063-262e6ee3fad3"

SAL_STATES = {}
for s in api(SAL_API, "GET", "/states/").get("results", []):
    SAL_STATES[s["group"]] = s["id"]
SAL_DONE = SAL_STATES["completed"]
SAL_TODO = SAL_STATES["unstarted"]
SAL_PROGRESS = SAL_STATES["started"]

SAL_LABELS = {}
for l in api(SAL_API, "GET", "/labels/").get("results", []):
    SAL_LABELS[l["name"]] = l["id"]
SAL_TASK = SAL_LABELS["task"]
SAL_MILESTONE = SAL_LABELS["milestone"]
SAL_GOAL = SAL_LABELS["goal"]

SAL_MODULES = {}
for m in api(SAL_API, "GET", "/modules/").get("results", []):
    SAL_MODULES[m["name"]] = m["id"]
SAL_MOD_PRIPRAVA = SAL_MODULES["Příprava"]
SAL_MOD_SPUSTENI = SAL_MODULES["Spuštění"]
SAL_MOD_PROVOZ = SAL_MODULES["Provoz"]

print("\n" + "=" * 60)
print("  SALONKY — UPDATE")
print("=" * 60)

# --- 1. Update existing issues ---
# Production: SalonkySection component with business case (pricing, revenue projection)
# This means #1 "Průzkum poptávky" and #3 "Cenová politika" are partially done

sal_existing = {
    # #1 Průzkum poptávky → In Progress (business case exists)
    "0aaeec93-37c2-4b52-8e3e-d6e2bca1d53f": {
        "state": SAL_PROGRESS, "labels": [SAL_TASK],
        "description_html": "<p>V produkci existuje SalonkySection s business case: 4 balíčky, cenová politika, revenue projekce (186K/rok). Průzkum rozpracován.</p>",
    },
    # #2 Stavební úpravy → Todo
    "0d6449eb-9d3e-4cb1-b4b3-c15b3753694a": {"state": SAL_TODO, "labels": [SAL_TASK]},
    # #3 Cenová politika → Done (4 balíčky definované v produkci)
    "63929fe6-fe1b-4c38-99f5-5a2cccdce2e1": {
        "state": SAL_DONE, "labels": [SAL_TASK],
        "description_html": "<p>Hotovo v SalonkySection: Základní (2000 Kč/4h), Standard (5000 Kč/8h), Premium (8000 Kč/den), Oslava (10000+ Kč). Včetně revenue projekce pro 2026.</p>",
    },
    # #4 Rezervační systém → Todo
    "e0ea8ebb-26c1-4fee-9afd-c61d1b0b2558": {"state": SAL_TODO, "labels": [SAL_TASK]},
    # #5 Marketing B2B → Todo
    "67d53bcc-a09e-4e67-bb87-ad7e2ec85597": {"state": SAL_TODO, "labels": [SAL_TASK]},
    # #6 Soft opening → Todo + milestone
    "17a6898d-99ce-4e4b-b7e0-6f5b68ab9d4e": {"state": SAL_TODO, "labels": [SAL_MILESTONE]},
    # #7 Plné spuštění → Todo + milestone
    "18bf4cb5-8fe2-401c-8309-fbb259e5fd1f": {"state": SAL_TODO, "labels": [SAL_MILESTONE]},
    # #8 Cross-promo s bistrem → Todo
    "c282341b-f6b5-4b41-8dcc-96e2cf49f3fa": {"state": SAL_TODO, "labels": [SAL_TASK]},
    # #9 Vánoční akce → Todo
    "c57a5295-d45a-4a8e-b2f8-ba5fc3e7e5bc": {"state": SAL_TODO, "labels": [SAL_TASK]},
    # #10 Vyhodnocení → Todo + goal
    "67dc5838-d1f6-491d-b4f7-4cac64e6e7f5": {"state": SAL_TODO, "labels": [SAL_GOAL]},
}

print("\n--- Updating existing issues ---")
for issue_id, data in sal_existing.items():
    time.sleep(DELAY)
    result = api(SAL_API, "PATCH", f"/issues/{issue_id}/", data)
    if result:
        print(f"  ✓ #{result['sequence_id']} {result['name']}")

# --- 2. Create new issues ---

print("\n--- Creating new issues ---")

sal_new_issues = [
    {
        "name": "Business case a finanční model — UI",
        "description_html": "<p>SalonkySection komponenta v Bistro strategii. 4 cenové balíčky, měsíční revenue projekce (186K/rok), parametry 200m²/80 osob. Hardcoded data v produkci. Hotovo.</p>",
        "state": SAL_DONE,
        "labels": [SAL_TASK],
        "start_date": "2026-02-10",
        "target_date": "2026-02-20",
        "priority": "high",
        "module": SAL_MOD_PRIPRAVA,
    },
    {
        "name": "DB schéma: meeting_room_bookings",
        "description_html": "<p>Navrhnout tabulku meeting_room_bookings: datum, čas od/do, balíček, zákazník, kontakt, stav, poznámky. Integrace s e-shop orders pro online platbu zálohy.</p>",
        "state": SAL_TODO,
        "labels": [SAL_TASK],
        "start_date": "2026-06-15",
        "target_date": "2026-07-01",
        "priority": "high",
        "module": SAL_MOD_PRIPRAVA,
    },
    {
        "name": "Online rezervační formulář salonků",
        "description_html": "<p>/salonky route s výběrem data, balíčku, počtu osob. Kalendář dostupnosti. Napojení na meeting_room_bookings. Potvrzovací email.</p>",
        "state": SAL_TODO,
        "labels": [SAL_TASK],
        "start_date": "2026-07-01",
        "target_date": "2026-07-31",
        "priority": "high",
        "module": SAL_MOD_SPUSTENI,
    },
    {
        "name": "Admin panel salonků (správa rezervací)",
        "description_html": "<p>Admin view pro správu bookings: kalendářový pohled, schválení/zamítnutí, status workflow. Integrace do existujícího admin rozhraní.</p>",
        "state": SAL_TODO,
        "labels": [SAL_TASK],
        "start_date": "2026-07-15",
        "target_date": "2026-08-15",
        "priority": "medium",
        "module": SAL_MOD_SPUSTENI,
    },
    {
        "name": "Salonky na webu halakrasovska.cz",
        "description_html": "<p>Přidat sekci Salonky na hlavní web halakrasovska.cz. Fotky prostoru, balíčky, CTA na rezervační formulář. Koordinace s wense.cz (správce webu).</p>",
        "state": SAL_TODO,
        "labels": [SAL_TASK],
        "start_date": "2026-08-01",
        "target_date": "2026-08-15",
        "priority": "medium",
        "module": SAL_MOD_SPUSTENI,
    },
]

sal_created = {}
for issue_data in sal_new_issues:
    module = issue_data.pop("module")
    time.sleep(DELAY)
    result = api(SAL_API, "POST", "/issues/", issue_data)
    if result:
        print(f"  ✓ Created #{result['sequence_id']} {result['name']}")
        sal_created[result["id"]] = module

# --- 3. Assign to modules ---

print("\n--- Assigning to modules ---")

sal_module_map = {
    "0aaeec93-37c2-4b52-8e3e-d6e2bca1d53f": SAL_MOD_PRIPRAVA,  # #1 Průzkum
    "0d6449eb-9d3e-4cb1-b4b3-c15b3753694a": SAL_MOD_PRIPRAVA,  # #2 Stavební úpravy
    "63929fe6-fe1b-4c38-99f5-5a2cccdce2e1": SAL_MOD_PRIPRAVA,  # #3 Cenová politika
    "e0ea8ebb-26c1-4fee-9afd-c61d1b0b2558": SAL_MOD_SPUSTENI,  # #4 Rezervační systém
    "67d53bcc-a09e-4e67-bb87-ad7e2ec85597": SAL_MOD_SPUSTENI,  # #5 Marketing B2B
    "17a6898d-99ce-4e4b-b7e0-6f5b68ab9d4e": SAL_MOD_SPUSTENI,  # #6 Soft opening
    "18bf4cb5-8fe2-401c-8309-fbb259e5fd1f": SAL_MOD_SPUSTENI,  # #7 Plné spuštění
    "c282341b-f6b5-4b41-8dcc-96e2cf49f3fa": SAL_MOD_PROVOZ,    # #8 Cross-promo
    "c57a5295-d45a-4a8e-b2f8-ba5fc3e7e5bc": SAL_MOD_PROVOZ,    # #9 Vánoční akce
    "67dc5838-d1f6-491d-b4f7-4cac64e6e7f5": SAL_MOD_PROVOZ,    # #10 Vyhodnocení
}

all_sal = {**sal_module_map, **sal_created}
for issue_id, module_id in all_sal.items():
    time.sleep(DELAY)
    api(SAL_API, "POST", f"/modules/{module_id}/module-issues/", {"issues": [issue_id]})
    print(f"  ✓ Assigned to module")

# --- 4. Update module dates ---
print("\n--- Updating modules ---")
time.sleep(DELAY)
api(SAL_API, "PATCH", f"/modules/{SAL_MOD_PRIPRAVA}/", {
    "start_date": "2026-02-10",
    "target_date": "2026-07-31",
})
print("  ✓ Příprava → dates updated (feb-jul)")


# ═══════════════════════════════════════════════════════════════
print("\n" + "=" * 60)
print("  HOTOVO")
print("=" * 60)
