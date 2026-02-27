import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { restaurantSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Bistro — Burgery, Pizza, Denní menu",
  description:
    "Sportovní bistro v Hale Krašovská, Plzeň-Bolevec. Autorské burgery, pizza z vlastního těsta, denní menu od 149 Kč. Čerstvé suroviny, žádné polotovary. Otevíráme květen 2026.",
  openGraph: {
    title: "Bistro Hala Krašovská — Burgery, Pizza, Denní menu",
    description:
      "Autorské burgery, pizza z vlastního těsta, protein bowly. Denní menu od 149 Kč. Otevíráme květen 2026.",
  },
  alternates: { canonical: "/bistro" },
};

export default function BistroPage() {
  return (
    <>
      <JsonLd data={restaurantSchema} />

      <section className="bg-primary py-16 text-white">
        <Container>
          <div className="inline-block rounded-full bg-accent px-4 py-1 text-sm font-semibold text-foreground">
            Otevíráme květen 2026
          </div>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Bistro Krašovská</h1>
          <p className="mt-2 text-lg text-white/80">
            Čerstvé suroviny · Vlastní příprava · Žádné polotovary
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              Sportovní bistro, kde chutnáte rozdíl
            </h2>

            <div className="space-y-4 text-muted">
              <p>
                Připravujeme pro vás bistro přímo v Hale Krašovská. Autorské burgery,
                pizza z vlastního těsta, protein bowly, saláty a denní menu od 149 Kč.
                Vše z čerstvých surovin bez polotovarů.
              </p>
              <p>
                Čepovaný Plzeňský Prazdroj přímo z tanku, pákový kávovar a široký
                výběr nealkoholických nápojů. Ideální pro doplnění energie po sportu
                nebo pohodový oběd v Bolevci.
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {[
                { title: "Burgery", desc: "5 autorských burgerů (139–189 Kč)", icon: "🍔" },
                { title: "Pizza", desc: "6 pizz z vlastního těsta (129–179 Kč)", icon: "🍕" },
                { title: "Denní menu", desc: "Polévka + hlavní jídlo (149–169 Kč)", icon: "🍽️" },
                { title: "Protein bowly", desc: "Pro sportovce — 30g bílkovin", icon: "💪" },
                { title: "Čepovaná Plzeň", desc: "Přímo z tanku", icon: "🍺" },
                { title: "Káva", desc: "Pákový kávovar, espresso, cappuccino", icon: "☕" },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-border p-4">
                  <div className="text-2xl">{item.icon}</div>
                  <h3 className="mt-2 font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-2xl bg-surface p-8 text-center">
              <h3 className="text-xl font-bold text-foreground">
                Buďte první, kdo se dozví o otevření
              </h3>
              <p className="mt-2 text-muted">
                Sledujte nás na sociálních sítích — prvních 50 zákazníků
                dostane burger 1+1 zdarma!
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Button href="https://www.facebook.com/halakrasovska" external>
                  Facebook
                </Button>
                <Button href="https://www.instagram.com/hala.krasovska" variant="outline" external>
                  Instagram
                </Button>
              </div>
            </div>

            <div className="mt-10 rounded-2xl border border-border p-8">
              <h3 className="mb-4 text-xl font-bold text-foreground">
                Catering pro turnaje
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-surface p-4">
                  <h4 className="font-bold text-foreground">Balíček Standard</h4>
                  <p className="text-2xl font-bold text-primary">169 Kč/os</p>
                  <p className="text-sm text-muted">Polévka + hlavní jídlo + nápoj 0,5l</p>
                </div>
                <div className="rounded-xl bg-surface p-4">
                  <h4 className="font-bold text-foreground">Balíček Premium</h4>
                  <p className="text-2xl font-bold text-primary">229 Kč/os</p>
                  <p className="text-sm text-muted">Polévka + hlavní (3 varianty) + dezert + nápoj</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted">
                Min. objednávka 20 osob, 5 pracovních dnů předem.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
