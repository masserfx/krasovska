import { createOgImage, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Bistro Krasovská — Burgery, Pizza, Denní menu";
export const size = ogSize;
export const contentType = "image/png";

export default function OgImage() {
  return createOgImage(
    "Bistro Krasovská",
    "Burgery od 139 Kč · Pizza z vlastního těsta · Denní menu · Prazdroj z tanku",
    "#b45309",
  );
}
