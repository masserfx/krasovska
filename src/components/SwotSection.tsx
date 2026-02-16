import { AnalysisResult } from "@/types";

const QUADRANTS = [
  { key: "strengths", label: "Silné stránky", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", dot: "bg-emerald-500" },
  { key: "weaknesses", label: "Slabé stránky", bg: "bg-red-50", border: "border-red-200", text: "text-red-800", dot: "bg-red-500" },
  { key: "opportunities", label: "Příležitosti", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", dot: "bg-blue-500" },
  { key: "threats", label: "Hrozby", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", dot: "bg-orange-500" },
] as const;

interface SwotSectionProps {
  swot: AnalysisResult["swot"];
}

export default function SwotSection({ swot }: SwotSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {QUADRANTS.map((q) => {
        const items = swot[q.key];
        return (
          <div
            key={q.key}
            className={`rounded-xl border ${q.border} ${q.bg} p-5`}
          >
            <h3 className={`mb-3 text-sm font-semibold ${q.text}`}>
              {q.label}
            </h3>
            {items.length === 0 ? (
              <p className="text-sm text-muted">Žádné položky</p>
            ) : (
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${q.dot}`} />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
