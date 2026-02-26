"use client";

import { SECTIONS, FormData } from "@/types";
import { sectionFields } from "@/data/fields";
import { Download, Printer, Save, Upload, FolderOpen } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";

interface ExportPanelProps {
  formData: FormData;
  onImport: (data: FormData) => void;
}

function generateTextExport(formData: FormData): string {
  const lines: string[] = [];
  lines.push("═══════════════════════════════════════════════════════════════");
  lines.push("  HALA KRAŠOVSKÁ — PROJEKTOVÝ DOTAZNÍK");
  lines.push("  ERP/CRM systém — Vstupní analýza");
  lines.push(`  Datum exportu: ${new Date().toLocaleDateString("cs-CZ")}`);
  lines.push("═══════════════════════════════════════════════════════════════");
  lines.push("");

  for (const section of SECTIONS) {
    const fields = sectionFields[section.id] || [];
    const data = formData[section.id] || {};
    const hasData = fields.some((f) => {
      const val = data[f.id];
      if (Array.isArray(val)) return val.length > 0;
      return val && String(val).trim().length > 0;
    });

    lines.push(`\n▓▓ ${section.title.toUpperCase()}`);
    lines.push(`   ${section.description}`);
    lines.push("───────────────────────────────────────────────────────────────");

    if (!hasData) {
      lines.push("   (nevyplněno)");
      continue;
    }

    for (const field of fields) {
      const val = data[field.id];
      if (!val || (Array.isArray(val) && val.length === 0)) continue;
      if (typeof val === "string" && val.trim() === "") continue;

      lines.push(`\n   ${field.label}:`);
      if (Array.isArray(val)) {
        val.forEach((v) => lines.push(`     • ${v}`));
      } else {
        const strVal = String(val);
        if (strVal.includes("\n")) {
          strVal.split("\n").forEach((line) => lines.push(`     ${line}`));
        } else {
          lines.push(`     ${strVal}`);
        }
      }
    }
  }

  lines.push("\n═══════════════════════════════════════════════════════════════");
  lines.push("  Konec dotazníku");
  lines.push("═══════════════════════════════════════════════════════════════");

  return lines.join("\n");
}

export default function ExportPanel({ formData, onImport }: ExportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalFields = SECTIONS.reduce(
    (sum, s) => sum + (sectionFields[s.id]?.length || 0),
    0
  );
  const filledFields = SECTIONS.reduce((sum, s) => {
    const fields = sectionFields[s.id] || [];
    const data = formData[s.id] || {};
    return (
      sum +
      fields.filter((f) => {
        const val = data[f.id];
        if (Array.isArray(val)) return val.length > 0;
        return val && String(val).trim().length > 0;
      }).length
    );
  }, 0);
  const overallProgress = Math.round((filledFields / totalFields) * 100);

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(formData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hala-krasovska-dotaznik-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportText = () => {
    const text = generateTextExport(formData);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hala-krasovska-dotaznik-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        onImport(data);
      } catch {
        alert("Chyba při načítání souboru. Zkontrolujte formát JSON.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="no-print space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Celkový progress</span>
          <span className="font-bold text-primary">{overallProgress}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary-light transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted">
          {filledFields} / {totalFields} polí vyplněno
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleExportJSON}
          className="flex w-full items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <Save className="h-4 w-4" />
          Uložit (JSON)
        </button>

        <button
          onClick={handleExportText}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
        >
          <Download className="h-4 w-4" />
          Export (TXT)
        </button>

        <button
          onClick={handlePrint}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
        >
          <Printer className="h-4 w-4" />
          Tisk
        </button>

        <label className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-primary-light bg-primary-light/5 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary-light/10">
          <Upload className="h-4 w-4" />
          Načíst uložený dotazník
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        <Link
          href="/sessions"
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-background"
        >
          <FolderOpen className="h-4 w-4" />
          Správa dotazníků
        </Link>
      </div>
    </div>
  );
}
