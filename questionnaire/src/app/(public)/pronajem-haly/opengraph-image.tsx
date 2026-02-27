import { createOgImage, ogSize } from "@/lib/og-image";

export const runtime = "edge";
export const alt = "Pronájem sportovní haly Plzeň";
export const size = ogSize;
export const contentType = "image/png";

export default function OgImage() {
  return createOgImage(
    "Pronájem sportovní haly",
    "9 kurtů · Víceúčelová plocha 40x20m · Cvičební sál · Plzeň-Bolevec",
  );
}
