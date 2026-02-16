import { Insight } from "@/types";
import PriorityBadge from "./PriorityBadge";

const TYPE_STYLES: Record<Insight["type"], { bg: string; border: string; label: string }> = {
  strength: { bg: "bg-emerald-50", border: "border-l-emerald-500", label: "Silná stránka" },
  weakness: { bg: "bg-red-50", border: "border-l-red-500", label: "Slabá stránka" },
  opportunity: { bg: "bg-blue-50", border: "border-l-blue-500", label: "Příležitost" },
  threat: { bg: "bg-orange-50", border: "border-l-orange-500", label: "Hrozba" },
  info: { bg: "bg-gray-50", border: "border-l-gray-400", label: "Informace" },
};

export default function InsightsList({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-foreground">Postřehy</h2>
        <p className="text-sm text-muted">Zatím žádné postřehy</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-foreground">Postřehy</h2>
      <ul className="space-y-3">
        {insights.map((insight) => {
          const style = TYPE_STYLES[insight.type];
          return (
            <li
              key={insight.id}
              className={`rounded-lg border-l-4 ${style.border} ${style.bg} p-4`}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-medium text-muted">{style.label}</span>
                <PriorityBadge priority={insight.priority} />
              </div>
              <p className="text-sm font-medium text-foreground">{insight.title}</p>
              <p className="mt-1 text-sm text-muted">{insight.description}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
