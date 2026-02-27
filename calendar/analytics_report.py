#!/usr/bin/env python3
"""
Analytics Reporter — týdenní report do Obsidian vaultu.

Kombinuje data z:
- Vercel daily-digest API (Plane projekty)
- Vercel kpi-check API (KPI Bistra)
- Denní poznámky z Obsidian (01-daily/)

Spouští se přes launchd každé pondělí v 7:00.
Zapisuje do vault/01-daily/YYYY-WXX-review.md.

Usage:
    python3 analytics_report.py              # report za minulý týden
    python3 analytics_report.py 2026-W09     # konkrétní týden
"""

import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timedelta

# --- Config ---

DIGEST_URL = os.environ.get(
    "DIGEST_URL",
    "https://hala-krasovska.vercel.app/api/cron/daily-digest",
)
KPI_URL = os.environ.get(
    "KPI_URL",
    "https://hala-krasovska.vercel.app/api/cron/kpi-check",
)
CRON_SECRET = os.environ.get("CRON_SECRET", "")

VAULT_PATH = os.path.expanduser(
    "~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Krasovska"
)
DAILY_DIR = os.path.join(VAULT_PATH, "01-daily")

WEEKDAYS_CZ = {
    0: "pondělí", 1: "úterý", 2: "středa",
    3: "čtvrtek", 4: "pátek", 5: "sobota", 6: "neděle",
}


def api_get(url: str) -> dict:
    """Fetch JSON from Vercel API with auth."""
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {CRON_SECRET}"},
    )
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())


def get_week_dates(week_str: str) -> tuple[datetime, datetime]:
    """Parse 'YYYY-WXX' → (monday, sunday) datetimes."""
    year, week = week_str.split("-W")
    # ISO week: Monday is day 1
    monday = datetime.strptime(f"{year}-W{week}-1", "%G-W%V-%u")
    sunday = monday + timedelta(days=6)
    return monday, sunday


def read_daily_notes(monday: datetime, sunday: datetime) -> list[dict]:
    """Read daily notes for a given week."""
    notes = []
    current = monday
    while current <= sunday:
        date_str = current.strftime("%Y-%m-%d")
        path = os.path.join(DAILY_DIR, f"{date_str}.md")
        if os.path.exists(path):
            with open(path, "r") as f:
                content = f.read()
            notes.append({
                "date": date_str,
                "weekday": WEEKDAYS_CZ[current.weekday()],
                "content": content,
            })
        current += timedelta(days=1)
    return notes


def extract_completed_tasks(notes: list[dict]) -> list[str]:
    """Extract completed tasks from daily notes (lines with [x])."""
    completed = []
    for note in notes:
        for line in note["content"].split("\n"):
            if "[x]" in line.lower():
                task = re.sub(r"^[\s\-]*\[x\]\s*", "", line, flags=re.IGNORECASE)
                if task.strip():
                    completed.append(f"{note['date']}: {task.strip()}")
    return completed


def extract_notes_summary(notes: list[dict]) -> list[str]:
    """Extract key notes/decisions from daily notes."""
    summaries = []
    for note in notes:
        # Look for ## Shrnutí dne or ## Poznámky sections
        in_section = False
        section_lines = []
        for line in note["content"].split("\n"):
            if line.startswith("## Shrnutí") or line.startswith("## Poznámky"):
                in_section = True
                section_lines = []
                continue
            if in_section and line.startswith("## "):
                in_section = False
                continue
            if in_section and line.strip() and line.strip() != "-":
                section_lines.append(line.strip())

        if section_lines:
            summaries.append({
                "date": note["date"],
                "weekday": note["weekday"],
                "lines": section_lines[:3],
            })
    return summaries


def trend_arrow(actual: float, target: float) -> str:
    """Return trend indicator."""
    if target == 0:
        return "—"
    ratio = actual / target
    if ratio >= 1.0:
        return "↑"
    elif ratio >= 0.85:
        return "→"
    else:
        return "↓"


