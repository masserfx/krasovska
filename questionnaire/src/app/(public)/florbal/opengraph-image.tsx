import { createOgImage, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Florbal Plzeň — Víceúčelová plocha 40x20m";
export const size = ogSize;
export const contentType = "image/png";

export default function OgImage() {
  return createOgImage(
    "Florbal Plzeň",
    "Víceúčelová plocha 40x20m · Mantinely · Tréninky i turnaje",
  );
}
