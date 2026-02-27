#!/usr/bin/env python3
"""
Social Media Plánovač — generuje frontu postů z Plane milníků a událostí.

Čte z Plane API nadcházející milníky, cíle a klíčové úkoly,
generuje návrhy postů do Obsidian fronty (02-projekty/marketing/social-queue/).

Spouštěno přes launchd každé pondělí v 7:30 (po analytics reportu).

Usage:
    python3 social_planner.py              # naplánuje posty na tento týden
    python3 social_planner.py 2026-W10     # pro konkrétní týden
"""

import json
import os
import sys
import time
import urllib.request
from datetime import datetime, timedelta

# --- Config ---

PLANE_API_KEY = os.environ.get(
    "PLANE_API_KEY", "plane_api_c3b023ea27254bfc8979a6d787dd7e0e"
)
PLANE_BASE = os.environ.get(
    "PLANE_BASE_URL", "http://46.225.31.161/api/v1/workspaces/krasovska"
)

VAULT_PATH = os.path.expanduser(
    "~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Krasovska"
)
QUEUE_DIR = os.path.join(VAULT_PATH, "02-projekty", "marketing", "social-queue")

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
    "salonky": {
        "id": "1addbff0-cc91-4308-9063-262e6ee3fad3",
        "name": "Salonky",
        "prefix": "SAL",
    },
}

# Bistro phases for contextual content
BISTRO_PHASES = [
    {"name": "Quick Start", "start": "2026-02-19", "end": "2026-03-31",
     "tone": "teasing", "theme": "Něco se chystá v Hale Krasovská"},
    {"name": "MVP → Standard", "start": "2026-04-01", "end": "2026-04-30",
     "tone": "launch", "theme": "Otevíráme! Přijďte ochutnat"},
    {"name": "Standard → Full", "start": "2026-05-01", "end": "2026-06-30",
     "tone": "growth", "theme": "Léto v Bistru — zahrádka, lehké menu"},
    {"name": "Full Operace", "start": "2026-07-01", "end": "2026-12-31",
     "tone": "established", "theme": "Vaše místo pro gastronomii v Brně"},
]

HASHTAGS = {
    "base": ["#HalaKrasovska", "#Brno", "#BrnoGastro"],
    "bistro": ["#BistroKrasovska", "#BrnoFood", "#Foodie", "#LokálníSuroviny"],
    "eshop": ["#BrnoSport", "#Sportovci", "#Merch"],
    "salonky": ["#FiremnAkce", "#Konference", "#EventBrno"],
}

POST_TEMPLATES = {
    "milestone": {
        "instagram": (
            "🎯 {headline}\n\n"
            "{body}\n\n"
            "📍 Hala Krasovská, Brno\n"
            "{hashtags}"
        ),
        "facebook": (
            "🎯 {headline}\n\n"
            "{body}\n\n"
            "📍 Hala Krasovská"
        ),
    },
    "teasing": {
        "instagram": (
            "✨ {headline}\n\n"
            "{body}\n\n"
            "Sledujte nás pro další novinky 👀\n"
            "{hashtags}"
        ),
        "facebook": (
            "✨ {headline}\n\n"
            "{body}\n\n"
            "Sledujte nás pro další novinky 👀"
        ),
    },
    "event": {
        "instagram": (
            "📅 {headline}\n\n"
            "{body}\n\n"
            "📍 Hala Krasovská, Brno\n"
            "🔗 Více info v biu\n"
            "{hashtags}"
        ),
        "facebook": (
            "📅 {headline}\n\n"
            "{body}\n\n"
            "📍 Hala Krasovská, Brno\n"
            "👉 Více info: halakrasovska.cz"
        ),
    },
}


def api_get(path: str):
    """GET request to Plane API."""
    url = f"{PLANE_BASE}{path}"
    req = urllib.request.Request(url, headers={"x-api-key": PLANE_API_KEY})
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())


def get_current_phase(date_str: str) -> dict | None:
    """Get current Bistro phase for a date."""
    for phase in BISTRO_PHASES:
        if phase["start"] <= date_str <= phase["end"]:
            return phase
    return None