def format_report(
    week_str: str,
    monday: datetime,
    sunday: datetime,
    digest: dict,
    kpi: dict,
    notes: list[dict],
) -> str:
    """Format the weekly analytics report as Obsidian markdown."""
    today = datetime.now().strftime("%Y-%m-%d")

    completed_tasks = extract_completed_tasks(notes)
    notes_summary = extract_notes_summary(notes)

    lines = [
        "---",
        f"date: {today}",
        "type: weekly-review",
        f"week: {week_str}",
        "---",
        "",
        f"# Týdenní review — {week_str}",
        f"*{monday.strftime('%d.%m.')} – {sunday.strftime('%d.%m.%Y')}*",
        "",
    ]

    # --- Shrnutí týdne ---
    lines.append("## Shrnutí týdne")
    lines.append("")
    if notes:
        lines.append(f"Zaznamenaných pracovních dní: **{len(notes)}**")
        if completed_tasks:
            lines.append(f"Dokončených úkolů: **{len(completed_tasks)}**")
    else:
        lines.append("*Žádné denní poznámky za tento týden.*")

    if notes_summary:
        lines.append("")
        for s in notes_summary:
            lines.append(f"**{s['weekday']} {s['date']}**:")
            for l in s["lines"]:
                lines.append(f"  {l}")
    lines.append("")

    # --- Projekty ---
    lines.append("## Projekty")
    lines.append("")

    summary = digest.get("summary", {})
    lines.append(f"Celkový progres: **{summary.get('overallProgress', '?')}%** "
                 f"| Aktivní: {summary.get('totalActive', 0)} "
                 f"| Zpožděné: {summary.get('totalOverdue', 0)}")
    lines.append("")

    for proj in digest.get("projects", []):
        name = proj.get("name", "?")
        prefix = proj.get("prefix", "?")
        progress = proj.get("progress", 0)
        done = proj.get("done", 0)
        total = proj.get("total", 0)
        overdue = proj.get("overdue", [])
        milestones = proj.get("upcomingMilestones", [])

        lines.append(f"### {name} ({prefix})")
        lines.append("")
        lines.append(f"- **Progres**: {done}/{total} ({progress}%)")

        if overdue:
            lines.append(f"- **Zpožděné** ({len(overdue)}):")
            for item in overdue[:5]:
                lines.append(f"  - ❗ {prefix}-{item['seq']}: {item['name']} "
                             f"({item.get('daysOverdue', '?')}d)")
        else:
            lines.append("- **Zpožděné**: 0")

        if milestones:
            next_ms = milestones[0]
            lines.append(f"- **Další milník**: ⭐ {next_ms['name']} — "
                         f"{next_ms['targetDate']} (za {next_ms['daysUntil']}d)")

        active = proj.get("todayActive", [])
        if active:
            lines.append(f"- **Aktivní úkoly**: {len(active)}")

        lines.append("")

    # --- KPI ---
    lines.append("## KPI Bistro")
    lines.append("")

    kpi_data = kpi.get("kpi")
    kpi_status = kpi.get("overallStatus", "unknown")
    status_icon = {"healthy": "🟢", "warning": "🟡", "critical": "🔴"}.get(kpi_status, "⚪")

    lines.append(f"Stav: {status_icon} **{kpi_status.upper()}** | "
                 f"Měsíc: {kpi.get('monthYear', '?')} ({kpi.get('monthProgress', '?')})")
    lines.append("")

    if kpi_data:
        rev = kpi_data.get("revenue", {})
        cov = kpi_data.get("covers", {})
        ticket = kpi_data.get("avgTicket", {})
        costs = kpi_data.get("costs", {})

        lines.append("| Metrika | Cíl | Aktuální | Trend |")
        lines.append("|---------|-----|----------|-------|")

        # Revenue
        rev_target = rev.get("target")
        rev_actual = rev.get("actual")
        if rev_target is not None:
            rev_t_str = f"{rev_target:,}".replace(",", " ") + " Kč"
            rev_a_str = f"{rev_actual:,}".replace(",", " ") + " Kč" if rev_actual is not None else "—"
            trend = trend_arrow(rev_actual or 0, rev_target) if rev_target > 0 else "—"
            lines.append(f"| Tržby | {rev_t_str} | {rev_a_str} | {trend} |")

        # Covers
        cov_target = cov.get("target")
        cov_actual = cov.get("actual")
        if cov_target is not None:
            cov_a_str = str(cov_actual) if cov_actual is not None else "—"
            trend = trend_arrow(cov_actual or 0, cov_target) if cov_target > 0 else "—"
            lines.append(f"| Hosté | {cov_target} | {cov_a_str} | {trend} |")

        # Avg ticket
        t_target = ticket.get("target")
        t_actual = ticket.get("actual")
        if t_target is not None:
            t_a_str = f"{t_actual} Kč" if t_actual is not None else "—"
            trend = trend_arrow(t_actual or 0, t_target) if t_target > 0 else "—"
            lines.append(f"| Avg. útrata | {t_target} Kč | {t_a_str} | {trend} |")

        # Costs
        fixed = costs.get("fixed")
        variable = costs.get("variable")
        if fixed is not None:
            fixed_str = f"{fixed:,}".replace(",", " ") + " Kč"
            var_str = f"{variable:,}".replace(",", " ") + " Kč" if variable is not None else "—"
            lines.append(f"| Fix. náklady | {fixed_str} | — | — |")
            lines.append(f"| Var. náklady | — | {var_str} | — |")

        lines.append("")
    else:
        lines.append("*KPI data nejsou k dispozici pro tento měsíc.*")
        lines.append("")

    # --- Alerts ---
    alerts = kpi.get("alerts", [])
    if alerts:
        lines.append("## Rizika a alerty")
        lines.append("")
        for alert in alerts:
            sev_icon = {"critical": "🔴", "warning": "🟡", "info": "ℹ️"}.get(alert["severity"], "⚪")
            lines.append(f"- {sev_icon} **{alert['severity'].upper()}**: {alert['message']}")
        lines.append("")

    # --- Project health ---
    project_health = kpi.get("projects", [])
    behind = [p for p in project_health if p.get("status") == "behind"]
    at_risk = [p for p in project_health if p.get("status") == "at-risk"]

    if behind or at_risk:
        lines.append("## Zdraví projektů")
        lines.append("")
        lines.append("| Projekt | Progres | Zpožděné | Status |")
        lines.append("|---------|---------|----------|--------|")
        for p in project_health:
            icon = {"on-track": "🟢", "at-risk": "🟡", "behind": "🔴"}.get(p["status"], "⚪")
            lines.append(f"| {p['name']} | {p['progress']}% | {p['overdueCount']} | {icon} {p['status']} |")
        lines.append("")

    # --- Completed this week ---
    if completed_tasks:
        lines.append("## Dokončeno tento týden")
        lines.append("")
        for task in completed_tasks[:15]:
            lines.append(f"- ✅ {task}")
        if len(completed_tasks) > 15:
            lines.append(f"- ... a dalších {len(completed_tasks) - 15}")
        lines.append("")

    # --- Plan pro další týden ---
    lines.append("## Plán na další týden")
    lines.append("")

    # Show upcoming tasks from digest, sorted by date
    all_upcoming = []
    for proj in digest.get("projects", []):
        prefix = proj.get("prefix", "?")
        for item in proj.get("todayActive", []):
            all_upcoming.append({
                "prefix": prefix,
                "seq": item["seq"],
                "name": item["name"],
                "date": item["targetDate"],
                "type": item.get("type", "task"),
            })

    # Filter to next week
    next_monday = monday + timedelta(days=7)
    next_sunday = next_monday + timedelta(days=6)
    next_week = [
        t for t in all_upcoming
        if next_monday.strftime("%Y-%m-%d") <= t["date"] <= next_sunday.strftime("%Y-%m-%d")
    ]
    next_week.sort(key=lambda x: x["date"])

    if next_week:
        for t in next_week[:10]:
            type_icon = "⭐" if t["type"] == "milestone" else "🎯" if t["type"] == "goal" else "📋"
            lines.append(f"- [ ] {type_icon} **{t['prefix']}-{t['seq']}**: {t['name']} (do {t['date']})")
    else:
        lines.append("- [ ] ...")
    lines.append("")

    # --- Rozhodnutí ---
    lines.append("## Rozhodnutí k řešení")
    lines.append("- ")
    lines.append("")

    return "\n".join(lines)


