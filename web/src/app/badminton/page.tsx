import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PricingCards } from "@/components/sections/PricingCards";
import { IMAGES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Badminton — 9 profesionálních kurtů s Taraflex povrchem",
  description:
    "9 badmintonových kurtů s profesionálním povrchem Taraflex® od Gerflor v Plzni-Bolevci. Pronájem od 180 Kč/hod. Zapůjčení raket a míčků. Krašovská 32, Plzeň.",
  openGraph: {
    title: "Badminton v Hale Krašovská — 9 kurtů",
    description:
      "Profesionální badmintonové kurty s Taraflex® povrchem. Od 180 Kč/hod. Parkování zdarma.",
  },
  alternates: { canonical: "/badminton" },
};

export default function BadmintonPage() {
  return (
    <>
      <section className="relative h-[40vh] min-h-[300px] overflow-hidden bg-primary-dark">
        <Image
          src={IMAGES.services.badminton.src}
          alt={IMAGES.services.badminton.alt}
          fill
          className="object-cover opacity-60"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-10 flex h-full items-end pb-12">
          <Container>
            <h1 className="text-4xl font-bold text-white sm:text-5xl">Badminton</h1>
            <p className="mt-2 text-lg text-white/80">
              9 profesionálních kurtů s povrchem Taraflex® od Gerflor
            </p>
          </Container>
        </div>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold text-foreground">
                Profesionální zázemí pro badminton
              </h2>
              <div className="space-y-4 text-muted">
                <p>
                  Sportovní hala Krašovská nabízí 9 badmintonových kurtů s moderním
                  sportovním povrchem Taraflex® od Gerflor uloženým na dřevěném roštu.
                  Tento povrch perfektně pohlcuje nárazy a je extrémně šetrný k vašemu
                  pohybovému aparátu.
                </p>
                <p>
                  Na recepci je možné zapůjčit nebo zakoupit badmintonové rakety, míčky
                  a další sportovní vybavení. Vstup na hrací plochu je možný výhradně
                  v sálové obuvi se světlou a tvrdou podrážkou.
                </p>
                <p>
                  Hala je ideální pro rekreační hráče i pokročilé — pravidelně zde
                  pořádáme turnaje a tréninky pro všechny věkové kategorie.
                </p>
              </div>
              <div className="mt-8 flex gap-4">
                <Button href="/rezervace" size="lg">
                  Rezervovat kurt
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
                  ["Počet kurtů", "9"],
                  ["Povrch", "Taraflex® Gerflor na dřevěném roštu"],
                  ["Provozní doba Po–Pá", "7:00–22:00"],
                  ["Provozní doba So–Ne", "8:00–22:00"],
                  ["Zapůjčení raket", "Ano, na recepci"],
                  ["Parkování", "50 míst zdarma"],
                  ["Šatny a sprchy", "Ano, elektronický čip (záloha 100 Kč)"],
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

      <PricingCards filter="badminton" />
    </>
  );
}
