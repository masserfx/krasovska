import { NextRequest, NextResponse } from "next/server";
import {
  fetchPlaneProjects,
  fetchProjectStats,
  type ProjectStats,
} from "@/lib/plane-api";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const CRON_SECRET = process.env.CRON_SECRET;

interface DigestProject {
  name: string;
  prefix: string;
  progress: number;
  done: number;
  total: number;
  overdue: OverdueIssue[];
  todayActive: ActiveIssue[];
  upcomingMilestones: MilestoneInfo[];
}

interface OverdueIssue {
  seq: number;
  name: string;
  targetDate: string;
  daysOverdue: number;
}

interface ActiveIssue {
  seq: number;
  name: string;
  targetDate: string;
  type: string;
}

interface MilestoneInfo {
  seq: number;
  name: string;
  targetDate: string;
  daysUntil: number;
  state: string;
}

function computeDigest(stats: ProjectStats): DigestProject {
  const today = new Date().toISOString().slice(0, 10);
  const todayMs = Date.now();

  const overdue: OverdueIssue[] = [];
  const todayActive: ActiveIssue[] = [];

  for (const item of stats.upcoming) {
    if (item.targetDate < today && item.stateGroup !== "completed") {
      const daysOverdue = Math.floor(
        (todayMs - new Date(item.targetDate).getTime()) / 86400000
      );
      overdue.push({
        seq: item.seq,
        name: item.name,
        targetDate: item.targetDate,
        daysOverdue,
      });
    }
  }

  // Active: target_date >= today, within upcoming
  for (const item of stats.upcoming) {
    if (item.targetDate >= today) {
      todayActive.push({
        seq: item.seq,
        name: item.name,
        targetDate: item.targetDate,
        type: item.type,
      });
    }
  }

  // Milestones within next 14 days
  const upcomingMilestones: MilestoneInfo[] = stats.milestones
    .filter(
      (m) => m.targetDate && m.targetDate >= today && m.state !== "Done"
    )
    .map((m) => ({
      seq: m.seq,
      name: m.name,
      targetDate: m.targetDate!,
      daysUntil: Math.ceil(
        (new Date(m.targetDate!).getTime() - todayMs) / 86400000
      ),
      state: m.state,
    }))
    .filter((m) => m.daysUntil <= 14)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return {
    name: stats.name,
    prefix: stats.prefix,
    progress: stats.progress,
    done: stats.done,
    total: stats.total,
    overdue,
    todayActive,
    upcomingMilestones,
  };
}

export async function GET(request: NextRequest) {
  // Auth: Vercel Cron sends CRON_SECRET, or allow manual trigger with secret
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (CRON_SECRET) {
    const providedSecret = authHeader?.replace("Bearer ", "") || token;
    if (providedSecret !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const allProjects = await fetchPlaneProjects();
    const projectStats = await Promise.all(
      allProjects.map((p) => fetchProjectStats(p))
    );

    const today = new Date().toISOString().slice(0, 10);
    const dayOfWeek = new Date().toLocaleDateString("cs-CZ", {
      weekday: "long",
    });

    const digests = projectStats.map(computeDigest);

    const totalOverdue = digests.reduce(
      (sum, d) => sum + d.overdue.length,
      0
    );
    const totalActive = digests.reduce(
      (sum, d) => sum + d.todayActive.length,
      0
    );
    const totalMilestones = digests.reduce(
      (sum, d) => sum + d.upcomingMilestones.length,
      0
    );

    const digest = {
      date: today,
      dayOfWeek,
      summary: {
        totalProjects: digests.length,
        totalOverdue,
        totalActive,
        upcomingMilestones: totalMilestones,
        overallProgress: Math.round(
          digests.reduce((sum, d) => sum + d.progress, 0) / digests.length
        ),
      },
      projects: digests,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(digest);
  } catch (error) {
    console.error("[Daily Digest]", error);
    return NextResponse.json(
      { error: "Failed to generate daily digest" },
      { status: 500 }
    );
  }
}
