import { Insight } from "@/types";
import PriorityBadge from "./PriorityBadge";

const TYPE_BORDER: Record<Insight["type"], string> = {
  strength: "border-l-emerald-500",
  weakness: "border-l-red-500",
  opportunity: "border-l-blue-500",
  threat: "border-l-orange-500",
  info: "border-l-gray-400",
};

const TYPE_LABEL: Record<Insight["type"], string> = {
  strength: "Silná stránka",
  weakness: "Slabá stránka",
  opportunity: "Příležitost",
  threat: "Hrozba",
  info: "Informace",
};

export default function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div className={`rounded-xl border border-border border-l-4 ${TYPE_BORDER[insight.type]} bg-white p-5 shadow-sm`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-medium text-muted">
          {TYPE_LABEL[insight.type]}
        </span>
        <PriorityBadge priority={insight.priority} />
      </div>
      <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
      <p className="mt-1 text-sm text-muted">{insight.description}</p>
    </div>
  );
}
