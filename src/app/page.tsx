"use client";

import { useState, useEffect, useCallback } from "react";
import { SECTIONS, FormData } from "@/types";
import SectionNav from "@/components/SectionNav";
import SectionContent from "@/components/SectionContent";
import ExportPanel from "@/components/ExportPanel";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

const STORAGE_KEY = "hala-krasovska-questionnaire";

export default function Home() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [formData, setFormData] = useState<FormData>({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, mounted]);

  const handleFieldChange = useCallback(
    (sectionId: string, fieldId: string, value: string | string[]) => {
      setFormData((prev) => ({
        ...prev,
        [sectionId]: {
          ...prev[sectionId],
          [fieldId]: value,
        },
      }));
    },
    []
  );

  const handleImport = useCallback((data: FormData) => {
    setFormData(data);
  }, []);

  const currentIndex = SECTIONS.findIndex((s) => s.id === activeSection);

  const goToSection = (direction: "prev" | "next") => {
    const newIndex =
      direction === "prev"
        ? Math.max(0, currentIndex - 1)
        : Math.min(SECTIONS.length - 1, currentIndex + 1);
    setActiveSection(SECTIONS[newIndex].id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSectionSelect = (id: string) => {
    setActiveSection(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted">Načítání...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="no-print sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 text-foreground hover:bg-background lg:hidden"
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Hala Krašovská
              </h1>
              <p className="text-xs text-muted">
                Projektový dotazník — ERP/CRM systém
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-muted sm:flex">
            <span className="rounded-full bg-primary-light/10 px-3 py-1 font-medium text-primary">
              Sekce {currentIndex + 1} / {SECTIONS.length}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar — desktop */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-20 space-y-6">
              <SectionNav
                activeSection={activeSection}
                onSelect={handleSectionSelect}
                formData={formData}
              />
              <div className="border-t border-border pt-4">
                <ExportPanel formData={formData} onImport={handleImport} />
              </div>
            </div>
          </aside>

          {/* Sidebar — mobile overlay */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setSidebarOpen(false)}
              />
              <aside className="absolute left-0 top-0 h-full w-80 overflow-y-auto bg-white p-4 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-bold text-foreground">Sekce</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="rounded-lg p-1 hover:bg-background"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <SectionNav
                  activeSection={activeSection}
                  onSelect={handleSectionSelect}
                  formData={formData}
                />
                <div className="mt-6 border-t border-border pt-4">
                  <ExportPanel formData={formData} onImport={handleImport} />
                </div>
              </aside>
            </div>
          )}

          {/* Main content */}
          <main className="min-w-0 flex-1">
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
              <SectionContent
                sectionId={activeSection}
                formData={formData}
                onFieldChange={handleFieldChange}
              />
            </div>

            {/* Navigation buttons */}
            <div className="no-print mt-6 flex items-center justify-between">
              <button
                onClick={() => goToSection("prev")}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Předchozí
              </button>

              <span className="text-sm text-muted">
                {currentIndex + 1} / {SECTIONS.length}
              </span>

              <button
                onClick={() => goToSection("next")}
                disabled={currentIndex === SECTIONS.length - 1}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                Další
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
