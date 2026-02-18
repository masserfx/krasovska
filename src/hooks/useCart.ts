"use client";

import { useState, useEffect, useCallback } from "react";
import { CartItem } from "@/types/eshop";

const STORAGE_KEY = "hala-krasovska-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    saveCart(next);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      const current = loadCart();
      const idx = current.findIndex((i) => i.product_id === item.product_id);
      if (idx >= 0) {
        current[idx].quantity += quantity;
      } else {
        current.push({ ...item, quantity });
      }
      persist(current);
    },
    [persist]
  );

  const removeItem = useCallback(
    (productId: string) => {
      const current = loadCart().filter((i) => i.product_id !== productId);
      persist(current);
    },
    [persist]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      const current = loadCart();
      const idx = current.findIndex((i) => i.product_id === productId);
      if (idx >= 0) {
        current[idx].quantity = quantity;
        persist(current);
      }
    },
    [persist, removeItem]
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.price_czk * i.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, itemCount, total };
}
