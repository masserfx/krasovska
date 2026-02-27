import { createOgImage, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "E-shop — Sportovní potřeby pro badminton";
export const size = ogSize;
export const contentType = "image/png";

export default function OgImage() {
  return createOgImage(
    "E-shop Hala Krasovská",
    "Rakety · Košíčky · Oblečení · Obuv · Osobní odběr v Plzni zdarma",
  );
}
