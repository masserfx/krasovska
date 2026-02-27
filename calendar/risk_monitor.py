#!/usr/bin/env python3
"""
Risk Monitor — monitoruje zpoždění v Plane projektech a generuje alerty.

Běží jako systemd service na serveru 46.225.31.161.
Kontroluje zpožděné issues, blížící se milníky a kritickou cestu Bistra.
Loguje výsledky a volitelně odesílá alerty přes webhook.

Usage:
    python3 risk_monitor.py                  # jednorázová kontrola
    python3 risk_monitor.py --daemon         # kontinuální monitoring
    python3 risk_monitor.py --json           # JSON výstup

Env:
    PLANE_API_KEY       — Plane API key
    PLANE_BASE_URL      — Plane API base URL
    ALERT_WEBHOOK_URL   — (volitelné) webhook pro alerty (Slack/Discord/custom)
    CHECK_INTERVAL      — (volitelné) interval v sekundách (výchozí: 3600)
"""

import json
import os
import socket
import sys
import time
import urllib.request
from datetime import datetime, timedelta

# --- Config ---

PLANE_API_KEY = os.environ.get(
    "PLANE_API_KEY", "plane_api_c3b023ea27254bfc8979a6d787dd7e0e"
)
PLANE_BASE = os.environ.get(
    "PLANE_BASE_URL", "http://localhost/api/v1/workspaces/krasovska"
)
ALERT_WEBHOOK_URL = os.environ.get("ALERT_WEBHOOK_URL", "")
CHECK_INTERVAL = int(os.environ.get("CHECK_INTERVAL", "3600"))  # 1 hour
LOG_FILE = os.environ.get("LOG_FILE", "/home/leos/calendar/risk_monitor.log")

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
}

# Bistro critical path milestones (sequence IDs or names to watch)
CRITICAL_PATH_KEYWORDS = [
    "rozhodnutí",
    "rozpočet",
    "haccp",
    "khs",
    "soft opening",
    "grand opening",
    "break-even",
    "instalace",
]


def sd_notify(msg: str):
    """Send notification to systemd."""
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


def log(msg: str):
    """Log with timestamp."""
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_FILE, "a") as f:
            f.write(line + "\n")
    except OSError:
        pass


def api_get(path: str):
    """GET request to Plane API."""
    url = f"{PLANE_BASE}{path}"
    req = urllib.request.Request(url, headers={"x-api-key": PLANE_API_KEY})
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())


def fetch_issues(project_id: str) -> list:
    """Fetch all issues (paginated)."""
    all_issues = []
    page = 1
    while True:
        data = api_get(f"/projects/{project_id}/issues/?per_page=100&page={page}")
        results = data.get("results", [])
        all_issues.extend(results)
        if not data.get("next_page_results", False):
            break
        page += 1
        time.sleep(0.5)  # rate limit protection
    return all_issues


def fetch_states(project_id: str) -> dict:
    """Fetch states → {id: {name, group}}."""
    data = api_get(f"/projects/{project_id}/states/")
    states = data.get("results", data) if isinstance(data, dict) else data
    return {s["id"]: {"name": s["name"], "group": s.get("group", "")} for s in states}


def fetch_labels(project_id: str) -> dict:
    """Fetch labels → {id: name}."""
    data = api_get(f"/projects/{project_id}/labels/")
    labels = data.get("results", data) if isinstance(data, dict) else data
    return {l["id"]: l["name"].lower() for l in labels}


