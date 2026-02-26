import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { ensureTable } from "@/lib/db";
import {
  fetchPlaneProjects,
  fetchProjectStats,
} from "@/lib/plane-api";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const CRON_SECRET = process.env.CRON_SECRET;

interface KpiRow {
  month_year: string;
  revenue_target: number | null;
  revenue_actual: number | null;
  covers_target: number | null;
  covers_actual: number | null;
  avg_ticket_target: number | null;
  avg_ticket_actual: number | null;
  fixed_costs: number | null;
  variable_costs_actual: number | null;
}

interface KpiAlert {
  metric: string;
  severity: "critical" | "warning" | "info";
  message: string;
  target: number | null;
  actual: number | null;
  percentOfTarget: number | null;
}

interface ProjectHealth {
  name: string;
  prefix: string;
  progress: number;
  overdueCount: number;
  status: "on-track" | "at-risk" | "behind";
}

export async function GET(request: NextRequest) {
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
    await ensureTable();

    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();
    const monthProgress = Math.round((dayOfMonth / daysInMonth) * 100);

    // Fetch KPIs for current month
    const { rows } = await sql`
      SELECT * FROM bistro_kpis WHERE month_year = ${currentMonthYear}
    `;
    const kpi: KpiRow | null = rows.length > 0 ? (rows[0] as KpiRow) : null;

    // Generate alerts
    const alerts: KpiAlert[] = [];

    if (kpi) {
      // Revenue check
      if (kpi.revenue_target && kpi.revenue_actual !== null) {
        const expectedRevenue = (kpi.revenue_target * monthProgress) / 100;
        const revenuePercent = Math.round(
          (kpi.revenue_actual / expectedRevenue) * 100
        );

        if (revenuePercent < 70) {
          alerts.push({
            metric: "revenue",
            severity: "critical",
            message: `Tržby na ${revenuePercent}% očekávání (${kpi.revenue_actual.toLocaleString("cs")} / ${Math.round(expectedRevenue).toLocaleString("cs")} Kč)`,
            target: Math.round(expectedRevenue),
            actual: kpi.revenue_actual,
            percentOfTarget: revenuePercent,
          });
        } else if (revenuePercent < 90) {
          alerts.push({
            metric: "revenue",
            severity: "warning",
            message: `Tržby mírně pod plánem: ${revenuePercent}% očekávání`,
            target: Math.round(expectedRevenue),
            actual: kpi.revenue_actual,
            percentOfTarget: revenuePercent,
          });
        }
      }

      // Covers check
      if (kpi.covers_target && kpi.covers_actual !== null) {
        const expectedCovers = (kpi.covers_target * monthProgress) / 100;
        const coversPercent = Math.round(
          (kpi.covers_actual / expectedCovers) * 100
        );

        if (coversPercent < 70) {
          alerts.push({
            metric: "covers",
            severity: "critical",
            message: `Počet hostů na ${coversPercent}% očekávání (${kpi.covers_actual} / ${Math.round(expectedCovers)})`,
            target: Math.round(expectedCovers),
            actual: kpi.covers_actual,
            percentOfTarget: coversPercent,
          });
        } else if (coversPercent < 85) {
          alerts.push({
            metric: "covers",
            severity: "warning",
            message: `Počet hostů pod plánem: ${coversPercent}% očekávání`,
            target: Math.round(expectedCovers),
            actual: kpi.covers_actual,
            percentOfTarget: coversPercent,
          });
        }
      }

      // Average ticket check
      if (kpi.avg_ticket_target && kpi.avg_ticket_actual !== null) {
        const ticketPercent = Math.round(
          (kpi.avg_ticket_actual / kpi.avg_ticket_target) * 100
        );

        if (ticketPercent < 80) {
          alerts.push({
            metric: "avg_ticket",
            severity: "warning",
            message: `Průměrná útrata ${kpi.avg_ticket_actual} Kč vs. cíl ${kpi.avg_ticket_target} Kč (${ticketPercent}%)`,
            target: kpi.avg_ticket_target,
            actual: kpi.avg_ticket_actual,
            percentOfTarget: ticketPercent,
          });
        }
      }

      // Cost overshoot check
      if (kpi.fixed_costs && kpi.variable_costs_actual !== null) {
        const totalCosts = kpi.fixed_costs + kpi.variable_costs_actual;
        const revenue = kpi.revenue_actual || 0;
        if (revenue > 0 && totalCosts > revenue) {
          alerts.push({
            metric: "profitability",
            severity: "critical",
            message: `Náklady (${totalCosts.toLocaleString("cs")} Kč) převyšují tržby (${revenue.toLocaleString("cs")} Kč)`,
            target: revenue,
            actual: totalCosts,
            percentOfTarget: Math.round((totalCosts / revenue) * 100),
          });
        }
      }
    }

    // Project health from Plane
    const allProjects = await fetchPlaneProjects();
    const projectStats = await Promise.all(
      allProjects.map((p) => fetchProjectStats(p))
    );

    const today = now.toISOString().slice(0, 10);
    const projectHealth: ProjectHealth[] = projectStats.map((stats) => {
      const overdueCount = stats.upcoming.filter(
        (u) => u.targetDate < today && u.stateGroup !== "completed"
      ).length;

      let status: ProjectHealth["status"] = "on-track";
      if (overdueCount > 5 || stats.progress < 10) {
        status = "behind";
      } else if (overdueCount > 2) {
        status = "at-risk";
      }

      return {
        name: stats.name,
        prefix: stats.prefix,
        progress: stats.progress,
        overdueCount,
        status,
      };
    });

    // Add project-level alerts
    for (const ph of projectHealth) {
      if (ph.status === "behind") {
        alerts.push({
          metric: `project_${ph.prefix.toLowerCase()}`,
          severity: "critical",
          message: `Projekt ${ph.name}: ${ph.overdueCount} zpožděných úkolů, progres ${ph.progress}%`,
          target: null,
          actual: null,
          percentOfTarget: null,
        });
      } else if (ph.status === "at-risk") {
        alerts.push({
          metric: `project_${ph.prefix.toLowerCase()}`,
          severity: "warning",
          message: `Projekt ${ph.name}: ${ph.overdueCount} zpožděných úkolů`,
          target: null,
          actual: null,
          percentOfTarget: null,
        });
      }
    }

    const overallStatus: "healthy" | "warning" | "critical" = alerts.some(
      (a) => a.severity === "critical"
    )
      ? "critical"
      : alerts.some((a) => a.severity === "warning")
        ? "warning"
        : "healthy";

    const result = {
      date: today,
      monthYear: currentMonthYear,
      monthProgress: `${monthProgress}%`,
      overallStatus,
      alerts,
      kpi: kpi
        ? {
            revenue: {
              target: kpi.revenue_target,
              actual: kpi.revenue_actual,
            },
            covers: {
              target: kpi.covers_target,
              actual: kpi.covers_actual,
            },
            avgTicket: {
              target: kpi.avg_ticket_target,
              actual: kpi.avg_ticket_actual,
            },
            costs: {
              fixed: kpi.fixed_costs,
              variable: kpi.variable_costs_actual,
            },
          }
        : null,
      projects: projectHealth,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[KPI Check]", error);
    return NextResponse.json(
      { error: "Failed to run KPI check" },
      { status: 500 }
    );
  }
}
