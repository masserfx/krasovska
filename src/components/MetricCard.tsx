import { Metric } from "@/types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const TREND_CONFIG = {
  up: { icon: TrendingUp, color: "text-emerald-500" },
  down: { icon: TrendingDown, color: "text-red-500" },
  neutral: { icon: Minus, color: "text-muted" },
};

export default function MetricCard({ metric }: { metric: Metric }) {
  const trend = metric.trend ? TREND_CONFIG[metric.trend] : null;
  const TrendIcon = trend?.icon;

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <p className="mb-1 text-sm text-muted">{metric.label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">{metric.value}</span>
        {metric.unit && (
          <span className="text-sm text-muted">{metric.unit}</span>
        )}
        {TrendIcon && (
          <TrendIcon className={`h-4 w-4 ${trend!.color}`} />
        )}
      </div>
    </div>
  );
}
