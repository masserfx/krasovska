"use client";

import { useState } from "react";
import { Tag, Loader2, Check } from "lucide-react";
import { validateDiscount } from "@/lib/eshop-api";

interface Props {
  subtotal: number;
  onApply: (code: string, amount: number) => void;
}

export default function DiscountCodeInput({ subtotal, onApply }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [applied, setApplied] = useState(false);

  async function handleApply() {
    if (!code.trim()) return;
    setLoading(true);
    setMessage("");

    try {
      const result = await validateDiscount(code.trim(), subtotal);
      setMessage(result.message);
      if (result.valid) {
        setApplied(true);
        onApply(code.trim(), result.discount_amount);
      }
    } catch {
      setMessage("Chyba při ověřování kódu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setApplied(false); }}
            placeholder="Zadejte kód"
            disabled={applied}
            className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none disabled:bg-background"
          />
        </div>
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || applied || !code.trim()}
          className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-background disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : applied ? <Check className="h-4 w-4 text-success" /> : null}
          {applied ? "Aplikováno" : "Použít"}
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-sm ${applied ? "text-success" : "text-danger"}`}>{message}</p>
      )}
    </div>
  );
}
