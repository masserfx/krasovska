#!/usr/bin/env python3
"""
Plane CE: Nastavení časového plánu Bistro + vytvoření nových projektů.
- Aktualizace start_date/target_date pro 81 Bistro issues
- Vytvoření projektů E-shop, EOS Integrace, Salonky
- Vytvoření issues v nových projektech
- Nastavení závislostí (relations)
"""

import json
import time
import urllib.request
import urllib.error
from typing import Optional

BASE_URL = "http://46.225.31.161/api/v1"
WORKSPACE = "krasovska"
API_KEY = "plane_api_c3b023ea27254bfc8979a6d787dd7e0e"
BISTRO_PROJECT_ID = "c7f73e13-5bf2-405e-a952-3cccf2177f19"

# States and labels from Bistro (reuse for new projects)
LABELS = {
    "task": "7e8fcc90-0213-4813-aebe-6068c77a640d",
    "milestone": "121fae90-b788-48c4-8a25-de2a3fedff3d",
    "goal": "2589c177-4017-4f5a-bd75-4f05e5d3585d",
}

# Module IDs
MODULES = {
    "Quick Start": "09e65a5c-9608-45e6-bb70-e9ec1a6f8c19",
    "MVP → Standard": "219320e7-b910-45f5-9ffb-c2d5c4da8b1b",
    "Standard → Full": "d384407f-95d7-4f39-9dc1-1faa1a4b9667",
    "Full Operace": "c4900aa3-3e0b-4c6b-912f-80865ab9c00c",
}


def api_request(method: str, path: str, data: Optional[dict] = None, retries: int = 3) -> dict:
    """Make API request to Plane with retry on rate limit."""
    url = f"{BASE_URL}/{path}"
    headers = {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
    }
    body = json.dumps(data).encode() if data else None

    for attempt in range(retries):
        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            error_body = e.read().decode() if e.fp else ""
            if e.code == 429 and attempt < retries - 1:
                wait = 30 * (attempt + 1)
                print(f"  RATE LIMIT — waiting {wait}s (attempt {attempt + 1}/{retries})")
                time.sleep(wait)
                continue
            print(f"  ERROR {e.code}: {method} {path}")
            print(f"  Body: {error_body[:300]}")
            return {"error": e.code, "detail": error_body}
    return {"error": "max_retries"}


def get_all_issues(project_id: str) -> list:
    """Fetch all issues from a project."""
    path = f"workspaces/{WORKSPACE}/projects/{project_id}/issues/"
    data = api_request("GET", path)
    return data.get("results", [])


# ============================================================
# KROK 1: Aktualizace 81 Bistro issues — start_date + target_date
# ============================================================

