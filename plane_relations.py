#!/usr/bin/env python3
"""Create all 99 Bistro issue relations via Plane internal API with session auth."""

import json
import time
import urllib.request
import urllib.error

BASE_URL = "http://46.225.31.161/api"
WORKSPACE = "krasovska"
BISTRO_PROJECT_ID = "c7f73e13-5bf2-405e-a952-3cccf2177f19"
SESSION = "okpxquzi15azvct6kslh0hrrqxnr7g8epkt30x7yzbpsp1lufqgw84f8nxg3ob3kvwrhx5z9chmbyv9mnnv4qhldnum23zj41qfbnwhket7vrrbdz1z5ltie4d9pkpy4"
API_KEY = "plane_api_c3b023ea27254bfc8979a6d787dd7e0e"

# All 99 relations: (blocker_seq_id, blocked_seq_id)
BISTRO_RELATIONS = [
    # Quick Start chain
    (8, 10), (10, 6), (6, 2), (2, 12), (2, 14), (2, 16), (2, 22),
    (2, 24), (2, 30), (2, 32), (2, 26), (2, 28), (2, 18), (2, 20),
    (24, 4), (30, 4), (32, 4), (28, 34), (22, 38), (28, 40), (34, 40),
    # MVP -> Standard
    (30, 46), (18, 46), (32, 48), (18, 48), (26, 50), (22, 52),
    (24, 54), (52, 54), (54, 56), (14, 58), (46, 58), (48, 58),
    (20, 44), (52, 44), (52, 60), (54, 60), (58, 60),
    (52, 62), (46, 62), (40, 62), (58, 64), (46, 64), (48, 64),
    (38, 66), (60, 68), (66, 68), (54, 80), (54, 70), (62, 70),
    (36, 76), (54, 76), (46, 42), (48, 42), (58, 42), (60, 42),
    # Standard -> Full
    (64, 84), (64, 94), (94, 96), (70, 116), (96, 98), (94, 100),
    (100, 104), (100, 102), (100, 108), (102, 118), (102, 106), (108, 106),
    (106, 86), (106, 122), (86, 110), (86, 112), (86, 114), (86, 120),
    (100, 90), (116, 92), (102, 88),
    # Full Operace
    (88, 134), (88, 128), (98, 136), (134, 138), (136, 138),
    (120, 140), (134, 132), (140, 130), (140, 142), (142, 124),
    (134, 148), (124, 144), (142, 158), (142, 160), (144, 146),
    (142, 126), (134, 150), (144, 162), (138, 152), (134, 154),
    (124, 156), (142, 156),
]


def api_get(path):
    """GET via external API (v1) with API key."""
    url = f"http://46.225.31.161/api/v1/{path}"
    req = urllib.request.Request(url, headers={
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
    })
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def api_post_session(path, data):
    """POST via internal API with session cookie."""
    url = f"{BASE_URL}/{path}"
    body = json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, method="POST", headers={
        "Cookie": f"session-id={SESSION}",
        "Content-Type": "application/json",
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        err = e.read().decode() if e.fp else ""
        if e.code == 429:
            print(f"  RATE LIMIT — waiting 30s")
            time.sleep(30)
            # retry once
            req = urllib.request.Request(url, data=body, method="POST", headers={
                "Cookie": f"session-id={SESSION}",
                "Content-Type": "application/json",
            })
            try:
                with urllib.request.urlopen(req, timeout=30) as resp:
                    return json.loads(resp.read().decode())
            except urllib.error.HTTPError as e2:
                return {"error": e2.code}
        print(f"  ERROR {e.code}: {err[:200]}")
        return {"error": e.code}


def main():
    print("Plane — Nastavení 99 závislostí pro Bistro")
    print("=" * 60)

    # Fetch all issues to build seq_id -> uuid map
    data = api_get(f"workspaces/{WORKSPACE}/projects/{BISTRO_PROJECT_ID}/issues/")
    seq_to_id = {i["sequence_id"]: i["id"] for i in data["results"]}
    seq_to_name = {i["sequence_id"]: i["name"] for i in data["results"]}
    print(f"Loaded {len(seq_to_id)} issues\n")

    created = 0
    skipped = 0
    errors = 0

    for i, (blocker_seq, blocked_seq) in enumerate(BISTRO_RELATIONS):
        blocker_id = seq_to_id.get(blocker_seq)
        blocked_id = seq_to_id.get(blocked_seq)

        if not blocker_id or not blocked_id:
            print(f"  SKIP BIS-{blocker_seq} -> BIS-{blocked_seq}: ID not found")
            errors += 1
            continue

        # Create relation: blocked_seq is blocked_by blocker_seq
        path = f"workspaces/{WORKSPACE}/projects/{BISTRO_PROJECT_ID}/issues/{blocked_id}/issue-relation/"
        result = api_post_session(path, {
            "relation_type": "blocked_by",
            "issues": [blocker_id],
        })

        if isinstance(result, list):
            blocker_name = seq_to_name.get(blocker_seq, "?")[:30]
            blocked_name = seq_to_name.get(blocked_seq, "?")[:30]
            print(f"  [{i+1:2d}/99] OK BIS-{blocker_seq:3d} → BIS-{blocked_seq:3d}  ({blocker_name} → {blocked_name})")
            created += 1
        elif isinstance(result, dict) and "error" in result:
            errors += 1
        else:
            # Could be empty list (duplicate/already exists)
            print(f"  [{i+1:2d}/99] SKIP BIS-{blocker_seq:3d} → BIS-{blocked_seq:3d} (already exists?)")
            skipped += 1

        time.sleep(1.2)

    print(f"\n{'=' * 60}")
    print(f"Relations: {created} created, {skipped} skipped, {errors} errors (of {len(BISTRO_RELATIONS)} total)")
    print(f"\nOvěřte v Plane: http://46.225.31.161/")


if __name__ == "__main__":
    main()
