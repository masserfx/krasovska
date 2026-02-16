"use client";

import { SECTIONS } from "@/types";
import {
  Building2,
  Users,
  Wallet,
  Landmark,
  CalendarCheck,
  UserCheck,
  Dumbbell,
  Trophy,
  ShoppingCart,
  UtensilsCrossed,
  Megaphone,
  Server,
  Shield,
  Target,
  CheckCircle2,
} from "lucide-react";
import { FormData } from "@/types";
import { sectionFields } from "@/data/fields";

const iconMap: Record<string, React.ElementType> = {
  Building2,
  Users,
  Wallet,
  Landmark,
  CalendarCheck,
  UserCheck,
  Dumbbell,
  Trophy,
  ShoppingCart,
  UtensilsCrossed,
  Megaphone,
  Server,
  Shield,
  Target,
};

interface SectionNavProps {
  activeSection: string;
  onSelect: (id: string) => void;
  formData: FormData;
}

function getSectionProgress(sectionId: string, formData: FormData): number {
  const fields = sectionFields[sectionId];
  if (!fields) return 0;
  const data = formData[sectionId] || {};
  const filled = fields.filter((f) => {
    const val = data[f.id];
    if (Array.isArray(val)) return val.length > 0;
    return val && String(val).trim().length > 0;
  }).length;
  return Math.round((filled / fields.length) * 100);
}

export default function SectionNav({
  activeSection,
  onSelect,
  formData,
}: SectionNavProps) {
  return (
    <nav className="no-print space-y-1">
      {SECTIONS.map((section) => {
        const Icon = iconMap[section.icon] || Target;
        const isActive = activeSection === section.id;
        const progress = getSectionProgress(section.id, formData);
        const isComplete = progress === 100;

        return (
          <button
            key={section.id}
            onClick={() => onSelect(section.id)}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
              isActive
                ? "bg-primary text-white shadow-md"
                : "text-foreground hover:bg-primary-light/10"
            }`}
          >
            <div className="relative">
              <Icon className="h-4 w-4 shrink-0" />
              {isComplete && !isActive && (
                <CheckCircle2 className="absolute -right-1 -top-1 h-3 w-3 text-success" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{section.title}</div>
              {progress > 0 && !isActive && (
                <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-success transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
            {progress > 0 && (
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-white/80" : "text-muted"
                }`}
              >
                {progress}%
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
