"use client";

import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import ControllingDashboard from "@/components/bistro/ControllingDashboard";
import BriefingViewer from "@/components/bistro/BriefingViewer";
import StrategyView from "@/components/bistro/strategy/StrategyView";
import PlaneLink from "@/components/PlaneLink";
import { PLANE_LINKS } from "@/lib/plane-links";

type Tab = "strategie" | "kontroling" | "briefing";

export default function BistroPage() {
  const [activeTab, setActiveTab] = useState<Tab>("strategie");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="bistro" />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bistro Hala Krasovská
            </h1>
            <p className="text-muted mt-1">
              Management plán spuštění bistra
            </p>
          </div>
          <PlaneLink href={PLANE_LINKS.bistro} />
        </div>

        <div className="flex gap-2 mb-6 border-b border-border">
          {[
            { id: "strategie", label: "Strategie" },
            { id: "kontroling", label: "Kontroling" },
            { id: "briefing", label: "CEO Briefing" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "strategie" && <StrategyView />}
        {activeTab === "kontroling" && <ControllingDashboard />}
        {activeTab === "briefing" && <BriefingViewer />}
      </div>
    </div>
  );
}
