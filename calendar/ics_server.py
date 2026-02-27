#!/usr/bin/env python3
"""
Krasovská Calendar — .ics feed generator
Serves Plane CE issues as iCalendar subscription feed.
Filters projects based on Plane project membership.

Usage:
    python3 ics_server.py

Endpoints:
    GET /calendar/krasovska.ics?token=XXX              — all projects
    GET /calendar/krasovska.ics?token=XXX&user=EMAIL    — only projects where user is member
    GET /health                                         — health check
"""

import json
import os
import socket
import threading
import time
import urllib.request
import hmac
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime, timedelta
from hashlib import md5
from urllib.parse import urlparse, parse_qs


def sd_notify(msg: str):
    """Send notification to systemd (sd_notify)."""
    addr = os.environ.get("NOTIFY_SOCKET")
    if not addr:
        return
    if addr[0] == "@":
        addr = "\0" + addr[1:]
    sock = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
    try:
        sock.connect(addr)
        sock.sendall(msg.encode())
    finally:
        sock.close()


# --- Config ---
PLANE_API_KEY = os.environ.get(
    "PLANE_API_KEY", "plane_api_c3b023ea27254bfc8979a6d787dd7e0e"
)
PLANE_BASE = os.environ.get(
    "PLANE_BASE_URL", "http://localhost/api/v1/workspaces/krasovska"
)
CALENDAR_TOKEN = os.environ.get(
    "CALENDAR_TOKEN", "gtQLkawoAcZyRj8X9QrpZo9JHQs7hyN9-q4BmwrUKTI"
)
BIND_HOST = os.environ.get("BIND_HOST", "0.0.0.0")
PROJECTS = {
    "bistro": {
        "id": "c7f73e13-5bf2-405e-a952-3cccf2177f19",
        "name": "Bistro",
        "prefix": "BIS",
    },
    "eshop": {
        "id": "92793297-f6eb-498b-87d3-2f9f4cd7ff34",
        "name": "E-shop",
        "prefix": "ESH",
    },
    "eos": {
        "id": "2fec08e8-eb48-4eaa-b991-71f30f5cbc7c",
        "name": "EOS Integrace",
        "prefix": "EOS",
    },
    "salonky": {
        "id": "1addbff0-cc91-4308-9063-262e6ee3fad3",
        "name": "Salonky",
        "prefix": "SAL",
    },
    "web": {
        "id": "5ebe0ea2-42f6-49d5-b982-c7508ecc2084",
        "name": "Web",
        "prefix": "WEB",
    },
    "test-lea": {
        "id": "7242bd2c-6883-409f-a3af-a4d48c4df636",
        "name": "TEST-Lea",
        "prefix": "TLE",
    },
}

CACHE_TTL = 900  # 15 minutes
MEMBERSHIP_CACHE_TTL = 900  # 15 minutes
PORT = 5555

# --- Cache ---
_ics_cache = {}  # {cache_key: {"ics": str, "ts": float}}
_membership_cache = {"data": None, "ts": 0}  # {"data": {email: [project_keys]}, "ts": float}


def api_get(path: str) -> dict | list:
    """GET request to Plane API."""
    url = f"{PLANE_BASE}{path}"
    req = urllib.request.Request(url, headers={"x-api-key": PLANE_API_KEY})
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())


def fetch_all_memberships() -> dict[str, list[str]]:
    """Fetch project members from Plane DB via Django ORM (bypasses v1 API cache bug)."""
    import subprocess

    project_ids = {proj["id"]: key for key, proj in PROJECTS.items()}
    ids_json = json.dumps(list(project_ids.keys()))
    # Map project UUIDs to keys inside the Django shell script
    django_script = f"""
import json
from plane.db.models import ProjectMember
PROJECT_MAP = {json.dumps({proj["id"]: key for key, proj in PROJECTS.items()})}
result = {{}}
members = ProjectMember.objects.filter(
    project_id__in=PROJECT_MAP.keys(),
    is_active=True,
).select_related("member")
for m in members:
    email = m.member.email.lower()
    proj_key = PROJECT_MAP.get(str(m.project_id))
    if proj_key:
        result.setdefault(email, []).append(proj_key)
print(json.dumps(result))
"""
    try:
        result = subprocess.run(
            ["docker", "exec", "plane-app-api-1", "python", "manage.py", "shell", "-c", django_script],
            capture_output=True, text=True, timeout=30,
        )
        if result.returncode == 0:
            output = result.stdout.strip().split("\n")[-1]  # last line is JSON
            return json.loads(output)
        else:
            print(f"[ERROR] Django shell failed: {result.stderr[:200]}")
    except Exception as e:
        print(f"[ERROR] Fetch memberships via Docker: {e}")

    # Fallback to v1 API if Docker fails
    print("[WARN] Falling back to v1 API for memberships")
    email_to_projects: dict[str, list[str]] = {}
    for proj_key, proj in PROJECTS.items():
        try:
            data = api_get(f"/projects/{proj['id']}/members/")
            members = data.get("results", data) if isinstance(data, dict) else data
            for member in members:
                email = member.get("email", "").lower()
                if email:
                    email_to_projects.setdefault(email, []).append(proj_key)
        except Exception as e:
            print(f"[ERROR] Fetch members for {proj_key}: {e}")
    return email_to_projects


