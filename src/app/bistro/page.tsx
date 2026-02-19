"use client";

import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import KanbanBoard from "@/components/bistro/KanbanBoard";
import GanttChart from "@/components/bistro/GanttChart";
import ControllingDashboard from "@/components/bistro/ControllingDashboard";
import BriefingViewer from "@/components/bistro/BriefingViewer";

type Tab = "kanban" | "gantt" | "kontroling" | "briefing";

export default function BistroPage() {
  const [activeTab, setActiveTab] = useState<Tab>("kanban");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader activeTab="bistro" />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Bistro Hala Krašovská
          </h2>
          <p className="text-muted mt-1">
            Management plán spuštění bistra
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex gap-2 mb-6 border-b border-border">
          {[
            { id: "kanban", label: "Kanban" },
            { id: "gantt", label: "Gantt" },
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

        {/* Tab content */}
        {activeTab === "kanban" && <KanbanBoard />}
        {activeTab === "gantt" && <GanttChart />}
        {activeTab === "kontroling" && <ControllingDashboard />}
        {activeTab === "briefing" && <BriefingViewer />}
      </div>
    </div>
  );
}
