"use client";

import { SECTIONS, FormData, FieldConfig } from "@/types";
import { sectionFields } from "@/data/fields";
import FormField from "./FormField";

const noteField: FieldConfig = {
  id: "poznamka",
  label: "Poznámka",
  type: "textarea",
  placeholder: "Nápad na vylepšení?..., Urgentní:...",
};

interface SectionContentProps {
  sectionId: string;
  formData: FormData;
  onFieldChange: (sectionId: string, fieldId: string, value: string | string[]) => void;
}

export default function SectionContent({
  sectionId,
  formData,
  onFieldChange,
}: SectionContentProps) {
  const section = SECTIONS.find((s) => s.id === sectionId);
  const fields = sectionFields[sectionId] || [];
  const sectionData = formData[sectionId] || {};

  if (!section) return null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
        <p className="mt-1 text-sm text-muted">{section.description}</p>
      </div>

      <div className="space-y-6">
        {fields.map((field) => (
          <FormField
            key={field.id}
            field={field}
            value={sectionData[field.id] || (field.type === "checkbox" ? [] : "")}
            onChange={(value) => onFieldChange(sectionId, field.id, value)}
          />
        ))}

        <hr className="border-border" />

        <FormField
          field={noteField}
          value={sectionData["poznamka"] || ""}
          onChange={(value) => onFieldChange(sectionId, "poznamka", value)}
        />
      </div>
    </div>
  );
}