def get_user_projects(email: str) -> list[str] | None:
    """Get project keys where user is a member. Returns None if user not found."""
    now = time.time()
    if _membership_cache["data"] is None or (now - _membership_cache["ts"]) > MEMBERSHIP_CACHE_TTL:
        print(f"[{datetime.now().isoformat()}] Refreshing membership cache...")
        _membership_cache["data"] = fetch_all_memberships()
        _membership_cache["ts"] = now
        for em, projs in _membership_cache["data"].items():
            print(f"  {em}: {', '.join(projs)}")

    return _membership_cache["data"].get(email.lower())


def fetch_issues(project_id: str) -> list:
    """Fetch all issues from Plane API (handles pagination)."""
    all_issues = []
    page = 1
    while True:
        url = f"{PLANE_BASE}/projects/{project_id}/issues/?per_page=100&page={page}"
        req = urllib.request.Request(url, headers={"x-api-key": PLANE_API_KEY})
        try:
            resp = urllib.request.urlopen(req, timeout=30)
            data = json.loads(resp.read())
            results = data.get("results", [])
            all_issues.extend(results)
            if not data.get("next_page_results", False):
                break
            page += 1
        except Exception as e:
            print(f"[ERROR] Fetch issues page {page}: {e}")
            break
    return all_issues


def fetch_states(project_id: str) -> dict:
    """Fetch states for a project → {state_id: {"name": ..., "group": ...}}."""
    try:
        data = api_get(f"/projects/{project_id}/states/")
        states = data.get("results", data) if isinstance(data, dict) else data
        return {s["id"]: {"name": s["name"], "group": s.get("group", "")} for s in states}
    except Exception as e:
        print(f"[ERROR] Fetch states: {e}")
        return {}


def fetch_labels(project_id: str) -> dict:
    """Fetch labels for a project → {label_id: label_name}."""
    try:
        data = api_get(f"/projects/{project_id}/labels/")
        labels = data.get("results", data) if isinstance(data, dict) else data
        return {l["id"]: l["name"] for l in labels}
    except Exception as e:
        print(f"[ERROR] Fetch labels: {e}")
        return {}


def fetch_modules(project_id: str) -> list:
    """Fetch modules for a project."""
    try:
        data = api_get(f"/projects/{project_id}/modules/")
        return data.get("results", data) if isinstance(data, dict) else data
    except Exception as e:
        print(f"[ERROR] Fetch modules: {e}")
        return []


def get_issue_type(issue: dict, labels: dict) -> str:
    """Determine issue type from labels."""
    for label_id in issue.get("labels", []):
        label_name = labels.get(label_id, "").lower()
        if label_name in ("milestone", "goal", "task"):
            return label_name
    return "task"


def get_issue_state(issue: dict, states: dict) -> str:
    """Get human-readable state."""
    state_id = issue.get("state", "")
    state = states.get(state_id)
    if state:
        return state["name"]
    return "Unknown"


def escape_ics(text: str) -> str:
    """Escape special characters for iCalendar."""
    return (
        text.replace("\\", "\\\\")
        .replace(";", "\\;")
        .replace(",", "\\,")
        .replace("\n", "\\n")
    )


def make_uid(prefix: str, seq_id: int) -> str:
    """Generate stable UID for an event."""
    return f"{prefix}-{seq_id}@halakrasovska.cz"


def date_plus_one(date_str: str) -> str:
    """Add one day to YYYYMMDD date (for DTEND of all-day events)."""
    dt = datetime.strptime(date_str, "%Y%m%d")
    return (dt + timedelta(days=1)).strftime("%Y%m%d")


