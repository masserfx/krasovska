import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PricingCards } from "@/components/sections/PricingCards";
import { IMAGES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Víceúčelová plocha — 77×24 m pro florbal, volejbal a futsal",
  description:
    "Víceúčelová sportovní plocha 77×24 m s povrchem Taraflex® v Plzni-Bolevci. Florbal, volejbal, futsal, nohejbal. Pronájem od 900 Kč/hod. Krašovská 32.",
  openGraph: {
    title: "Víceúčelová plocha v Hale Krašovská",
    description: "Sportovní plocha 77×24 m pro kolektivní sporty. Od 900 Kč/hod.",
  },
  alternates: { canonical: "/viceucelova-plocha" },
};

export default function ViceucelovaPage() {
  return (
    <>
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden bg-primary-dark">
        <Image
          src={IMAGES.services.plocha.src}
          alt={IMAGES.services.plocha.alt}
          fill
          className="object-cover opacity-60"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-10 flex h-full items-end pb-12">
          <Container>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Víceúčelová plocha</h1>
            <p className="mt-2 text-lg text-white/80">
              77×24 m pro florbal, volejbal, futsal a další kolektivní sporty
            </p>
          </Container>
        </div>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold text-foreground">
                Prostor pro kolektivní sporty
              </h2>
              <div className="space-y-4 text-muted">
                <p>
                  Víceúčelová plocha o rozměrech až 77×24 m je ideální pro florbal,
                  volejbal, futsal, nohejbal, házenou a další kolektivní sporty.
                  Plochu lze rozdělit na menší části dle potřeb.
                </p>
                <p>
                  Povrch Taraflex® od Gerflor na dřevěném roštu zajišťuje maximální
                  bezpečnost a komfort při sportu. Hala je vhodná i pro firemní
                  teambuildingy a sportovní akce.
                </p>
              </div>
              <div className="mt-8 flex gap-4">
                <Button href="/rezervace" size="lg">
                  Rezervovat plochu
                </Button>
                <Button href="/kontakt" variant="outline">
                  Poptat teambuilding
                </Button>
              </div>
            </div>
            <div className="space-y-4 rounded-2xl bg-surface p-6">
              <h3 className="text-lg font-bold text-foreground">Parametry</h3>
              <dl className="space-y-3">
                {[
                  ["Rozměry", "až 77 × 24 m"],
                  ["Povrch", "Taraflex® Gerflor na dřevěném roštu"],
                  ["Sporty", "Florbal, volejbal, futsal, nohejbal, házená"],
                  ["Provozní doba Po–Pá", "7:00–22:00"],
                  ["Provozní doba So–Ne", "8:00–22:00"],
                  ["Dělení plochy", "Ano, dle potřeb"],
                  ["Parkování", "50 míst zdarma"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-border pb-3 last:border-0">
                    <dt className="text-sm text-muted">{label}</dt>
                    <dd className="text-sm font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      <PricingCards filter="plocha" />
    </>
  );
}
