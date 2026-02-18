/**
 * Format price from halere to human-readable CZK string.
 * Example: 129000 → "1 290 Kč"
 */
export function formatPrice(halere: number): string {
  const czk = Math.round(halere / 100);
  return czk.toLocaleString("cs-CZ") + " Kč";
}

/**
 * Generate URL-safe slug from Czech product name.
 * Example: "Badmintonová raketa Yonex" → "badmintonova-raketa-yonex"
 */
export function generateSlug(name: string): string {
  const charMap: Record<string, string> = {
    á: "a", č: "c", ď: "d", é: "e", ě: "e", í: "i",
    ň: "n", ó: "o", ř: "r", š: "s", ť: "t", ú: "u",
    ů: "u", ý: "y", ž: "z",
  };

  return name
    .toLowerCase()
    .split("")
    .map((ch) => charMap[ch] || ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Generate unique order number.
 * Format: "HK-20260218-A3F7"
 */
export function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HK-${date}-${rand}`;
}