# Mapping: sequence_id -> (start_date, target_date)
# Rok 2026, formát YYYY-MM-DD
BISTRO_DATES = {
    # === Fáze 0: Quick Start ===
    # BIS-8: Rozhodnuti: spustit Quick Start (#3 v plánu)
    8: ("2026-02-25", "2026-02-26"),
    # BIS-10: Schvalit rozpocet 220 tis. Kc (#4)
    10: ("2026-02-26", "2026-02-27"),
    # BIS-6: Rozpocet 220K uvolnen (#2 goal)
    6: ("2026-02-27", "2026-02-27"),
    # BIS-2: Varianta B schvalena (#0 milestone)
    2: ("2026-02-27", "2026-02-27"),
    # BIS-12: Overit ZL - hostinska cinnost (#5)
    12: ("2026-02-27", "2026-03-04"),
    # BIS-14: Objednat HACCP dokumentaci (#6)
    14: ("2026-02-27", "2026-03-02"),
    # BIS-16: Kontaktovat KHS Plzen (#7)
    16: ("2026-02-27", "2026-03-03"),
    # BIS-22: Zverejnit inzerat na kuchare (#10)
    22: ("2026-02-27", "2026-03-02"),
    # BIS-24: Objednat POS Dotykacka (#11)
    24: ("2026-03-03", "2026-03-06"),
    # BIS-30: Objednat konvektomat/troubu (#14)
    30: ("2026-03-03", "2026-03-06"),
    # BIS-32: Objednat chladici vitrinu (#15)
    32: ("2026-03-03", "2026-03-06"),
    # BIS-26: Kontaktovat Plzensky Prazdroj (#12)
    26: ("2026-03-03", "2026-03-13"),
    # BIS-28: Uzavrit smlouvy Makro, Bidfood (#13)
    28: ("2026-03-03", "2026-03-10"),
    # BIS-18: Zajistit revizi elektro a plynu (#8)
    18: ("2026-03-05", "2026-03-12"),
    # BIS-20: Zdravotni prukazy — terminy (#9)
    20: ("2026-03-05", "2026-03-12"),
    # BIS-4: Vybaveni objednano (#1 milestone)
    4: ("2026-03-06", "2026-03-06"),
    # BIS-34: Nakup drobneho vybaveni (#16)
    34: ("2026-03-10", "2026-03-17"),
    # BIS-36: Grafika menu, cedule (#17)
    36: ("2026-03-10", "2026-03-20"),
    # BIS-38: Nabor 1-2 brigadniku (#18)
    38: ("2026-03-10", "2026-03-24"),
    # BIS-40: Nakup v Makro — zasoby (#19)
    40: ("2026-03-24", "2026-03-27"),

    # === Fáze 1: MVP → Standard ===
    # BIS-46: Instalace konvektomatu (#2)
    46: ("2026-04-01", "2026-04-03"),
    # BIS-48: Instalace chladici vitriny (#3)
    48: ("2026-04-01", "2026-04-03"),
    # BIS-50: Instalace cepovani (#4)
    50: ("2026-04-03", "2026-04-08"),
    # BIS-52: Nastup kuchare HPP (#5)
    52: ("2026-04-07", "2026-04-07"),
    # BIS-54: POS konfigurace (#6)
    54: ("2026-04-07", "2026-04-10"),
    # BIS-56: Nastaveni skladu v POS (#7)
    56: ("2026-04-10", "2026-04-15"),
    # BIS-78: Nakup nadobi, priboru (#18)
    78: ("2026-04-07", "2026-04-11"),
    # BIS-58: HACCP kompletace (#8)
    58: ("2026-04-07", "2026-04-17"),
    # BIS-44: Vsichni maji zdrav. prukazy (#1 goal)
    44: ("2026-04-07", "2026-04-14"),
    # BIS-60: Skoleni personalu (#9)
    60: ("2026-04-14", "2026-04-17"),
    # BIS-62: Testovaci vareni (#10)
    62: ("2026-04-15", "2026-04-22"),
    # BIS-64: KHS kontrola (#11)
    64: ("2026-04-20", "2026-05-01"),
    # BIS-66: Nabor brigadniku vyber (#12)
    66: ("2026-04-07", "2026-04-17"),
    # BIS-68: Skoleni brigadniku (#13)
    68: ("2026-04-17", "2026-04-22"),
    # BIS-72: Pojisteni provozovny (#15)
    72: ("2026-04-07", "2026-04-14"),
    # BIS-80: Evidence trzeb EET/DPH (#19)
    80: ("2026-04-10", "2026-04-15"),
    # BIS-70: Online menu na webu (#14)
    70: ("2026-04-14", "2026-04-22"),
    # BIS-74: OSA / Intergram licence (#16)
    74: ("2026-04-07", "2026-04-17"),
    # BIS-76: Pripravit cenik (#17)
    76: ("2026-04-17", "2026-04-24"),
    # BIS-82: Smlouva svoz odpadu (#20)
    82: ("2026-04-07", "2026-04-14"),
    # BIS-42: Vybaveni + HACCP hotovo (#0 milestone)
    42: ("2026-04-22", "2026-04-22"),

    # === Fáze 2: Standard → Full ===
    # BIS-84: Soft opening pro cleny (#0 milestone)
    84: ("2026-05-04", "2026-05-04"),
    # BIS-94: Soft opening testovaci provoz (#5)
    94: ("2026-05-04", "2026-05-08"),
    # BIS-96: Sber feedbacku (#6)
    96: ("2026-05-04", "2026-05-15"),
    # BIS-116: Google My Business (#16)
    116: ("2026-05-04", "2026-05-08"),
    # BIS-98: Uprava menu dle feedbacku (#7)
    98: ("2026-05-11", "2026-05-18"),
    # BIS-100: Zkusebni provoz 2 tydny (#8)
    100: ("2026-05-11", "2026-05-22"),
    # BIS-104: Turnajovy catering test (#10)
    104: ("2026-05-16", "2026-05-17"),
    # BIS-102: Rozsireni na plny provoz (#9)
    102: ("2026-05-18", "2026-05-22"),
    # BIS-108: Marketing FB, IG, media (#12)
    108: ("2026-05-18", "2026-05-29"),
    # BIS-118: Social media plny provoz (#17)
    118: ("2026-05-18", "2026-05-22"),
    # BIS-106: Grand opening so 30.5. (#11)
    106: ("2026-05-30", "2026-05-30"),
    # BIS-86: Grand opening (#1 milestone)
    86: ("2026-05-30", "2026-05-30"),
    # BIS-122: Ochutnavky zdarma promo (#19)
    122: ("2026-05-30", "2026-05-30"),
    # BIS-110: Vernostni program (#13)
    110: ("2026-06-01", "2026-06-10"),
    # BIS-112: Wolt registrace (#14)
    112: ("2026-06-01", "2026-06-19"),
    # BIS-114: Bolt Food registrace (#15)
    114: ("2026-06-01", "2026-06-19"),
    # BIS-120: Prvni mesicni reporting (#18)
    120: ("2026-06-01", "2026-06-05"),
    # BIS-90: Food cost < 35% (#3 goal)
    90: ("2026-06-15", "2026-06-30"),
    # BIS-92: Google 4.0 hvezd (#4 goal)
    92: ("2026-06-15", "2026-06-30"),
    # BIS-88: Trzby 100K/mesic (#2 goal)
    88: ("2026-06-30", "2026-06-30"),

    # === Fáze 3: Full Operace ===
    # BIS-134: Stabilizace provozu (#5)
    134: ("2026-07-01", "2026-07-17"),
    # BIS-128: Trzby 5000 Kc/den (#2 goal)
    128: ("2026-07-01", "2026-07-31"),
    # BIS-136: Letni menu (#6)
    136: ("2026-06-22", "2026-07-03"),
    # BIS-138: Catering pro letni kempy (#7)
    138: ("2026-07-06", "2026-08-28"),
    # BIS-140: Food cost analyza mesicni (#8)
    140: ("2026-07-01", "2026-07-31"),
    # BIS-132: 40 zakazniku/den (#4 goal)
    132: ("2026-07-01", "2026-09-30"),
    # BIS-130: Food cost <= 32% (#3 goal)
    130: ("2026-07-31", "2026-09-30"),
    # BIS-142: Financni vyhodnoceni 3 mesice (#9)
    142: ("2026-08-31", "2026-09-11"),
    # BIS-124: 3 mesice vyhodnoceny (#0 milestone)
    124: ("2026-09-11", "2026-09-11"),
    # BIS-148: Back to Sport podzim (#12)
    148: ("2026-09-01", "2026-09-14"),
    # BIS-144: Rozhodnuti pokracovat/rozsirit (#10)
    144: ("2026-09-11", "2026-09-18"),
    # BIS-158: Optimalizace dodavatelu (#17)
    158: ("2026-09-15", "2026-09-30"),
    # BIS-160: Wolt/Bolt vyhodnoceni marzi (#18)
    160: ("2026-09-15", "2026-09-26"),
    # BIS-146: Posouzeni Varianty C (#11)
    146: ("2026-09-18", "2026-09-30"),
    # BIS-126: Break-even dosazen (#1 milestone)
    126: ("2026-09-30", "2026-09-30"),
    # BIS-150: Halloween menu/party (#13)
    150: ("2026-10-12", "2026-10-31"),
    # BIS-162: Salonky cross-promo (#19)
    162: ("2026-10-01", "2026-10-31"),
    # BIS-152: Vanocni turnaje catering (#14)
    152: ("2026-11-16", "2026-12-05"),
    # BIS-154: Vanocni menu a svarak (#15)
    154: ("2026-11-23", "2026-12-18"),
    # BIS-156: Rocni vyhodnoceni bistra (#16)
    156: ("2026-12-14", "2026-12-23"),
}


