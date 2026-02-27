import { createOgImage, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Bistro Hala Krasovská — Management";
export const size = ogSize;
export const contentType = "image/png";

export default function OgImage() {
  return createOgImage(
    "Bistro Hala Krasovská",
    "Burgery · Pizza · Denní menu · Protein bowly · Čepovaný Prazdroj",
    "#b45309",
  );
}
