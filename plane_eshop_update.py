#!/usr/bin/env python3
"""Update Plane E-shop project to match actual production state."""

import json
import time
import urllib.request

API = "http://46.225.31.161/api/v1/workspaces/krasovska/projects/92793297-f6eb-498b-87d3-2f9f4cd7ff34"
HEADERS = {
    "x-api-key": "plane_api_c3b023ea27254bfc8979a6d787dd7e0e",
    "Content-Type": "application/json",
}

# States
DONE = "b16968a9-b11a-407f-afcc-f7fa94d8d314"
TODO = "5effea58-4606-400a-b0a1-cb352e3b42d4"
IN_PROGRESS = "0fe80aac-58c1-4b23-9890-f0c8e430ee0b"

# Labels
TASK = "968f0d9f-f052-49b4-b2ac-49ce66ae598a"
MILESTONE = "d1b77227-bcc7-49db-97fb-6d2bd2a7adbe"
GOAL = "f4801d5c-82b0-40e5-b88a-7662456888e0"

# Modules
MOD_PRIPRAVA = "781cdc63-3b83-4d25-883b-7d6983189674"
MOD_VYVOJ = "b430b1c9-2f77-441a-b09e-149b68b14145"
MOD_PROVOZ = "096079bc-819e-4645-800a-38c9117e535f"

DELAY = 1.5  # rate limit


