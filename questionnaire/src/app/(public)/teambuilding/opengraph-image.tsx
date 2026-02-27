import { createOgImage, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Teambuilding Plzeň — Sportovní akce pro firmy";
export const size = ogSize;
export const contentType = "image/png";

export default function OgImage() {
  return createOgImage(
    "Teambuilding Plzeň",
    "Sport · Catering z vlastního bistra · Sauna · Kapacita 100 osob",
  );
}
