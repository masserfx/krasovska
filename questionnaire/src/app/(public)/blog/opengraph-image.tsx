import { createOgImage, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Blog — Novinky z Haly Krasovská";
export const size = ogSize;
export const contentType = "image/png";

export default function OgImage() {
  return createOgImage(
    "Blog & Aktuality",
    "Novinky, tipy a události ze sportovní haly v Plzni-Bolevci",
  );
}
