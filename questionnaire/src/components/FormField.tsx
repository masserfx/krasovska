"use client";

import { FieldConfig } from "@/types";

interface FormFieldProps {
  field: FieldConfig;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

export default function FormField({ field, value, onChange }: FormFieldProps) {
  const baseInputClass =
    "w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-foreground transition-colors focus:border-primary-light focus:outline-none focus:ring-2 focus:ring-primary-light/20";

  if (field.type === "textarea") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {field.label}
          {field.required && <span className="ml-1 text-danger">*</span>}
        </label>
        {field.hint && (
          <p className="mb-1.5 text-xs text-muted">{field.hint}</p>
        )}
        <textarea
          className={baseInputClass + " min-h-[80px] resize-y"}
          placeholder={field.placeholder}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {field.label}
          {field.required && <span className="ml-1 text-danger">*</span>}
        </label>
        {field.hint && (
          <p className="mb-1.5 text-xs text-muted">{field.hint}</p>
        )}
        <select
          className={baseInputClass + " cursor-pointer"}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— Vyberte —</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {field.label}
          {field.required && <span className="ml-1 text-danger">*</span>}
        </label>
        {field.hint && (
          <p className="mb-1.5 text-xs text-muted">{field.hint}</p>
        )}
        <div className="mt-2 space-y-2">
          {field.options?.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={(e) => onChange(e.target.value)}
                className="h-4 w-4 text-primary-light accent-primary-light"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "checkbox") {
    const checkedValues = Array.isArray(value) ? value : [];
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {field.label}
          {field.required && <span className="ml-1 text-danger">*</span>}
        </label>
        {field.hint && (
          <p className="mb-1.5 text-xs text-muted">{field.hint}</p>
        )}
        <div className="mt-2 space-y-2">
          {field.options?.map((opt) => (
            <label
              key={opt}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                value={opt}
                checked={checkedValues.includes(opt)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...checkedValues, opt]);
                  } else {
                    onChange(checkedValues.filter((v) => v !== opt));
                  }
                }}
                className="h-4 w-4 rounded accent-primary-light"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          {field.label}
          {field.required && <span className="ml-1 text-danger">*</span>}
        </label>
        {field.hint && (
          <p className="mb-1.5 text-xs text-muted">{field.hint}</p>
        )}
        <input
          type="number"
          className={baseInputClass}
          placeholder={field.placeholder}
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {field.label}
        {field.required && <span className="ml-1 text-danger">*</span>}
      </label>
      {field.hint && (
        <p className="mb-1.5 text-xs text-muted">{field.hint}</p>
      )}
      <input
        type="text"
        className={baseInputClass}
        placeholder={field.placeholder}
        value={(value as string) || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