def api(method, path, data=None):
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(f"{API}{path}", data=body, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  ERROR {e.code}: {e.read().decode()[:200]}")
        return None


def update_issue(issue_id, data):
    time.sleep(DELAY)
    result = api("PATCH", f"/issues/{issue_id}/", data)
    if result:
        print(f"  ✓ Updated: {result.get('name', issue_id)}")
    return result


def create_issue(data):
    time.sleep(DELAY)
    result = api("POST", "/issues/", data)
    if result:
        print(f"  ✓ Created: {result['name']} (#{result['sequence_id']})")
    return result


def add_to_module(module_id, issue_id):
    time.sleep(DELAY)
    result = api("POST", f"/modules/{module_id}/module-issues/", {"issues": [issue_id]})
    if result:
        print(f"  ✓ Added to module")
    return result


# ─── 1. Mark existing issues as Done (completed in production) ───

print("\n═══ MARKING COMPLETED ISSUES AS DONE ═══\n")

done_issues = {
    "63355765-5b9e-44ce-bc51-45c4ea254b76": "Analýza trhu a konkurence",
    "67a47f0a-d2b4-4bfb-accb-e528b20c32c5": "Výběr platformy",
    "68de83c7-1067-4aba-938b-76c2c654781f": "Katalog — první kolekce (50+ produktů)",
    "587fdc06-eb00-471f-91b9-d815efc0e75f": "Fotografie a SEO popisky",
    "83da678f-06de-4eef-97b0-60b7cf35fdd8": "Beta testování",
    "9b17b21f-30b5-4302-b28d-83b9e64cbb40": "Spuštění e-shopu",
}

for issue_id, name in done_issues.items():
    print(f"→ {name}")
    update_issue(issue_id, {"state": DONE, "labels": [TASK]})

# Mark "Smlouvy s distributory" as In Progress (partially done - platform chosen, no formal contracts yet)
print(f"\n→ Smlouvy s distributory → In Progress")
update_issue("36d01653-2865-4bdd-a6da-26cf596d0042", {"state": IN_PROGRESS, "labels": [TASK]})

# Mark remaining issues with labels
print(f"\n→ Marketing a Google Ads → Todo + task label")
update_issue("089fd396-02ec-44b9-ba8d-ca06c1b22e50", {"labels": [TASK]})

print(f"\n→ Integrace s EOS → Todo + task label")
update_issue("e0c3a274-6aa6-47bd-b61a-5fee1396b8e4", {"labels": [TASK]})

print(f"\n→ Vyhodnocení po 3 měsících → milestone label")
update_issue("70fd494a-492d-4ae0-ac3d-8f0c8da323a4", {"labels": [MILESTONE]})


# ─── 2. Create new issues for production features ───

print("\n═══ CREATING NEW ISSUES (DONE - already in production) ═══\n")

done_new_issues = [
    {
        "name": "Produktový katalog — grid, filtrování, vyhledávání",
        "description_html": "<p>Implementace ProductGrid, ProductCard, CategoryFilter, vyhledávání. 10 kategorií (rakety, košíčky, oblečení, obuv, doplňky, výživa, dárkové poukazy, permanentky, vstupenky, merchandising).</p>",
        "state": DONE,
        "labels": [TASK],
        "start_date": "2026-05-15",
        "target_date": "2026-06-01",
        "priority": "high",
        "module": MOD_VYVOJ,
    },
    {
        "name": "Nákupní košík (localStorage, CartDrawer, toast)",
        "description_html": "<p>useCart hook s localStorage persistencí. CartDrawer boční panel, CartItemRow, CartToast notifikace. Real-time totaly.</p>",
        "state": DONE,
        "labels": [TASK],
        "start_date": "2026-05-20",
        "target_date": "2026-06-05",
        "priority": "high",
        "module": MOD_VYVOJ,
    },
    {
        "name": "Checkout flow (pokladna, objednávky)",
        "description_html": "<p>CheckoutForm s validací (jméno, email, telefon). CheckoutSteps progress bar. Slevový kód s real-time validací. OrderSummary. Thank you page.</p>",
        "state": DONE,
        "labels": [TASK],
        "start_date": "2026-06-01",
        "target_date": "2026-06-15",
        "priority": "high",
        "module": MOD_VYVOJ,
    },
    {
        "name": "Platební brána Comgate — integrace",
        "description_html": "<p>comgate.ts: createPayment, verifyPayment. Payment callback webhook. Payment return redirect. Test mode enabled. Endpoint: payments.comgate.cz/v1.0/create.</p>",
        "state": DONE,
        "labels": [TASK],
        "start_date": "2026-06-10",
        "target_date": "2026-06-20",
        "priority": "urgent",
        "module": MOD_VYVOJ,
    },
    {
        "name": "Admin panel — správa produktů (CRUD)",
        "description_html": "<p>Tabulka produktů s edit/delete/nový. ProductForm modal. Kategorie, cena, sklad, stav (active/inactive). 14 API routes.</p>",
        "state": DONE,
        "labels": [TASK],
        "start_date": "2026-06-05",
        "target_date": "2026-06-20",
        "priority": "high",
        "module": MOD_VYVOJ,
    },
    {
        "name": "Admin — správa objednávek a dashboard",
        "description_html": "<p>OrderTable se status filtry. EshopKpiCards (tržby dnes/týden/měsíc/rok, pending count). Status dropdown inline edit. Top produkty, daily revenue.</p>",
        "state": DONE,
        "labels": [TASK],
        "start_date": "2026-06-15",
        "target_date": "2026-06-30",
        "priority": "medium",
        "module": MOD_VYVOJ,
    },
    {
        "name": "Správa skladu (inline edit, low-stock alarmy)",
        "description_html": "<p>Stock tabulka s inline editací. +/- tlačítka pro quick adjust. Stock bar vizuální indikátor. Filtry: pod minimem, kategorie, search. Export CSV.</p>",
        "state": DONE,
        "labels": [TASK],
        "start_date": "2026-06-15",
        "target_date": "2026-07-01",
        "priority": "medium",
        "module": MOD_VYVOJ,
    },
    {
        "name": "POS recepce — quick-sale, QR skener",
        "description_html": "<p>QuickSaleModal: hledání produktů, QR skener (jsQR), cart sidebar, platba hotovost/karta. Automatické vytvoření objednávky bez Comgate redirect.</p>",
        "state": DONE,
        "labels": [TASK],
        "start_date": "2026-06-20",
        "target_date": "2026-07-05",
        "priority": "medium",
        "module": MOD_VYVOJ,
    },
    {
        "name": "Slevové kódy (%, fixní, min. objednávka)",
        "description_html": "<p>DiscountCodeInput komponenta. API validate endpoint. Procentní i fixní slevy. Minimální objednávka. discount_codes tabulka v DB.</p>",
        "state": DONE,
        "labels": [TASK],
        "start_date": "2026-06-10",
        "target_date": "2026-06-20",
        "priority": "low",
        "module": MOD_VYVOJ,
    },
    {
        "name": "Detail produktu (slug, trust signály, responsive)",
        "description_html": "<p>/eshop/[slug] stránka. Obrázek 4:3, popis, stock indikátor. Trust signály: osobní odběr, bezpečnost, vrácení 14 dnů. Fixed bottom CTA na mobilu. Breadcrumb.</p>",
        "state": DONE,
        "labels": [TASK],
        "start_date": "2026-05-25",
        "target_date": "2026-06-05",
        "priority": "medium",
        "module": MOD_VYVOJ,
    },
    {
        "name": "Databáze — schéma a migrace (Vercel Postgres)",
        "description_html": "<p>Tabulky: products, orders, payments, discount_codes, product_categories, users. Auto-migrace v db.ts. Indexy na category, slug, status, email.</p>",
        "state": DONE,
        "labels": [TASK],
        "start_date": "2026-05-15",
        "target_date": "2026-05-25",
        "priority": "urgent",
        "module": MOD_VYVOJ,
    },
    {
        "name": "Emailové notifikace (order confirmation)",
        "description_html": "<p>sendOrderConfirmation zákazníkovi, sendNewOrderNotification majiteli. Integrace v checkout a payment callback. Config via DB.</p>",
        "state": DONE,
        "labels": [TASK],
        "start_date": "2026-06-20",
        "target_date": "2026-07-01",
        "priority": "medium",
        "module": MOD_VYVOJ,
    },
]

# Track created issue IDs for module assignment
created_issues = {}

for issue_data in done_new_issues:
    module = issue_data.pop("module")
    result = create_issue(issue_data)
    if result:
        created_issues[result["id"]] = module


# ─── 3. Create TODO issues for remaining work ───

print("\n═══ CREATING TODO ISSUES (remaining work) ═══\n")

todo_new_issues = [
    {
        "name": "QR generátor štítků pro produkty",
        "description_html": "<p>Admin QR stránka je placeholder (~20% hotovo). QR skener funguje, ale generátor štítků pro tisk chybí. Short URL redirect /s/[id] není dokončen.</p>",
        "state": IN_PROGRESS,
        "labels": [TASK],
        "start_date": "2026-07-15",
        "target_date": "2026-08-15",
        "priority": "low",
        "module": MOD_PROVOZ,
    },
    {
        "name": "Comgate — produkční credentials",
        "description_html": "<p>E-shop běží v COMGATE_TEST=true. Pro ostré platby: získat merchant ID a secret od Comgate, nastavit env vars na Vercel, otestovat produkční webhook.</p>",
        "state": TODO,
        "labels": [MILESTONE],
        "start_date": "2026-07-15",
        "target_date": "2026-07-31",
        "priority": "urgent",
        "module": MOD_PROVOZ,
    },
    {
        "name": "Naplnění katalogu reálnými produkty",
        "description_html": "<p>Žádné hardcoded produkty. Nutno přes admin panel vytvořit reálné produkty: rakety, košíčky, obuv, oblečení. Fotky, popisy, ceny, skladové zásoby.</p>",
        "state": TODO,
        "labels": [TASK],
        "start_date": "2026-07-15",
        "target_date": "2026-08-15",
        "priority": "high",
        "module": MOD_PROVOZ,
    },
    {
        "name": "Konfigurace email notifikací v produkci",
        "description_html": "<p>Email funkce existují (sendOrderConfirmation, sendNewOrderNotification), ale SMTP config je přes DB (ne env). Nutno nakonfigurovat v produkčním prostředí.</p>",
        "state": TODO,
        "labels": [TASK],
        "start_date": "2026-07-15",
        "target_date": "2026-07-31",
        "priority": "high",
        "module": MOD_PROVOZ,
    },
    {
        "name": "E-shop Go Live ✦",
        "description_html": "<p>Milník: E-shop je živý s reálnými produkty, ostrými platbami a funkčními notifikacemi. Závisí na: Comgate produkční credentials, naplnění katalogu, email konfigurace.</p>",
        "state": TODO,
        "labels": [GOAL],
        "start_date": "2026-08-15",
        "target_date": "2026-08-15",
        "priority": "urgent",
        "module": MOD_PROVOZ,
    },
]

for issue_data in todo_new_issues:
    module = issue_data.pop("module")
    result = create_issue(issue_data)
    if result:
        created_issues[result["id"]] = module


# ─── 4. Assign issues to modules ───

print("\n═══ ASSIGNING ISSUES TO MODULES ═══\n")

# Also assign original issues to modules
original_module_map = {
    # Příprava
    "63355765-5b9e-44ce-bc51-45c4ea254b76": MOD_PRIPRAVA,  # Analýza trhu
    "67a47f0a-d2b4-4bfb-accb-e528b20c32c5": MOD_PRIPRAVA,  # Výběr platformy
    "36d01653-2865-4bdd-a6da-26cf596d0042": MOD_PRIPRAVA,  # Smlouvy s distributory
    # Vývoj
    "68de83c7-1067-4aba-938b-76c2c654781f": MOD_VYVOJ,     # Katalog
    "587fdc06-eb00-471f-91b9-d815efc0e75f": MOD_VYVOJ,     # Fotografie a SEO
    "83da678f-06de-4eef-97b0-60b7cf35fdd8": MOD_VYVOJ,     # Beta testování
    # Provoz
    "9b17b21f-30b5-4302-b28d-83b9e64cbb40": MOD_PROVOZ,    # Spuštění
    "089fd396-02ec-44b9-ba8d-ca06c1b22e50": MOD_PROVOZ,    # Marketing
    "e0c3a274-6aa6-47bd-b61a-5fee1396b8e4": MOD_PROVOZ,    # EOS integrace
    "70fd494a-492d-4ae0-ac3d-8f0c8da323a4": MOD_PROVOZ,    # Vyhodnocení
}

all_module_assignments = {**original_module_map, **created_issues}

for issue_id, module_id in all_module_assignments.items():
    add_to_module(module_id, issue_id)


# ─── 5. Update module dates to match reality ───

print("\n═══ UPDATING MODULE DATES ═══\n")

# Příprava started earlier and is mostly done
time.sleep(DELAY)
api("PATCH", f"/modules/{MOD_PRIPRAVA}/", {
    "start_date": "2026-02-01",
    "target_date": "2026-05-15",
    "status": "completed",
})
print("  ✓ Příprava → completed (feb-may)")

time.sleep(DELAY)
api("PATCH", f"/modules/{MOD_VYVOJ}/", {
    "start_date": "2026-05-15",
    "target_date": "2026-07-15",
    "status": "completed",
})
print("  ✓ Vývoj → completed (may-jul)")

time.sleep(DELAY)
api("PATCH", f"/modules/{MOD_PROVOZ}/", {
    "start_date": "2026-07-15",
    "target_date": "2026-10-31",
    "status": "started",
})
print("  ✓ Provoz → started (jul-oct)")


print("\n═══ DONE ═══")
print(f"Created {len(created_issues)} new issues")
print(f"Assigned {len(all_module_assignments)} issues to modules")
