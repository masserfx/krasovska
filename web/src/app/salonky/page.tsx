import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Salonky — Prostory pro akce a teambuilding",
  description:
    "Pronájem salonků v Hale Krašovská, Plzeň-Bolevec. Ideální pro firemní akce, teambuildingy, oslavy a soukromé události. Krašovská 32.",
  openGraph: {
    title: "Salonky — Hala Krašovská Plzeň",
    description: "Pronájem salonků pro firemní akce a teambuildingy.",
  },
  alternates: { canonical: "/salonky" },
};

export default function SalonkyPage() {
  return (
    <>
      <section className="bg-primary py-16 text-white">
        <Container>
          <div className="inline-block rounded-full bg-accent px-4 py-1 text-sm font-semibold text-foreground">
            Připravujeme
          </div>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Salonky</h1>
          <p className="mt-2 text-lg text-white/80">
            Prostory pro firemní akce, teambuildingy a soukromé události
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container className="text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Brzy pro vás připravíme nabídku salonků
            </h2>
            <p className="text-muted">
              V Hale Krašovská připravujeme prostory pro firemní akce,
              teambuildingy, oslavy a další soukromé události. Sledujte naše
              sociální sítě nebo nás kontaktujte pro více informací.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button href="/kontakt" size="lg">
                Kontaktovat nás
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