def analyze_project(proj_key: str, proj: dict) -> dict:
    """Analyze a single project for risks."""
    project_id = proj["id"]
    prefix = proj["prefix"]

    issues = fetch_issues(project_id)
    states = fetch_states(project_id)
    labels = fetch_labels(project_id)

    today = datetime.now().strftime("%Y-%m-%d")
    today_dt = datetime.now()

    overdue = []
    at_risk = []  # due within 3 days, not started
    critical_path = []
    milestones_upcoming = []

    for issue in issues:
        state = states.get(issue.get("state", ""), {})
        state_group = state.get("group", "")
        state_name = state.get("name", "Unknown")
        target = issue.get("target_date")
        name = issue.get("name", "")
        seq = issue.get("sequence_id", 0)

        # Skip completed/cancelled
        if state_group in ("completed", "cancelled"):
            continue

        # Label detection
        issue_labels = [labels.get(lid, "") for lid in issue.get("labels", [])]
        is_milestone = "milestone" in issue_labels
        is_goal = "goal" in issue_labels

        # Check critical path (Bistro only)
        is_critical = False
        if proj_key == "bistro":
            name_lower = name.lower()
            is_critical = any(kw in name_lower for kw in CRITICAL_PATH_KEYWORDS)

        if not target:
            continue

        target_dt = datetime.strptime(target, "%Y-%m-%d")
        days_until = (target_dt - today_dt).days

        issue_info = {
            "seq": seq,
            "id": f"{prefix}-{seq}",
            "name": name,
            "target_date": target,
            "state": state_name,
            "days_until": days_until,
            "is_milestone": is_milestone,
            "is_goal": is_goal,
            "is_critical": is_critical,
        }

        # Overdue
        if target < today:
            issue_info["days_overdue"] = abs(days_until)
            overdue.append(issue_info)

        # At risk: due within 3 days, not started
        elif days_until <= 3 and state_group in ("unstarted", "backlog"):
            at_risk.append(issue_info)

        # Critical path item
        if is_critical:
            critical_path.append(issue_info)

        # Upcoming milestones (within 14 days)
        if is_milestone and 0 <= days_until <= 14:
            milestones_upcoming.append(issue_info)

    # Sort by urgency
    overdue.sort(key=lambda x: x.get("days_overdue", 0), reverse=True)
    at_risk.sort(key=lambda x: x["days_until"])

    total = len(issues)
    done = sum(1 for i in issues if states.get(i.get("state", ""), {}).get("group") == "completed")
    progress = round((done / total * 100)) if total > 0 else 0

    return {
        "project": proj["name"],
        "prefix": prefix,
        "total": total,
        "done": done,
        "progress": progress,
        "overdue_count": len(overdue),
        "overdue": overdue[:10],  # top 10
        "at_risk_count": len(at_risk),
        "at_risk": at_risk[:5],
        "critical_path": critical_path,
        "milestones_upcoming": milestones_upcoming,
    }


def determine_severity(reports: list[dict]) -> str:
    """Determine overall severity."""
    total_overdue = sum(r["overdue_count"] for r in reports)
    has_critical_overdue = any(
        issue.get("is_critical") or issue.get("is_milestone")
        for r in reports
        for issue in r.get("overdue", [])
    )

    if has_critical_overdue or total_overdue > 10:
        return "CRITICAL"
    elif total_overdue > 5:
        return "WARNING"
    elif total_overdue > 0:
        return "INFO"
    return "OK"


def send_webhook(severity: str, summary: str, details: str):
    """Send alert via webhook (Slack/Discord compatible)."""
    if not ALERT_WEBHOOK_URL:
        return

    color_map = {
        "CRITICAL": "#dc2626",
        "WARNING": "#f59e0b",
        "INFO": "#3b82f6",
        "OK": "#10b981",
    }

    # Slack-compatible payload
    payload = {
        "text": f"[{severity}] Krasovská Risk Monitor: {summary}",
        "attachments": [
            {
                "color": color_map.get(severity, "#6b7280"),
                "title": f"Risk Report — {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                "text": details,
                "footer": "Krasovská Risk Monitor",
            }
        ],
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        ALERT_WEBHOOK_URL,
        data=data,
        headers={"Content-Type": "application/json"},
    )
    try:
        urllib.request.urlopen(req, timeout=10)
        log(f"Webhook sent: {severity}")
    except Exception as e:
        log(f"Webhook failed: {e}")