def update_bistro_dates():
    """Update start_date and target_date for all 81 Bistro issues."""
    print("=" * 60)
    print("KROK 1: Aktualizace dat pro 81 Bistro issues")
    print("=" * 60)

    issues = get_all_issues(BISTRO_PROJECT_ID)
    seq_to_id = {i["sequence_id"]: i["id"] for i in issues}

    updated = 0
    errors = 0
    for seq_id, (start, target) in sorted(BISTRO_DATES.items()):
        issue_id = seq_to_id.get(seq_id)
        if not issue_id:
            print(f"  SKIP BIS-{seq_id}: issue not found!")
            errors += 1
            continue

        path = f"workspaces/{WORKSPACE}/projects/{BISTRO_PROJECT_ID}/issues/{issue_id}/"
        result = api_request("PATCH", path, {
            "start_date": start,
            "target_date": target,
        })
        if "error" not in result:
            print(f"  OK BIS-{seq_id:3d}: {start} → {target}")
            updated += 1
        else:
            errors += 1
        time.sleep(1.5)  # Rate limit

    print(f"\nBistro: {updated} updated, {errors} errors (of {len(BISTRO_DATES)} planned)")
    return updated


# ============================================================
# KROK 2: Vytvoření 3 nových projektů
# ============================================================

NEW_PROJECTS = [
    {
        "name": "E-shop",
        "identifier": "ESH",
        "description": "E-shop s badmintonovým vybavením — rakety, košíčky, obuv, oblečení",
        "network": 2,
    },
    {
        "name": "EOS Integrace",
        "identifier": "EOS",
        "description": "Systém správy členů — evidence, platby, rezervace kurtů",
        "network": 2,
    },
    {
        "name": "Salonky",
        "identifier": "SAL",
        "description": "Pronájem salonků 200 m² — firemní akce, školení, oslavy",
        "network": 2,
    },
]