def format_date(iso_date: str) -> str:
    """Convert 2026-02-25 → 20260225."""
    return iso_date.replace("-", "")


def generate_vevent(
    uid: str,
    dtstart: str,
    dtend: str,
    summary: str,
    description: str = "",
    categories: str = "TASK",
    status: str = "TENTATIVE",
    alarms: list = None,
) -> str:
    """Generate a single VEVENT block."""
    lines = [
        "BEGIN:VEVENT",
        f"UID:{uid}",
        f"DTSTAMP:{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}",
        f"DTSTART;VALUE=DATE:{dtstart}",
        f"DTEND;VALUE=DATE:{dtend}",
        f"SUMMARY:{escape_ics(summary)}",
    ]
    if description:
        lines.append(f"DESCRIPTION:{escape_ics(description)}")
    lines.append(f"CATEGORIES:{categories}")
    lines.append(f"STATUS:{status}")

    for alarm in alarms or []:
        lines.extend(
            [
                "BEGIN:VALARM",
                f"TRIGGER:-P{alarm}D",
                "ACTION:DISPLAY",
                f"DESCRIPTION:Za {alarm} dn{'í' if alarm > 1 else 'en'}: {escape_ics(summary)}",
                "END:VALARM",
            ]
        )

    lines.append("END:VEVENT")
    return "\r\n".join(lines)


def generate_ics(project_keys: list[str] | None = None) -> str:
    """Generate full iCalendar content from Plane data.

    Args:
        project_keys: List of project keys to include. None = all projects.
    """
    events = []
    selected = {k: v for k, v in PROJECTS.items() if k in project_keys} if project_keys else PROJECTS

    for proj_key, proj in selected.items():
        project_id = proj["id"]
        prefix = proj["prefix"]

        # Fetch project metadata
        states = fetch_states(project_id)
        labels = fetch_labels(project_id)
        modules = fetch_modules(project_id)

        # 1. Module events (as phases)
        for mod in modules:
            mod_start = mod.get("start_date")
            mod_target = mod.get("target_date")
            if not mod_start or not mod_target:
                continue
            mod_name = f"{proj['name']}: {mod['name']}"
            uid = f"module-{md5(mod['id'].encode()).hexdigest()[:12]}@halakrasovska.cz"
            events.append(
                generate_vevent(
                    uid=uid,
                    dtstart=format_date(mod_start),
                    dtend=date_plus_one(format_date(mod_target)),
                    summary=f"\U0001f4cb {mod_name}",
                    description=f"Modul projektu {proj['name']}: {mod['name']}",
                    categories="MODULE",
                    status="CONFIRMED",
                )
            )

        # 2. Issue events
        issues = fetch_issues(project_id)

        for issue in issues:
            seq = issue.get("sequence_id", 0)
            name = issue.get("name", "")
            start = issue.get("start_date")
            target = issue.get("target_date")
            issue_type = get_issue_type(issue, labels)
            state = get_issue_state(issue, states)

            if not target:
                continue

            dtstart = format_date(start or target)
            dtend = date_plus_one(format_date(target))

            # Status mapping
            if state == "Done":
                ics_status = "COMPLETED"
            elif state == "In Progress":
                ics_status = "CONFIRMED"
            else:
                ics_status = "TENTATIVE"

            # Prefix and alarms based on type
            if issue_type == "milestone":
                summary = f"\u2b50 {name}"
                categories = "MILESTONE"
                alarms = [7, 3, 1]
            elif issue_type == "goal":
                summary = f"\U0001f3af {name}"
                categories = "GOAL"
                alarms = [3, 1]
            else:
                summary = f"{prefix}-{seq}: {name}"
                categories = "TASK"
                alarms = [1]

            description = (
                f"Projekt: {proj['name']}\\n"
                f"Typ: {issue_type}\\n"
                f"Stav: {state}\\n"
                f"Plane: http://46.225.31.161/krasovska/projects/{proj['id']}/issues/"
            )

            events.append(
                generate_vevent(
                    uid=make_uid(prefix, seq),
                    dtstart=dtstart,
                    dtend=dtend,
                    summary=summary,
                    description=description,
                    categories=categories,
                    status=ics_status,
                    alarms=alarms,
                )
            )

    # Calendar name reflects filter
    if project_keys:
        cal_name = "Krasovsk\u00e1 \u2014 " + ", ".join(p["name"] for p in selected.values())
    else:
        cal_name = "Krasovsk\u00e1 \u2014 Projekty"

    # Assemble calendar
    header = "\r\n".join(
        [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Hala Krasovsk\u00e1//Plane Calendar//CS",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
            f"X-WR-CALNAME:{cal_name}",
            "X-WR-TIMEZONE:Europe/Prague",
            "",
            "BEGIN:VTIMEZONE",
            "TZID:Europe/Prague",
            "BEGIN:STANDARD",
            "DTSTART:19701025T030000",
            "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10",
            "TZOFFSETFROM:+0200",
            "TZOFFSETTO:+0100",
            "TZNAME:CET",
            "END:STANDARD",
            "BEGIN:DAYLIGHT",
            "DTSTART:19700329T020000",
            "RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3",
            "TZOFFSETFROM:+0100",
            "TZOFFSETTO:+0200",
            "TZNAME:CEST",
            "END:DAYLIGHT",
            "END:VTIMEZONE",
        ]
    )

    footer = "END:VCALENDAR"
    body = "\r\n".join(events)

    return f"{header}\r\n{body}\r\n{footer}\r\n"


