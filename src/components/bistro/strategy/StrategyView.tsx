"use client";

import { useState } from "react";
import ExecutiveSummary from "./ExecutiveSummary";
import VariantComparison from "./VariantComparison";
import FinancialModel from "./FinancialModel";
import PersonnelPlan from "./PersonnelPlan";
import MarketingPlan from "./MarketingPlan";
import LegislativeChecklist from "./LegislativeChecklist";
import SalonkySection from "./SalonkySection";
import SuppliersSection from "./SuppliersSection";

type Section =
  | "summary"
  | "variants"
  | "finance"
  | "personnel"
  | "marketing"
  | "legislative"
  | "salonky"
  | "suppliers";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "summary", label: "Prehled" },
  { id: "variants", label: "Varianty A/B/C" },
  { id: "finance", label: "Finance" },
  { id: "personnel", label: "Personal" },
  { id: "marketing", label: "Marketing" },
  { id: "legislative", label: "Legislativa" },
  { id: "salonky", label: "Salonky" },
  { id: "suppliers", label: "Dodavatele" },
];

export default function StrategyView() {
  const [activeSection, setActiveSection] = useState<Section>("summary");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              activeSection === s.id
                ? "bg-primary text-white border-primary"
                : "bg-white text-foreground border-border hover:border-primary/40"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div>
        {activeSection === "summary" && <ExecutiveSummary />}
        {activeSection === "variants" && <VariantComparison />}
        {activeSection === "finance" && <FinancialModel />}
        {activeSection === "personnel" && <PersonnelPlan />}
        {activeSection === "marketing" && <MarketingPlan />}
        {activeSection === "legislative" && <LegislativeChecklist />}
        {activeSection === "salonky" && <SalonkySection />}
        {activeSection === "suppliers" && <SuppliersSection />}
      </div>
    </div>
  );
}
