import { DashboardData } from "@/types";
import { FolderKanban, CheckSquare, CheckCircle2, AlertTriangle } from "lucide-react";

interface DashboardStatsProps {
  stats: DashboardData["stats"];
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      label: "Projekty",
      value: stats.total_projects,
      icon: FolderKanban,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Úkoly",
      value: stats.total_tasks,
      icon: CheckSquare,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Dokončené",
      value: stats.done_tasks,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Po termínu",
      value: stats.overdue_tasks,
      icon: AlertTriangle,
      color: stats.overdue_tasks > 0 ? "text-danger" : "text-muted",
      bg: stats.overdue_tasks > 0 ? "bg-red-50" : "bg-gray-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2.5 ${card.bg}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-sm text-muted">{card.label}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
