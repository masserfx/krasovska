#!/usr/bin/env python3
"""
Generuje denní poznámku do Obsidian vaultu z Vercel daily-digest API.

Spouští se přes launchd každý den v 6:30.
Zapisuje do vault/01-daily/YYYY-MM-DD.md.

Usage:
    python3 daily_note.py              # vytvoří dnešní poznámku
    python3 daily_note.py 2026-03-01   # pro konkrétní datum
"""

import json
import os
import sys
import urllib.request
from datetime import datetime

DIGEST_URL = os.environ.get(
    "DIGEST_URL",
    "https://hala-krasovska.vercel.app/api/cron/daily-digest",
)
CRON_SECRET = os.environ.get("CRON_SECRET", "")

VAULT_PATH = os.path.expanduser(
    "~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Krasovska"
)
DAILY_DIR = os.path.join(VAULT_PATH, "01-daily")

WEEKDAYS_CZ = {
    0: "pondělí",
    1: "úterý",
    2: "středa",
    3: "čtvrtek",
    4: "pátek",
    5: "sobota",
    6: "neděle",
}


def fetch_digest() -> dict:
    """Fetch daily digest from Vercel API."""
    req = urllib.request.Request(
        DIGEST_URL,
        headers={"Authorization": f"Bearer {CRON_SECRET}"},
    )
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())


def count_inbox() -> tuple[int, list[str]]:
    """Count files in 00-inbox/."""
    inbox_dir = os.path.join(VAULT_PATH, "00-inbox")
    if not os.path.isdir(inbox_dir):
        return 0, []
    files = [f for f in os.listdir(inbox_dir) if f.endswith(".md")]
    return len(files), files


def format_note(digest: dict, date_str: str) -> str:
    """Format digest data as Obsidian daily note."""
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    weekday = WEEKDAYS_CZ[dt.weekday()]

    lines = [
        "---",
        f"date: {date_str}",
        "type: daily",
        "---",
        "",
        f"# {date_str} — {weekday}",
        "",
        "## Priorita dne",
        "- [ ] ...",
        "",
    ]

    # Overall summary
    s = digest.get("summary", {})
    lines.append(f"## Přehled ({s.get('overallProgress', '?')}% celkový progres)")
    lines.append("")
    lines.append(f"| Metrika | Hodnota |")
    lines.append(f"|---------|---------|")
    lines.append(f"| Projekty | {s.get('totalProjects', '?')} |")
    lines.append(f"| Aktivní úkoly | {s.get('totalActive', 0)} |")
    lines.append(f"| Zpožděné | {s.get('totalOverdue', 0)} |")
    lines.append(f"| Blížící se milníky | {s.get('upcomingMilestones', 0)} |")
    lines.append("")

    # Per-project sections
    for proj in digest.get("projects", []):
        name = proj.get("name", "?")
        prefix = proj.get("prefix", "?")
        progress = proj.get("progress", 0)
        done = proj.get("done", 0)
        total = proj.get("total", 0)

        lines.append(f"## {name} ({prefix}) — {done}/{total} ({progress}%)")
        lines.append("")

        # Overdue
        overdue = proj.get("overdue", [])
        if overdue:
            lines.append("### Po termínu")
            lines.append("")
            for item in overdue:
                lines.append(
                    f"- ❗ **{prefix}-{item['seq']}**: {item['name']} "
                    f"({item.get('daysOverdue', '?')}d po termínu, deadline {item['targetDate']})"
                )
            lines.append("")

        # Active
        active = proj.get("todayActive", [])
        if active:
            lines.append("### Aktivní úkoly")
            lines.append("")
            for item in active:
                type_icon = "⭐" if item.get("type") == "milestone" else "🎯" if item.get("type") == "goal" else "📋"
                lines.append(
                    f"- {type_icon} **{prefix}-{item['seq']}**: {item['name']} "
                    f"(do {item['targetDate']})"
                )
            lines.append("")

        # Milestones
        milestones = proj.get("upcomingMilestones", [])
        if milestones:
            lines.append("### Blížící se milníky")
            lines.append("")
            for m in milestones:
                lines.append(
                    f"- ⭐ **{m['name']}** — {m['targetDate']} "
                    f"(za {m['daysUntil']}d, stav: {m['state']})"
                )
            lines.append("")

        if not overdue and not active and not milestones:
            lines.append("*Žádné aktivní úkoly v nejbližších 14 dnech.*")
            lines.append("")

    # Inbox
    inbox_count, inbox_files = count_inbox()
    lines.append(f"## Inbox ({inbox_count})")
    lines.append("")
    if inbox_files:
        for f in sorted(inbox_files):
            lines.append(f"- [[00-inbox/{f[:-3]}]]")
    else:
        lines.append("*Prázdný*")
    lines.append("")

    # Notes
    lines.append("## Poznámky")
    lines.append("- ")
    lines.append("")

    return "\n".join(lines)


def main():
    # Determine date
    if len(sys.argv) > 1:
        date_str = sys.argv[1]
    else:
        date_str = datetime.now().strftime("%Y-%m-%d")

    # Ensure daily dir exists
    os.makedirs(DAILY_DIR, exist_ok=True)

    note_path = os.path.join(DAILY_DIR, f"{date_str}.md")

    # Don't overwrite existing notes
    if os.path.exists(note_path):
        print(f"Note already exists: {note_path}")
        return

    # Fetch digest
    try:
        digest = fetch_digest()
    except Exception as e:
        print(f"Failed to fetch digest: {e}")
        # Create minimal note without API data
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        weekday = WEEKDAYS_CZ[dt.weekday()]
        inbox_count, _ = count_inbox()
        content = (
            f"---\ndate: {date_str}\ntype: daily\n---\n\n"
            f"# {date_str} — {weekday}\n\n"
            f"## Priorita dne\n- [ ] ...\n\n"
            f"## Poznámky\n- \n\n"
            f"> ⚠️ Digest API nedostupné: {e}\n"
        )
        with open(note_path, "w") as f:
            f.write(content)
        print(f"Created minimal note: {note_path}")
        return

    # Generate and write note
    content = format_note(digest, date_str)
    with open(note_path, "w") as f:
        f.write(content)

    # Summary
    s = digest.get("summary", {})
    print(f"Created: {note_path}")
    print(f"  Projekty: {s.get('totalProjects', '?')}, "
          f"Aktivní: {s.get('totalActive', 0)}, "
          f"Zpožděné: {s.get('totalOverdue', 0)}")


if __name__ == "__main__":
    main()