def fetch_upcoming_events(project: dict, week_start: str, week_end: str) -> list:
    """Fetch milestones and goals due this/next week."""
    events = []
    all_issues = []
    page = 1
    while True:
        data = api_get(f"/projects/{project['id']}/issues/?per_page=100&page={page}")
        all_issues.extend(data.get("results", []))
        if not data.get("next_page_results", False):
            break
        page += 1
        time.sleep(0.5)

    # Fetch labels
    label_data = api_get(f"/projects/{project['id']}/labels/")
    labels_list = label_data.get("results", label_data) if isinstance(label_data, dict) else label_data
    label_map = {l["id"]: l["name"].lower() for l in labels_list}

    # Fetch states
    state_data = api_get(f"/projects/{project['id']}/states/")
    states_list = state_data.get("results", state_data) if isinstance(state_data, dict) else state_data
    state_map = {s["id"]: {"name": s["name"], "group": s.get("group", "")} for s in states_list}

    for issue in all_issues:
        target = issue.get("target_date")
        if not target:
            continue

        state = state_map.get(issue.get("state", ""), {})
        if state.get("group") in ("completed", "cancelled"):
            continue

        # Check if it's a milestone or goal
        issue_labels = [label_map.get(lid, "") for lid in issue.get("labels", [])]
        is_milestone = "milestone" in issue_labels
        is_goal = "goal" in issue_labels

        if not is_milestone and not is_goal:
            continue

        # Within the target window (this week + next week for planning)
        extended_end = (datetime.strptime(week_end, "%Y-%m-%d") + timedelta(days=7)).strftime("%Y-%m-%d")
        if target < week_start or target > extended_end:
            continue

        events.append({
            "project": project["name"],
            "prefix": project["prefix"],
            "seq": issue.get("sequence_id", 0),
            "name": issue.get("name", ""),
            "target_date": target,
            "type": "milestone" if is_milestone else "goal",
            "state": state.get("name", "Unknown"),
        })

    events.sort(key=lambda x: x["target_date"])
    return events


def generate_post_ideas(events: list, phase: dict | None, week_str: str) -> list:
    """Generate social media post ideas from events and phase context."""
    posts = []

    # Phase-based teasing post (if in teasing/launch phase)
    if phase and phase["tone"] in ("teasing", "launch"):
        posts.append({
            "type": "teasing" if phase["tone"] == "teasing" else "event",
            "project": "Bistro",
            "headline": phase["theme"],
            "body": _phase_body(phase),
            "suggested_date": "pondělí",
            "channels": ["instagram", "facebook"],
            "priority": "high",
            "hashtags": HASHTAGS["base"] + HASHTAGS["bistro"],
        })

    # Event-based posts from milestones
    for event in events:
        proj_key = event["prefix"].lower()
        if proj_key == "bis":
            proj_key = "bistro"
        elif proj_key == "esh":
            proj_key = "eshop"
        elif proj_key == "sal":
            proj_key = "salonky"

        posts.append({
            "type": "milestone" if event["type"] == "milestone" else "event",
            "project": event["project"],
            "headline": f"{event['name']}",
            "body": _event_body(event),
            "suggested_date": event["target_date"],
            "channels": ["instagram", "facebook"],
            "priority": "high" if event["type"] == "milestone" else "medium",
            "hashtags": HASHTAGS["base"] + HASHTAGS.get(proj_key, []),
            "source": f"{event['prefix']}-{event['seq']}",
        })

    return posts


def _phase_body(phase: dict) -> str:
    """Generate body text for phase-based post."""
    bodies = {
        "teasing": (
            "V Hale Krasovská se chystá něco nového. "
            "Moderní bistro s lokálními surovinami a unikátním prostorem. "
            "Brzy vám prozradíme více..."
        ),
        "launch": (
            "Je to tady! Bistro Hala Krasovská otevírá své dveře. "
            "Přijďte ochutnat moderní českou kuchyni v industriálním prostoru. "
            "Těšíme se na vás!"
        ),
        "growth": (
            "Léto v Bistru Krasovská — lehké menu, čerstvé suroviny, "
            "skvělá atmosféra. Zastavte se na oběd nebo večeři."
        ),
        "established": (
            "Vaše oblíbené místo pro gastronomii v Brně. "
            "Kvalitní suroviny, profesionální přístup, unikátní prostor."
        ),
    }
    return bodies.get(phase["tone"], "")