def create_projects() -> dict:
    """Create 3 new projects, return {name: project_id}."""
    print("\n" + "=" * 60)
    print("KROK 2: Vytvoření 3 nových projektů")
    print("=" * 60)

    project_ids = {}
    for proj in NEW_PROJECTS:
        path = f"workspaces/{WORKSPACE}/projects/"
        result = api_request("POST", path, proj)
        if "error" not in result:
            pid = result["id"]
            project_ids[proj["name"]] = pid
            print(f"  OK Projekt '{proj['name']}' ({proj['identifier']}): {pid}")
        else:
            print(f"  ERROR creating '{proj['name']}': {result}")
        time.sleep(2)

    return project_ids


# ============================================================
# KROK 3: Vytvoření labels + states pro nové projekty
# ============================================================

def setup_project_labels(project_id: str) -> dict:
    """Create task/milestone/goal labels, return {name: id}."""
    label_ids = {}
    for name, color in [("task", "#6366f1"), ("milestone", "#f59e0b"), ("goal", "#10b981")]:
        path = f"workspaces/{WORKSPACE}/projects/{project_id}/labels/"
        result = api_request("POST", path, {"name": name, "color": color})
        if "error" not in result:
            label_ids[name] = result["id"]
        else:
            # May already exist
            label_ids[name] = None
        time.sleep(1.5)
    return label_ids


def get_default_state(project_id: str) -> str:
    """Get the 'unstarted' state ID for a project."""
    path = f"workspaces/{WORKSPACE}/projects/{project_id}/states/"
    data = api_request("GET", path)
    states = data.get("results", data) if isinstance(data, dict) else data
    for s in states:
        if s.get("group") == "unstarted":
            return s["id"]
    # fallback to first state
    return states[0]["id"] if states else None


# ============================================================
# KROK 4: Issues pro nové projekty
# ============================================================

# E-shop issues
ESHOP_ISSUES = [
    {"name": "Analýza trhu a konkurence", "start": "2026-04-01", "end": "2026-04-15",
     "desc": "Průzkum cen, dodavatelů Yonex/Victor", "label": "task", "seq": 1},
    {"name": "Výběr platformy", "start": "2026-04-15", "end": "2026-05-15",
     "desc": "Shoptet/Shopify, platební brána", "label": "task", "seq": 2},
    {"name": "Katalog — první kolekce (50+ produktů)", "start": "2026-05-15", "end": "2026-06-15",
     "desc": "Rakety, košíčky, obuv, oblečení", "label": "task", "seq": 3},
    {"name": "Smlouvy s distributory", "start": "2026-04-15", "end": "2026-05-30",
     "desc": "Yonex CZ, Victor CZ", "label": "task", "seq": 4},
    {"name": "Fotografie a SEO popisky", "start": "2026-06-01", "end": "2026-06-30",
     "desc": "Profesionální fotky, české texty", "label": "task", "seq": 5},
    {"name": "Beta testování", "start": "2026-07-01", "end": "2026-07-15",
     "desc": "Interní objednávky od členů", "label": "task", "seq": 6},
    {"name": "Spuštění e-shopu", "start": "2026-07-15", "end": "2026-07-15",
     "desc": "Oficiální launch", "label": "milestone", "seq": 7},
    {"name": "Marketing a Google Ads", "start": "2026-07-15", "end": "2026-09-30",
     "desc": "Před podzimní sezonou", "label": "task", "seq": 8},
    {"name": "Integrace s EOS (slevy členům)", "start": "2026-08-01", "end": "2026-09-30",
     "desc": "Propojení s členským systémem", "label": "task", "seq": 9},
    {"name": "Vyhodnocení po 3 měsících", "start": "2026-10-15", "end": "2026-10-31",
     "desc": "Tržby, marže, bestsellery", "label": "goal", "seq": 10},
]

