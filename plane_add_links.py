#!/usr/bin/env python3
"""Add production URL links to all Done issues in Plane."""

import json
import time
import urllib.request

API = "http://46.225.31.161/api/v1/workspaces/krasovska"
HEADERS = {
    "x-api-key": "plane_api_c3b023ea27254bfc8979a6d787dd7e0e",
    "Content-Type": "application/json",
}
BASE = "https://hala-krasovska.vercel.app"
PLANE_UI = "http://46.225.31.161/krasovska/projects"

# --- Mapping: issue UUID → list of (url, title) ---

BIS_PID = "c7f73e13-5bf2-405e-a952-3cccf2177f19"
ESH_PID = "92793297-f6eb-498b-87d3-2f9f4cd7ff34"
EOS_PID = "2fec08e8-eb48-4eaa-b991-71f30f5cbc7c"
SAL_PID = "1addbff0-cc91-4308-9063-262e6ee3fad3"

LINKS = [
    # === BIS — Bistro ===
    (BIS_PID, "bad2df3e-71a0-4515-ad90-f648ccd710a6", [  # BIS-163 Kanban
        (f"{BASE}/bistro?tab=kontroling", "Kanban board — produkce"),
    ]),
    (BIS_PID, "cd85eae8-3bea-407d-a015-1d8689790c6d", [  # BIS-164 Controlling
        (f"{BASE}/bistro?tab=kontroling", "Controlling dashboard — produkce"),
    ]),
    (BIS_PID, "3a97599b-5a6f-4907-a4ee-0d88e45ac044", [  # BIS-165 Strategie
        (f"{BASE}/bistro?tab=strategie", "Strategie (8 sekcí) — produkce"),
    ]),
    (BIS_PID, "9a865bb4-6ef7-43f9-ac1c-68fa46f38007", [  # BIS-166 Gantt
        (f"{BASE}/bistro?tab=kontroling", "Gantt chart — produkce"),
    ]),
    (BIS_PID, "e72d6753-f7b5-4346-9ba6-46c541d6659d", [  # BIS-167 CEO Briefing
        (f"{BASE}/bistro?tab=briefing", "CEO Briefing viewer — produkce"),
    ]),
    (BIS_PID, "632690ad-fca8-4b49-bb69-820c943fbd20", [  # BIS-168 DB + API
        (f"{BASE}/api/bistro/phases", "API: /api/bistro/phases"),
        (f"{BASE}/api/bistro/tasks", "API: /api/bistro/tasks"),
        (f"{BASE}/api/bistro/kpis", "API: /api/bistro/kpis"),
    ]),

    # === ESH — E-shop ===
    (ESH_PID, "63355765-5b9e-44ce-bc51-45c4ea254b76", [  # ESH-1 Analýza
        (f"{BASE}/eshop", "E-shop — produkce"),
    ]),
    (ESH_PID, "67a47f0a-d2b4-4bfb-accb-e528b20c32c5", [  # ESH-2 Výběr platformy
        (f"{BASE}/eshop", "E-shop (Next.js 16) — produkce"),
    ]),
    (ESH_PID, "68de83c7-1067-4aba-938b-76c2c654781f", [  # ESH-3 Katalog
        (f"{BASE}/eshop", "Produktový katalog — produkce"),
    ]),
    (ESH_PID, "587fdc06-eb00-471f-91b9-d815efc0e75f", [  # ESH-5 Foto + SEO
        (f"{BASE}/eshop", "E-shop (fotky + SEO) — produkce"),
    ]),
    (ESH_PID, "83da678f-06de-4eef-97b0-60b7cf35fdd8", [  # ESH-6 Beta
        (f"{BASE}/eshop", "E-shop beta — produkce"),
    ]),
    (ESH_PID, "9b17b21f-30b5-4302-b28d-83b9e64cbb40", [  # ESH-7 Spuštění
        (f"{BASE}/eshop", "E-shop — produkce"),
    ]),
    (ESH_PID, "b61facbe-097f-4698-a2a9-3bf92ac662b2", [  # ESH-11 Katalog grid
        (f"{BASE}/eshop", "Produktový katalog — grid, filtr, search"),
    ]),
    (ESH_PID, "3cac6fcb-aa37-40b9-9632-11b74243b42c", [  # ESH-12 Košík
        (f"{BASE}/eshop/kosik", "Nákupní košík — produkce"),
    ]),
    (ESH_PID, "f22899b1-c79e-4249-a1f3-59652f1783b3", [  # ESH-13 Checkout
        (f"{BASE}/eshop/pokladna", "Pokladna (checkout) — produkce"),
        (f"{BASE}/eshop/dekujeme", "Děkujeme (order confirmation)"),
    ]),
    (ESH_PID, "ec57f02c-8745-47cc-b0cd-81e24d20596e", [  # ESH-14 Comgate
        (f"{BASE}/api/eshop/checkout", "API: checkout (Comgate)"),
        (f"{BASE}/api/eshop/payment/callback", "API: payment callback"),
    ]),
    (ESH_PID, "4f3c97c5-43ae-4479-a933-590e02013cde", [  # ESH-15 Admin produkty
        (f"{BASE}/eshop/admin", "Admin — správa produktů"),
    ]),
    (ESH_PID, "f135eddd-d28c-4edc-ac15-874503daf9c2", [  # ESH-16 Admin objednávky
        (f"{BASE}/eshop/admin/objednavky", "Admin — objednávky + dashboard"),
    ]),
    (ESH_PID, "335d906f-3f0f-42ef-b162-4beba9d4dc7b", [  # ESH-17 Sklad
        (f"{BASE}/eshop/admin/sklad", "Správa skladu — produkce"),
    ]),
    (ESH_PID, "4e0dab90-3999-4649-bc45-1c9989f91f60", [  # ESH-18 POS
        (f"{BASE}/eshop/admin/objednavky", "POS recepce (Quick Sale)"),
    ]),
    (ESH_PID, "65aa67d5-5554-43ee-a309-d4d6fc7febf9", [  # ESH-19 Slevy
        (f"{BASE}/api/eshop/discount/validate", "API: validace slevového kódu"),
    ]),
    (ESH_PID, "2650e505-6f95-4bad-85c4-eee19c11761b", [  # ESH-20 Detail produktu
        (f"{BASE}/eshop", "Detail produktu (/eshop/[slug])"),
    ]),
    (ESH_PID, "31809c0d-053d-4ec0-8a84-a74969a85f26", [  # ESH-21 DB
        (f"{BASE}/api/eshop/products", "API: /api/eshop/products"),
    ]),
    (ESH_PID, "f8445b11-9543-49af-9fd5-fcb923803381", [  # ESH-22 Email
        (f"{BASE}/eshop/dekujeme", "Order confirmation page"),
    ]),

    # === EOS ===
    (EOS_PID, "1ec9d514-06ea-441d-9792-9478bed64791", [  # EOS-11 Checklist UI
        (f"{BASE}/eos", "EOS Discovery checklist — produkce"),
    ]),
    (EOS_PID, "62078251-646e-4a32-8e6a-5e9984fd19c4", [  # EOS-14 Kategorie
        (f"{BASE}/eshop", "E-shop s kategoriemi memberships/tickets"),
    ]),

    # === SAL — Salonky ===
    (SAL_PID, "63929fe6-270b-4248-bd87-a53cdf48eff0", [  # SAL-3 Cenová politika
        (f"{BASE}/bistro?tab=strategie", "Salonky sekce ve Strategii Bistro"),
    ]),
    (SAL_PID, "9abafacc-3933-4411-ada6-cdf569b7d9f8", [  # SAL-11 Business case
        (f"{BASE}/bistro?tab=strategie", "Business case — Strategie Bistro"),
    ]),
]


def add_link(project_id: str, issue_id: str, url: str, title: str):
    """Add a link to an issue."""
    endpoint = f"{API}/projects/{project_id}/issues/{issue_id}/links/"
    body = json.dumps({"url": url, "title": title}).encode()
    req = urllib.request.Request(endpoint, data=body, headers=HEADERS, method="POST")
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        if e.code == 400 and "already" in err.lower():
            print(f"    (already exists)")
            return None
        print(f"    ERROR {e.code}: {err}")
        return None


def main():
    total = sum(len(links) for _, _, links in LINKS)
    done = 0

    for project_id, issue_id, links in LINKS:
        for url, title in links:
            done += 1
            print(f"[{done}/{total}] {title}")
            add_link(project_id, issue_id, url, title)
            time.sleep(1.5)

    print(f"\nHotovo! {done} odkazů přidáno.")


if __name__ == "__main__":
    main()
