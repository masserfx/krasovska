#!/usr/bin/env python3
"""Watch for Leona's Plane invitation acceptance.
When she accepts, automatically:
1. Add her to Bistro + Salonky as member (role 15)
2. Set her as project_lead on both
3. Add Leoš + Tomáš as members (collaborators)
4. Write success log and remove the launchd job
"""

import json
import logging
import sys
import time
import urllib.request
import subprocess
from pathlib import Path

LOG = Path(__file__).parent / "plane_leona_watch.log"
logging.basicConfig(filename=LOG, level=logging.INFO,
                    format="%(asctime)s  %(message)s")

API = "http://46.225.31.161/api/v1/workspaces/krasovska"
HEADERS = {
    "x-api-key": "plane_api_c3b023ea27254bfc8979a6d787dd7e0e",
    "Content-Type": "application/json",
}

LEONA_EMAIL = "leonka.hradkova@gmail.com"
LEOS_ID = "c0c0fa32-6adb-4c10-acbc-bf9e2e9d1823"

BISTRO = "c7f73e13-5bf2-405e-a952-3cccf2177f19"
SALONKY = "1addbff0-cc91-4308-9063-262e6ee3fad3"

PLIST = Path.home() / "Library/LaunchAgents/cz.hradev.plane-leona-watch.plist"


def api(method, path, data=None):
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(f"{API}{path}", data=body, headers=HEADERS, method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def find_leona():
    """Check if Leona is now a workspace member (= accepted invitation)."""
    members = api("GET", "/members/")
    for m in members:
        if m.get("email") == LEONA_EMAIL:
            return m["id"]
    return None


def add_to_project(project_id, user_id, role=15):
    """Add user to project."""
    try:
        api("POST", f"/projects/{project_id}/members/",
            {"member": user_id, "role": role})
        return True
    except urllib.error.HTTPError as e:
        if e.code == 400:  # already member
            return True
        raise


def set_project_lead(project_id, user_id):
    """Set project_lead."""
    api("PATCH", f"/projects/{project_id}/",
        {"project_lead": user_id, "updated_by": LEOS_ID})


def uninstall():
    """Remove the launchd job after success."""
    if PLIST.exists():
        subprocess.run(["launchctl", "bootout", f"gui/{__import__('os').getuid()}", str(PLIST)],
                       capture_output=True)
        PLIST.unlink()
        logging.info("LaunchAgent removed")


def main():
    logging.info("Checking for Leona's invitation acceptance...")

    leona_id = find_leona()

    if not leona_id:
        logging.info("Leona hasn't accepted yet. Will retry later.")
        print("Leona hasn't accepted yet.")
        return

    logging.info(f"Leona accepted! User ID: {leona_id}")
    print(f"Leona accepted! ID: {leona_id}")

    # 1. Add to Bistro + Salonky
    for name, pid in [("Bistro", BISTRO), ("Salonky", SALONKY)]:
        time.sleep(1.5)
        add_to_project(pid, leona_id, role=15)
        logging.info(f"  Added Leona to {name} (member)")

        time.sleep(1.5)
        set_project_lead(pid, leona_id)
        logging.info(f"  Set Leona as project_lead on {name}")

    # 2. Ensure Leoš is member on both (already done, but just in case)
    for name, pid in [("Bistro", BISTRO), ("Salonky", SALONKY)]:
        time.sleep(1.5)
        try:
            add_to_project(pid, LEOS_ID, role=20)
        except Exception:
            pass

    logging.info("ALL DONE — Leona is project_lead on Bistro + Salonky")
    print("Done! Leona is project_lead on Bistro + Salonky")

    # 3. Self-destruct the scheduled job
    uninstall()


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        logging.error(f"Error: {e}")
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