# EOS Integrace issues
EOS_ISSUES = [
    {"name": "Analýza procesů členství", "start": "2026-03-15", "end": "2026-03-31",
     "desc": "Zmapovat evidenci, platby, rezervace", "label": "task", "seq": 1},
    {"name": "Výběr/nastavení platformy", "start": "2026-04-01", "end": "2026-04-30",
     "desc": "Sportify / vlastní / Supabase", "label": "task", "seq": 2},
    {"name": "Migrace dat členů", "start": "2026-05-01", "end": "2026-05-31",
     "desc": "Import, čištění dat", "label": "task", "seq": 3},
    {"name": "Platební modul — příspěvky", "start": "2026-05-15", "end": "2026-06-30",
     "desc": "Automatické platby, faktury", "label": "task", "seq": 4},
    {"name": "Rezervační systém kurtů", "start": "2026-06-01", "end": "2026-07-31",
     "desc": "Online rezervace", "label": "task", "seq": 5},
    {"name": "Integrace s bistrem", "start": "2026-07-01", "end": "2026-08-31",
     "desc": "Věrnostní program, slevy", "label": "task", "seq": 6},
    {"name": "Beta spuštění", "start": "2026-07-01", "end": "2026-07-15",
     "desc": "Základní funkce", "label": "milestone", "seq": 7},
    {"name": "Plné spuštění + školení", "start": "2026-09-01", "end": "2026-09-15",
     "desc": "Start sezóny", "label": "milestone", "seq": 8},
    {"name": "Mobilní PWA", "start": "2026-08-01", "end": "2026-10-31",
     "desc": "Přístup pro členy", "label": "task", "seq": 9},
    {"name": "Vyhodnocení a optimalizace", "start": "2026-11-01", "end": "2026-11-30",
     "desc": "Adopce, feedback", "label": "goal", "seq": 10},
]

# Salonky issues
SALONKY_ISSUES = [
    {"name": "Průzkum poptávky", "start": "2026-05-01", "end": "2026-05-15",
     "desc": "Firmy v Plzni, ceny", "label": "task", "seq": 1},
    {"name": "Stavební úpravy, vybavení", "start": "2026-06-01", "end": "2026-07-31",
     "desc": "Projektor, ozvučení, nábytek", "label": "task", "seq": 2},
    {"name": "Cenová politika a balíčky", "start": "2026-06-15", "end": "2026-07-15",
     "desc": "2K–10K+ Kč za akci", "label": "task", "seq": 3},
    {"name": "Rezervační systém", "start": "2026-07-01", "end": "2026-08-15",
     "desc": "Online rezervace", "label": "task", "seq": 4},
    {"name": "Marketing — B2B Plzeň", "start": "2026-08-01", "end": "2026-09-30",
     "desc": "Cílený na firmy", "label": "task", "seq": 5},
    {"name": "Soft opening salonků", "start": "2026-08-15", "end": "2026-08-15",
     "desc": "První testovací akce", "label": "milestone", "seq": 6},
    {"name": "Plné spuštění", "start": "2026-09-01", "end": "2026-09-01",
     "desc": "Oficiální nabídka", "label": "milestone", "seq": 7},
    {"name": "Cross-promo s bistrem", "start": "2026-09-01", "end": "2026-10-31",
     "desc": "Balíčky salonek + catering", "label": "task", "seq": 8},
    {"name": "Vánoční firemní akce", "start": "2026-11-01", "end": "2026-12-23",
     "desc": "První sezona večírků", "label": "task", "seq": 9},
    {"name": "Vyhodnocení první sezony", "start": "2026-12-15", "end": "2026-12-31",
     "desc": "Využití, tržby (cíl 176K/rok)", "label": "goal", "seq": 10},
]


def create_issues_for_project(project_id: str, issues: list, labels: dict, state_id: str) -> dict:
    """Create issues in a project, return {seq: issue_id}."""
    created = {}
    for issue in sorted(issues, key=lambda x: x["seq"]):
        label_id = labels.get(issue["label"])
        label_ids = [label_id] if label_id else []

        payload = {
            "name": issue["name"],
            "description_html": f"<p>{issue['desc']}</p>",
            "start_date": issue["start"],
            "target_date": issue["end"],
            "state_id": state_id,
            "label_ids": label_ids,
            "priority": "medium" if issue["label"] == "milestone" else "none",
        }

        path = f"workspaces/{WORKSPACE}/projects/{project_id}/issues/"
        result = api_request("POST", path, payload)
        if "error" not in result:
            created[issue["seq"]] = result["id"]
            print(f"    OK #{issue['seq']:2d}: {issue['name']}")
        else:
            print(f"    ERROR #{issue['seq']}: {issue['name']}")
        time.sleep(1.5)

    return created


# ============================================================
# KROK 5: Moduly pro nové projekty
# ============================================================

ESHOP_MODULES = [
    {"name": "Příprava", "start": "2026-04-01", "end": "2026-05-30", "issues": [1, 2, 4]},
    {"name": "Vývoj", "start": "2026-05-15", "end": "2026-07-15", "issues": [3, 5, 6, 7]},
    {"name": "Provoz", "start": "2026-07-15", "end": "2026-10-31", "issues": [8, 9, 10]},
]

EOS_MODULES = [
    {"name": "Analýza a design", "start": "2026-03-15", "end": "2026-04-30", "issues": [1, 2]},
    {"name": "Vývoj", "start": "2026-05-01", "end": "2026-07-31", "issues": [3, 4, 5, 6, 7]},
    {"name": "Provoz", "start": "2026-08-01", "end": "2026-11-30", "issues": [8, 9, 10]},
]

