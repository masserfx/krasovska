"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";

interface CartToastItem {
  name: string;
  image_url: string | null;
}

interface Props {
  item: CartToastItem | null;
  onDismiss: () => void;
}

export default function CartToast({ item, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (item) {
      // trigger slide-in
      requestAnimationFrame(() => setVisible(true));
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [item, onDismiss]);

  if (!item) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex w-80 items-center gap-3 rounded-xl border border-border bg-white p-4 shadow-lg transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
    >
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.name}
          className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-background text-xs text-muted">
          Foto
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">Přidáno do košíku</p>
        <p className="truncate text-xs text-muted">{item.name}</p>
        <Link
          href="/eshop/kosik"
          className="mt-0.5 inline-block text-xs font-medium text-primary hover:underline"
        >
          Zobrazit košík
        </Link>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onDismiss, 300);
        }}
        className="flex-shrink-0 text-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
