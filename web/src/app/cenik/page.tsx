import type { Metadata } from "next";
import { PricingCards } from "@/components/sections/PricingCards";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Ceník — Badminton, Víceúčelová plocha, Cvičební sál",
  description:
    "Aktuální ceník pronájmu sportovišť v Hale Krašovská, Plzeň-Bolevec. Badminton od 180 Kč/hod, víceúčelová plocha od 900 Kč/hod, cvičební sál od 350 Kč/hod.",
  openGraph: {
    title: "Ceník — Hala Krašovská Plzeň",
    description: "Badminton od 180 Kč/hod, víceúčelová plocha od 900 Kč/hod, sál od 350 Kč/hod.",
  },
  alternates: { canonical: "/cenik" },
};

export default function CenikPage() {
  return (
    <>
      <section className="bg-primary py-16 text-white">
        <Container>
          <h1 className="text-4xl font-bold sm:text-5xl">Ceník</h1>
          <p className="mt-2 text-lg text-white/80">
            Ceny platné od 1. 1. 2026, včetně DPH
          </p>
        </Container>
      </section>

      <PricingCards />

      <section className="py-16">
        <Container className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Členská karta</h2>
          <p className="mx-auto max-w-2xl text-muted">
            Držitelé členské karty získávají zvýhodněné ceny na všech sportovištích.
            O členskou kartu můžete požádat na recepci haly.
          </p>
          <div className="mt-6">
            <Button href="/kontakt" variant="outline">
              Kontaktovat recepci
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