SALONKY_MODULES = [
    {"name": "Příprava", "start": "2026-05-01", "end": "2026-07-31", "issues": [1, 2, 3, 4]},
    {"name": "Spuštění", "start": "2026-08-01", "end": "2026-09-30", "issues": [5, 6, 7, 8]},
    {"name": "Provoz", "start": "2026-10-01", "end": "2026-12-31", "issues": [9, 10]},
]


def create_modules(project_id: str, modules: list, issue_map: dict):
    """Create modules and assign issues."""
    for mod in modules:
        path = f"workspaces/{WORKSPACE}/projects/{project_id}/modules/"
        result = api_request("POST", path, {
            "name": mod["name"],
            "start_date": mod["start"],
            "target_date": mod["end"],
        })
        if "error" not in result:
            module_id = result["id"]
            print(f"  OK Modul '{mod['name']}': {module_id[:12]}...")

            # Add issues to module
            issue_ids = [issue_map[seq] for seq in mod["issues"] if seq in issue_map]
            if issue_ids:
                add_path = f"workspaces/{WORKSPACE}/projects/{project_id}/modules/{module_id}/issues/"
                add_result = api_request("POST", add_path, {"issues": issue_ids})
                if "error" not in add_result:
                    print(f"    Added {len(issue_ids)} issues to module")
                else:
                    print(f"    ERROR adding issues to module")
        else:
            print(f"  ERROR Modul '{mod['name']}': {result}")
        time.sleep(1.5)


# ============================================================
# KROK 6: Závislosti (relations) pro Bistro
# ============================================================