class CalendarHandler(BaseHTTPRequestHandler):
    """HTTP handler for .ics feed."""

    def _check_token(self) -> bool:
        """Validate token from query parameter."""
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        token = params.get("token", [None])[0]
        if not token:
            return False
        return hmac.compare_digest(token, CALENDAR_TOKEN)

    def _send_forbidden(self):
        self.send_response(403)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Forbidden - invalid or missing token")

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # Health check — no auth needed
        if path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"OK")
            return

        # Calendar feed — requires token
        if path == "/calendar/krasovska.ics":
            if not self._check_token():
                self._send_forbidden()
                return

            params = parse_qs(parsed.query)

            # Determine project filter
            user_email = params.get("user", [None])[0]
            if user_email:
                # Filter by Plane project membership
                project_keys = get_user_projects(user_email)
                if project_keys is None:
                    # Unknown user — return empty calendar
                    print(f"[WARN] Unknown user: {user_email}")
                    project_keys = []
                project_keys.sort()
                cache_key = f"user:{user_email.lower()}"
            else:
                # No user filter — all projects
                project_keys = None
                cache_key = "all"

            now = time.time()
            cached = _ics_cache.get(cache_key)
            if cached is None or (now - cached["ts"]) > CACHE_TTL:
                filter_desc = f"user={user_email}" if user_email else "all"
                proj_desc = ",".join(project_keys) if project_keys else ("none" if project_keys == [] else "all")
                print(f"[{datetime.now().isoformat()}] Regenerating .ics ({filter_desc} → {proj_desc})...")
                ics_data = generate_ics(project_keys if project_keys is not None else None)
                _ics_cache[cache_key] = {"ics": ics_data, "ts": now}
            else:
                ics_data = cached["ics"]

            self.send_response(200)
            self.send_header("Content-Type", "text/calendar; charset=utf-8")
            self.send_header("Content-Disposition", "inline; filename=krasovska.ics")
            self.send_header("Cache-Control", "private, max-age=900")
            self.end_headers()
            self.wfile.write(ics_data.encode("utf-8"))

            sd_notify("WATCHDOG=1")
            return

        # Everything else — 404
        self.send_response(404)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(b"Not found")

    def log_message(self, format, *args):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")


def watchdog_loop():
    """Periodically ping systemd watchdog via self health-check."""
    import urllib.request as wr
    while True:
        try:
            resp = wr.urlopen(f"http://127.0.0.1:{PORT}/health", timeout=10)
            if resp.status == 200:
                sd_notify("WATCHDOG=1")
        except Exception as e:
            print(f"[WATCHDOG] Health check failed: {e}")
        time.sleep(30)


def main():
    server = HTTPServer((BIND_HOST, PORT), CalendarHandler)
    print(f"Krasovsk\u00e1 Calendar Server running on {BIND_HOST}:{PORT}")
    print(f"  Feed: http://localhost:{PORT}/calendar/krasovska.ics?token=***")
    print(f"  Feed (user): http://localhost:{PORT}/calendar/krasovska.ics?token=***&user=EMAIL")
    print(f"  Health: http://localhost:{PORT}/health")

    # Start watchdog thread
    wd = threading.Thread(target=watchdog_loop, daemon=True)
    wd.start()

    # Notify systemd we are ready
    sd_notify("READY=1")
    print("[SYSTEMD] Notified READY=1")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.server_close()


if __name__ == "__main__":
    main()
