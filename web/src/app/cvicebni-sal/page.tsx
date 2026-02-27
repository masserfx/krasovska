import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PricingCards } from "@/components/sections/PricingCards";
import { IMAGES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cvičební sál — Skupinové lekce, jóga, fitness",
  description:
    "Cvičební sál v Hale Krašovská v Plzni-Bolevci. Skupinové lekce, jóga, pilates, bojové sporty, fitness. Pronájem od 350 Kč/hod. Krašovská 32.",
  openGraph: {
    title: "Cvičební sál v Hale Krašovská",
    description: "Sál pro skupinové lekce, jógu, fitness. Od 350 Kč/hod.",
  },
  alternates: { canonical: "/cvicebni-sal" },
};

export default function CvicebniSalPage() {
  return (
    <>
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden bg-primary-dark">
        <Image
          src={IMAGES.services.sal.src}
          alt={IMAGES.services.sal.alt}
          fill
          className="object-cover opacity-60"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-10 flex h-full items-end pb-12">
          <Container>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Cvičební sál</h1>
            <p className="mt-2 text-lg text-white/80">
              Pro skupinové lekce, jógu, pilates a fitness tréninky
            </p>
          </Container>
        </div>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold text-foreground">
                Prostor pro vaše cvičení
              </h2>
              <div className="space-y-4 text-muted">
                <p>
                  Cvičební sál v Hale Krašovská je vhodný pro skupinové lekce, jógu,
                  pilates, bojové sporty, aerobic a fitness tréninky. Sál je vybaven
                  zrcadly a kvalitním osvětlením.
                </p>
                <p>
                  Prostor je ideální pro lektory a trenéry, kteří hledají zázemí pro
                  pravidelné kurzy. Pronájem je možný jak na jednotlivé hodiny, tak
                  na pravidelné blokové rezervace.
                </p>
              </div>
              <div className="mt-8 flex gap-4">
                <Button href="/rezervace" size="lg">
                  Rezervovat sál
                </Button>
                <Button href="/cenik" variant="outline">
                  Kompletní ceník
                </Button>
              </div>
            </div>
            <div className="space-y-4 rounded-2xl bg-surface p-6">
              <h3 className="text-lg font-bold text-foreground">Parametry</h3>
              <dl className="space-y-3">
                {[
                  ["Vybavení", "Zrcadla, osvětlení"],
                  ["Vhodné pro", "Jóga, pilates, aerobic, bojové sporty, fitness"],
                  ["Provozní doba Po–Pá", "7:00–22:00"],
                  ["Provozní doba So–Ne", "8:00–22:00"],
                  ["Blokové rezervace", "Ano, na dotaz"],
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

      <PricingCards filter="sal" />
    </>
  );
}