# Key dependencies on the critical path
# Format: (blocker_seq_id, blocked_seq_id) — "blocker blocks blocked"
BISTRO_RELATIONS = [
    # Quick Start chain
    (8, 10),    # Rozhodnuti -> Schvalit rozpocet
    (10, 6),    # Schvalit rozpocet -> Rozpocet uvolnen
    (6, 2),     # Rozpocet uvolnen -> Varianta B schvalena
    (2, 12),    # Varianta B -> Overit ZL
    (2, 14),    # Varianta B -> Objednat HACCP
    (2, 16),    # Varianta B -> Kontaktovat KHS
    (2, 22),    # Varianta B -> Inzerat kuchar
    (2, 24),    # Varianta B -> POS Dotykacka
    (2, 30),    # Varianta B -> Konvektomat
    (2, 32),    # Varianta B -> Chladici vitrina
    (2, 26),    # Varianta B -> Plzensky Prazdroj
    (2, 28),    # Varianta B -> Smlouvy Makro
    (2, 18),    # Varianta B -> Revize elektro
    (2, 20),    # Varianta B -> Zdravotni prukazy
    (24, 4),    # POS -> Vybaveni objednano
    (30, 4),    # Konvektomat -> Vybaveni objednano
    (32, 4),    # Vitrina -> Vybaveni objednano
    (28, 34),   # Smlouvy -> Nakup drobneho vybaveni
    (22, 38),   # Inzerat kuchar -> Nabor brigadniku
    (28, 40),   # Smlouvy -> Nakup Makro zasoby
    (34, 40),   # Drobne vybaveni -> Nakup Makro zasoby

    # MVP -> Standard chain
    (30, 46),   # Konvektomat objednan -> Instalace konvektomatu
    (18, 46),   # Revize elektro -> Instalace konvektomatu
    (32, 48),   # Vitrina objednana -> Instalace vitriny
    (18, 48),   # Revize elektro -> Instalace vitriny
    (26, 50),   # Prazdroj -> Instalace cepovani
    (22, 52),   # Inzerat -> Nastup kuchare
    (24, 54),   # POS objednan -> POS konfigurace
    (52, 54),   # Kuchar -> POS konfigurace
    (54, 56),   # POS konfigurace -> Nastaveni skladu
    (14, 58),   # HACCP objednan -> HACCP kompletace
    (46, 58),   # Instalace konvekt -> HACCP kompletace
    (48, 58),   # Instalace vitriny -> HACCP kompletace
    (20, 44),   # Zdrav. prukazy -> Vsichni maji prukazy
    (52, 44),   # Kuchar -> Vsichni maji prukazy
    (52, 60),   # Kuchar -> Skoleni
    (54, 60),   # POS konfig -> Skoleni
    (58, 60),   # HACCP -> Skoleni
    (52, 62),   # Kuchar -> Testovaci vareni
    (46, 62),   # Konvektomat -> Testovaci vareni
    (40, 62),   # Zasoby -> Testovaci vareni
    (58, 64),   # HACCP -> KHS kontrola
    (46, 64),   # Konvektomat -> KHS kontrola
    (48, 64),   # Vitrina -> KHS kontrola
    (38, 66),   # Nabor brigad. -> Vyber brigadniku
    (60, 68),   # Skoleni -> Skoleni brigadniku
    (66, 68),   # Vyber -> Skoleni brigadniku
    (54, 80),   # POS konfig -> Evidence trzeb
    (54, 70),   # POS konfig -> Online menu
    (62, 70),   # Testovaci vareni -> Online menu
    (36, 76),   # Grafika -> Cenik
    (54, 76),   # POS konfig -> Cenik
    (46, 42),   # Konvekt install -> Vybaveni+HACCP hotovo
    (48, 42),   # Vitrina install -> Vybaveni+HACCP hotovo
    (58, 42),   # HACCP -> Vybaveni+HACCP hotovo
    (60, 42),   # Skoleni -> Vybaveni+HACCP hotovo

    # Standard -> Full chain
    (64, 84),   # KHS kontrola -> Soft opening
    (64, 94),   # KHS kontrola -> Soft opening testovaci
    (94, 96),   # Soft opening -> Sber feedbacku
    (70, 116),  # Online menu -> Google My Business
    (96, 98),   # Feedback -> Uprava menu
    (94, 100),  # Soft opening -> Zkusebni provoz
    (100, 104), # Zkusebni provoz -> Turnajovy catering
    (100, 102), # Zkusebni provoz -> Rozsireni plny provoz
    (100, 108), # Zkusebni provoz -> Marketing
    (102, 118), # Plny provoz -> Social media
    (102, 106), # Plny provoz -> Grand opening 30.5.
    (108, 106), # Marketing -> Grand opening
    (106, 86),  # Grand opening event -> Grand opening milestone
    (106, 122), # Grand opening -> Ochutnavky
    (86, 110),  # Grand opening MS -> Vernostni program
    (86, 112),  # Grand opening MS -> Wolt
    (86, 114),  # Grand opening MS -> Bolt Food
    (86, 120),  # Grand opening MS -> Mesicni reporting
    (100, 90),  # Zkusebni provoz -> Food cost < 35%
    (116, 92),  # Google My Business -> Google 4.0*
    (102, 88),  # Plny provoz -> Trzby 100K

    # Full Operace chain
    (88, 134),  # Trzby 100K -> Stabilizace
    (88, 128),  # Trzby 100K -> Trzby 5000/den
    (98, 136),  # Uprava menu -> Letni menu
    (134, 138), # Stabilizace -> Catering kempy
    (136, 138), # Letni menu -> Catering kempy
    (120, 140), # Mesicni reporting -> Food cost analyza
    (134, 132), # Stabilizace -> 40 zakazniku/den
    (140, 130), # Food cost analyza -> Food cost <= 32%
    (140, 142), # Food cost analyza -> Financni vyhodnoceni
    (142, 124), # Financni vyhodnoceni -> 3 mesice milestone
    (134, 148), # Stabilizace -> Back to Sport
    (124, 144), # 3 mesice MS -> Rozhodnuti pokracovat
    (142, 158), # Fin. vyhodnoceni -> Optimalizace dodavatelu
    (142, 160), # Fin. vyhodnoceni -> Wolt/Bolt marze
    (144, 146), # Rozhodnuti -> Posouzeni Varianty C
    (142, 126), # Fin. vyhodnoceni -> Break-even
    (134, 150), # Stabilizace -> Halloween
    (144, 162), # Rozhodnuti -> Salonky cross-promo
    (138, 152), # Catering kempy -> Vanocni turnaje
    (134, 154), # Stabilizace -> Vanocni menu
    (124, 156), # 3 mesice MS -> Rocni vyhodnoceni
    (142, 156), # Fin. vyhodnoceni -> Rocni vyhodnoceni
]


def setup_bistro_relations():
    """Create issue relations (dependencies) for Bistro."""
    print("\n" + "=" * 60)
    print("KROK 5: Nastavení závislostí pro Bistro")
    print("=" * 60)

    issues = get_all_issues(BISTRO_PROJECT_ID)
    seq_to_id = {i["sequence_id"]: i["id"] for i in issues}

    created = 0
    errors = 0
    for blocker_seq, blocked_seq in BISTRO_RELATIONS:
        blocker_id = seq_to_id.get(blocker_seq)
        blocked_id = seq_to_id.get(blocked_seq)

        if not blocker_id or not blocked_id:
            print(f"  SKIP BIS-{blocker_seq} -> BIS-{blocked_seq}: ID not found")
            errors += 1
            continue

        path = f"workspaces/{WORKSPACE}/projects/{BISTRO_PROJECT_ID}/issues/{blocked_id}/relations/"
        result = api_request("POST", path, {
            "relation_type": "blocked_by",
            "related_issue": blocker_id,
            "project_id": BISTRO_PROJECT_ID,
        })

        if "error" not in result:
            print(f"  OK BIS-{blocker_seq:3d} blocks BIS-{blocked_seq:3d}")
            created += 1
        else:
            errors += 1
        time.sleep(1.5)

    print(f"\nRelations: {created} created, {errors} errors (of {len(BISTRO_RELATIONS)} planned)")