def main():
    # Determine week
    if len(sys.argv) > 1:
        week_str = sys.argv[1]
    else:
        # Default: previous week
        last_monday = datetime.now() - timedelta(days=datetime.now().weekday() + 7)
        week_str = last_monday.strftime("%G-W%V")

    monday, sunday = get_week_dates(week_str)
    report_path = os.path.join(DAILY_DIR, f"{week_str}-review.md")

    # Don't overwrite
    if os.path.exists(report_path):
        print(f"Report already exists: {report_path}")
        return

    os.makedirs(DAILY_DIR, exist_ok=True)

    # Fetch data from APIs
    digest = None
    kpi = None

    try:
        digest = api_get(DIGEST_URL)
    except Exception as e:
        print(f"[WARN] Digest API failed: {e}")
        digest = {"summary": {}, "projects": []}

    try:
        kpi = api_get(KPI_URL)
    except Exception as e:
        print(f"[WARN] KPI API failed: {e}")
        kpi = {"overallStatus": "unknown", "alerts": [], "projects": []}

    # Read daily notes for the week
    notes = read_daily_notes(monday, sunday)

    # Generate report
    content = format_report(week_str, monday, sunday, digest, kpi, notes)

    with open(report_path, "w") as f:
        f.write(content)

    # Summary
    s = digest.get("summary", {})
    print(f"Created: {report_path}")
    print(f"  Týden: {week_str} ({monday.strftime('%d.%m.')} – {sunday.strftime('%d.%m.')})")
    print(f"  Denní poznámky: {len(notes)}")
    print(f"  Progres: {s.get('overallProgress', '?')}%")
    print(f"  KPI status: {kpi.get('overallStatus', '?')}")


if __name__ == "__main__":
    main()
