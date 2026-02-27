import { createOgImage, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Badminton Plzeň — 9 kurtů v Hale Krasovská";
export const size = ogSize;
export const contentType = "image/png";

export default function OgImage() {
  return createOgImage(
    "Badminton Plzeň — 9 kurtů",
    "Profesionální kurty · Osvětlení 500 lux · Sauna · Bistro",
  );
}