# ============================================================
# MAIN
# ============================================================

def update_bistro_dates_smart():
    """Update only issues that don't have dates yet."""
    print("=" * 60)
    print("KROK 1: Aktualizace dat pro Bistro issues (smart — skip done)")
    print("=" * 60)

    issues = get_all_issues(BISTRO_PROJECT_ID)
    seq_to_issue = {i["sequence_id"]: i for i in issues}

    updated = 0
    skipped = 0
    errors = 0
    for seq_id, (start, target) in sorted(BISTRO_DATES.items()):
        issue = seq_to_issue.get(seq_id)
        if not issue:
            print(f"  SKIP BIS-{seq_id}: issue not found!")
            errors += 1
            continue

        # Skip if already has correct dates
        if issue.get("start_date") == start and issue.get("target_date") == target:
            skipped += 1
            continue

        path = f"workspaces/{WORKSPACE}/projects/{BISTRO_PROJECT_ID}/issues/{issue['id']}/"
        result = api_request("PATCH", path, {
            "start_date": start,
            "target_date": target,
        })
        if "error" not in result:
            print(f"  OK BIS-{seq_id:3d}: {start} → {target}")
            updated += 1
        else:
            errors += 1
        time.sleep(1.5)

    print(f"\nBistro: {updated} updated, {skipped} skipped (already done), {errors} errors")
    return updated


def create_projects_smart() -> dict:
    """Create projects, skip if they already exist."""
    print("\n" + "=" * 60)
    print("KROK 2: Vytvoření nových projektů (smart)")
    print("=" * 60)

    # Check existing projects
    existing = api_request("GET", f"workspaces/{WORKSPACE}/projects/")
    existing_names = {}
    for p in existing.get("results", []):
        existing_names[p["name"]] = p["id"]

    project_ids = {}
    for proj in NEW_PROJECTS:
        if proj["name"] in existing_names:
            pid = existing_names[proj["name"]]
            project_ids[proj["name"]] = pid
            print(f"  EXISTS '{proj['name']}': {pid}")
            continue

        path = f"workspaces/{WORKSPACE}/projects/"
        result = api_request("POST", path, proj)
        if "error" not in result:
            pid = result["id"]
            project_ids[proj["name"]] = pid
            print(f"  OK '{proj['name']}' ({proj['identifier']}): {pid}")
        else:
            print(f"  ERROR '{proj['name']}': {result}")
        time.sleep(2)

    return project_ids


def main():
    import sys
    steps = sys.argv[1:] if len(sys.argv) > 1 else ["all"]

    print("Plane CE — Časový plán Bistro Krasovská + nové projekty")
    print(f"Workspace: {WORKSPACE} | Base URL: {BASE_URL}")
    print(f"Steps: {steps}")
    print()

    project_ids = {}

    if "all" in steps or "dates" in steps:
        update_bistro_dates_smart()

    if "all" in steps or "projects" in steps:
        project_ids = create_projects_smart()

        # KROK 3 + 4: Pro každý nový projekt: labels, issues, moduly
        for proj_name, issues_list, modules_list in [
            ("E-shop", ESHOP_ISSUES, ESHOP_MODULES),
            ("EOS Integrace", EOS_ISSUES, EOS_MODULES),
            ("Salonky", SALONKY_ISSUES, SALONKY_MODULES),
        ]:
            pid = project_ids.get(proj_name)
            if not pid:
                print(f"\n  SKIP {proj_name}: projekt nebyl vytvořen")
                continue

            print(f"\n--- {proj_name} ({pid[:12]}...) ---")

            # Labels
            labels = setup_project_labels(pid)
            print(f"  Labels: {labels}")
            time.sleep(1.5)

            # Default state
            state_id = get_default_state(pid)
            print(f"  Default state: {state_id}")
            time.sleep(1.5)

            # Issues
            print(f"  Vytvářím {len(issues_list)} issues:")
            issue_map = create_issues_for_project(pid, issues_list, labels, state_id)

            # Modules
            print(f"  Vytvářím {len(modules_list)} modulů:")
            create_modules(pid, modules_list, issue_map)

    if "all" in steps or "relations" in steps:
        setup_bistro_relations()

    print("\n" + "=" * 60)
    print("HOTOVO!")
    print("=" * 60)
    print(f"\nOvěřte v Plane Gantt view: http://46.225.31.161/")


if __name__ == "__main__":
    main()