def _event_body(event: dict) -> str:
    """Generate body text for event-based post."""
    dt = datetime.strptime(event["target_date"], "%Y-%m-%d")
    date_cz = dt.strftime("%d.%m.%Y")

    if event["type"] == "milestone":
        return (
            f"Důležitý milník projektu {event['project']}: {event['name']}. "
            f"Termín: {date_cz}. "
            f"Sledujte náš postup!"
        )
    else:
        return (
            f"Směřujeme k dalšímu cíli: {event['name']}. "
            f"Plánovaný termín: {date_cz}."
        )


def format_queue_note(posts: list, week_str: str) -> str:
    """Format posts as Obsidian markdown queue."""
    today = datetime.now().strftime("%Y-%m-%d")

    lines = [
        "---",
        f"date: {today}",
        "type: social-queue",
        f"week: {week_str}",
        "---",
        "",
        f"# Social Media Queue — {week_str}",
        "",
        f"Vygenerováno: {today}",
        f"Počet návrhů: {len(posts)}",
        "",
    ]

    for i, post in enumerate(posts, 1):
        priority_icon = "🔴" if post["priority"] == "high" else "🟡"
        channels = ", ".join(post["channels"])

        lines.append(f"## {i}. {post['headline']}")
        lines.append("")
        lines.append(f"- **Typ**: {post['type']} | **Priorita**: {priority_icon} {post['priority']}")
        lines.append(f"- **Projekt**: {post['project']}")
        lines.append(f"- **Kanály**: {channels}")
        lines.append(f"- **Navržené datum**: {post['suggested_date']}")
        if post.get("source"):
            lines.append(f"- **Zdroj**: {post['source']}")
        lines.append(f"- **Status**: [ ] Ke schválení")
        lines.append("")

        # Generate actual post text for each channel
        template_type = post["type"]
        if template_type not in POST_TEMPLATES:
            template_type = "event"

        for channel in post["channels"]:
            template = POST_TEMPLATES.get(template_type, {}).get(channel)
            if template:
                hashtags_str = " ".join(post.get("hashtags", []))
                text = template.format(
                    headline=post["headline"],
                    body=post["body"],
                    hashtags=hashtags_str,
                )
                lines.append(f"### {channel.capitalize()}")
                lines.append("```")
                lines.append(text)
                lines.append("```")
                lines.append("")

        lines.append("---")
        lines.append("")

    if not posts:
        lines.append("*Žádné milníky ani cíle tento týden — zvažte evergreen obsah.*")
        lines.append("")
        lines.append("### Návrhy evergreen obsahu")
        lines.append("- [ ] Behind the scenes — přípravy Bistra")
        lines.append("- [ ] Představení týmu")
        lines.append("- [ ] Lokální dodavatelé — příběhy")
        lines.append("- [ ] Architektura a design Haly")
        lines.append("")

    return "\n".join(lines)


def main():
    # Determine week
    if len(sys.argv) > 1:
        week_str = sys.argv[1]
    else:
        # Current week
        now = datetime.now()
        week_str = now.strftime("%G-W%V")

    # Parse week dates
    year, week = week_str.split("-W")
    monday = datetime.strptime(f"{year}-W{week}-1", "%G-W%V-%u")
    sunday = monday + timedelta(days=6)
    week_start = monday.strftime("%Y-%m-%d")
    week_end = sunday.strftime("%Y-%m-%d")

    # Ensure queue dir exists
    os.makedirs(QUEUE_DIR, exist_ok=True)

    queue_path = os.path.join(QUEUE_DIR, f"{week_str}.md")

    if os.path.exists(queue_path):
        print(f"Queue already exists: {queue_path}")
        return

    # Get current Bistro phase
    today = datetime.now().strftime("%Y-%m-%d")
    phase = get_current_phase(today)
    if phase:
        print(f"Bistro phase: {phase['name']} ({phase['tone']})")

    # Fetch events from all projects
    all_events = []
    for proj_key, proj in PROJECTS.items():
        try:
            events = fetch_upcoming_events(proj, week_start, week_end)
            all_events.extend(events)
            print(f"  {proj['name']}: {len(events)} events")
            time.sleep(1.5)  # rate limit
        except Exception as e:
            print(f"  ERROR {proj['name']}: {e}")

    # Generate post ideas
    posts = generate_post_ideas(all_events, phase, week_str)

    # Write queue
    content = format_queue_note(posts, week_str)
    with open(queue_path, "w") as f:
        f.write(content)

    print(f"\nCreated: {queue_path}")
    print(f"  Posts: {len(posts)}")


if __name__ == "__main__":
    main()
