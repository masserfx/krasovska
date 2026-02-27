import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ReservationSteps } from "@/components/sections/ReservationSteps";

export const metadata: Metadata = {
  title: "Rezervace sportoviště",
  description:
    "Zarezervujte si badmintonový kurt, víceúčelovou plochu nebo cvičební sál v Hale Krašovská, Plzeň-Bolevec. Online rozvrh, telefonická rezervace.",
  openGraph: {
    title: "Rezervace — Hala Krašovská Plzeň",
    description: "Zarezervujte si sportoviště online nebo telefonicky.",
  },
  alternates: { canonical: "/rezervace" },
};

export default function RezervacePage() {
  return (
    <>
      <section className="bg-primary py-16 text-white">
        <Container>
          <h1 className="text-4xl font-bold sm:text-5xl">Rezervace</h1>
          <p className="mt-2 text-lg text-white/80">
            Zarezervujte si sportoviště ve třech jednoduchých krocích
          </p>
        </Container>
      </section>

      <ReservationSteps />

      <section className="bg-surface py-16">
        <Container className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Pravidelné rezervace
          </h2>
          <p className="mx-auto max-w-2xl text-muted">
            Pro pravidelné hráče a týmy nabízíme blokové rezervace na celou sezónu
            za zvýhodněné podmínky. Kontaktujte nás pro individuální nabídku.
          </p>
        </Container>
      </section>
    </>
  );
}