def run_check(output_json: bool = False) -> dict:
    """Run full risk check across all projects."""
    log("Starting risk check...")

    reports = []
    for proj_key, proj in PROJECTS.items():
        try:
            report = analyze_project(proj_key, proj)
            reports.append(report)
            log(f"  {proj['name']}: {report['overdue_count']} overdue, {report['progress']}% done")
            time.sleep(1.5)  # rate limit between projects
        except Exception as e:
            log(f"  ERROR analyzing {proj['name']}: {e}")

    severity = determine_severity(reports)
    total_overdue = sum(r["overdue_count"] for r in reports)
    total_at_risk = sum(r["at_risk_count"] for r in reports)

    summary = f"{total_overdue} zpožděných, {total_at_risk} ohrožených úkolů"

    # Build human-readable details
    details_lines = []
    for r in reports:
        status_icon = "✅" if r["overdue_count"] == 0 else "🔴" if r["overdue_count"] > 3 else "🟡"
        details_lines.append(
            f"{status_icon} {r['project']}: {r['progress']}% done, "
            f"{r['overdue_count']} overdue, {r['at_risk_count']} at-risk"
        )
        for issue in r.get("overdue", [])[:3]:
            marker = " ⚠️" if issue.get("is_critical") else ""
            details_lines.append(
                f"  ↳ {issue['id']}: {issue['name']} "
                f"({issue.get('days_overdue', '?')}d overdue){marker}"
            )

    details = "\n".join(details_lines)

    result = {
        "timestamp": datetime.now().isoformat(),
        "severity": severity,
        "summary": summary,
        "total_overdue": total_overdue,
        "total_at_risk": total_at_risk,
        "projects": reports,
    }

    log(f"Risk check complete: [{severity}] {summary}")

    # Send webhook for WARNING and CRITICAL
    if severity in ("WARNING", "CRITICAL"):
        send_webhook(severity, summary, details)

    if output_json:
        print(json.dumps(result, indent=2, ensure_ascii=False))

    return result


def daemon_mode():
    """Run as daemon with periodic checks."""
    log(f"Risk Monitor daemon starting (interval: {CHECK_INTERVAL}s)")
    sd_notify("READY=1")

    while True:
        try:
            run_check()
            sd_notify("WATCHDOG=1")
        except Exception as e:
            log(f"Check cycle failed: {e}")

        time.sleep(CHECK_INTERVAL)


def main():
    args = sys.argv[1:]

    if "--daemon" in args:
        daemon_mode()
    elif "--json" in args:
        run_check(output_json=True)
    else:
        result = run_check()
        # Print human-readable summary
        print(f"\n{'='*50}")
        print(f"RISK MONITOR — {result['severity']}")
        print(f"{'='*50}")
        print(f"Datum: {result['timestamp'][:10]}")
        print(f"Zpožděné: {result['total_overdue']}")
        print(f"Ohrožené: {result['total_at_risk']}")
        print()
        for proj in result["projects"]:
            icon = "✅" if proj["overdue_count"] == 0 else "🔴"
            print(f"{icon} {proj['project']} ({proj['prefix']})")
            print(f"  Progres: {proj['done']}/{proj['total']} ({proj['progress']}%)")
            print(f"  Zpožděné: {proj['overdue_count']}, Ohrožené: {proj['at_risk_count']}")
            if proj["overdue"]:
                print("  Zpožděné úkoly:")
                for issue in proj["overdue"][:5]:
                    crit = " [KRITICKÁ CESTA]" if issue.get("is_critical") else ""
                    ms = " [MILNÍK]" if issue.get("is_milestone") else ""
                    print(f"    - {issue['id']}: {issue['name']} ({issue.get('days_overdue', '?')}d){crit}{ms}")
            if proj["critical_path"]:
                print("  Kritická cesta:")
                for cp in proj["critical_path"]:
                    status = "⏳" if cp["days_until"] > 0 else "🔴"
                    print(f"    {status} {cp['id']}: {cp['name']} (za {cp['days_until']}d)")
            print()


if __name__ == "__main__":
    main()
