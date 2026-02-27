import { createOgImage, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Sauna Plzeň — Finská sauna v Hale Krasovská";
export const size = ogSize;
export const contentType = "image/png";

export default function OgImage() {
  return createOgImage(
    "Sauna Plzeň",
    "Finská sauna · Relaxace po sportu · 80-100°C · Sprchy a odpočívárna",
  );
}
