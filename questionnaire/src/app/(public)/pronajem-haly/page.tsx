import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pronájem sportovní haly Plzeň | Hala Krasovská",
  description:
    "Pronájem sportovní haly v Plzni-Bolevci — badmintonové kurty, víceúčelová plocha 40x20m, cvičební sál. Pro tréninky, turnaje, ligy i firemní akce. Krašovská 32.",
  openGraph: {
    title: "Pronájem haly Plzeň — Hala Krasovská",
    description:
      "Pronájem kurtů a víceúčelové plochy v Plzni. Badminton, florbal, volejbal, teambuilding. Ceník a rezervace.",
    url: "https://hala-krasovska.vercel.app/pronajem-haly",
  },
  alternates: { canonical: "/pronajem-haly" },
};

export default function PronajemPage() {
  return (
    <>
      <section className="bg-primary px-4 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-4 text-4xl font-bold">
            Pronájem sportovní haly v Plzni
          </h1>
          <p className="max-w-2xl text-lg text-white/80">
            Pronajměte si kurty, víceúčelovou plochu nebo cvičební sál
            v Hale Krasovská. Pravidelné i jednorázové pronájmy.
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-2xl font-bold text-foreground">
            Prostory k pronájmu
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-white p-6">
              <h3 className="mb-2 text-lg font-bold text-foreground">
                Badmintonové kurty
              </h3>
              <p className="mb-4 text-sm text-muted">
                9 kurtů s osvětlením 500 lux. Pronájem po hodinách.
              </p>
              <div className="space-y-1 text-sm">
                <p><strong>Od 180 Kč</strong>/kurt/hodina</p>
              </div>
              <Link
                href="/badminton"
                className="mt-4 inline-block text-sm text-primary hover:underline"
              >
                Více o badmintonu
              </Link>
            </div>
            <div className="rounded-xl border border-border bg-white p-6">
              <h3 className="mb-2 text-lg font-bold text-foreground">
                Víceúčelová plocha
              </h3>
              <p className="mb-4 text-sm text-muted">
                40x20m — florbal, volejbal, futsal, akce. Mantinely k dispozici.
              </p>
              <div className="space-y-1 text-sm">
                <p><strong>Individuální cena</strong> dle rozsahu</p>
              </div>
              <Link
                href="/florbal"
                className="mt-4 inline-block text-sm text-primary hover:underline"
              >
                Více o ploše
              </Link>
            </div>
            <div className="rounded-xl border border-border bg-white p-6">
              <h3 className="mb-2 text-lg font-bold text-foreground">
                Cvičební sál
              </h3>
              <p className="mb-4 text-sm text-muted">
                Pro skupinová cvičení, jógu, bojové sporty, taneční kurzy.
              </p>
              <div className="space-y-1 text-sm">
                <p><strong>Individuální cena</strong> dle rozsahu</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Typy pronájmu
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-border p-6">
              <h3 className="mb-2 text-lg font-bold text-foreground">
                Pravidelný pronájem
              </h3>
              <p className="text-sm text-muted">
                Ideální pro kluby, firemní týmy a pravidelné skupiny. Garantovaný
                termín každý týden. Zvýhodněné ceny. Minimální období 3 měsíce.
              </p>
            </div>
            <div className="rounded-xl border border-border p-6">
              <h3 className="mb-2 text-lg font-bold text-foreground">
                Jednorázový pronájem
              </h3>
              <p className="text-sm text-muted">
                Turnaje, teambuildingy, firemní akce, narozeninové oslavy.
                Možnost cateringu z našeho bistra. Kapacita až 100 osob.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Doplňkové služby
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              { label: "Sauna", desc: "Relaxace po sportu", href: "/sauna" },
              { label: "Catering", desc: "Jídlo z vlastní kuchyně", href: "/bistro-krasovska" },
              { label: "Parkování", desc: "Zdarma u haly", href: "" },
              { label: "Vybavení", desc: "Rakety, míče k zapůjčení", href: "/eshop" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-white p-4 text-center"
              >
                <h3 className="font-semibold text-foreground">{item.label}</h3>
                <p className="text-xs text-muted">{item.desc}</p>
                {item.href && (
                  <Link
                    href={item.href}
                    className="mt-1 inline-block text-xs text-primary hover:underline"
                  >
                    Více
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Rezervace a poptávka
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted">
            Kontaktujte recepci pro rezervaci kurtů nebo nezávaznou poptávku
            pronájmu.
          </p>
          <a
            href="mailto:recepce@halakrasovska.cz?subject=Pronájem haly - poptávka"
            className="inline-block rounded-lg bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Kontaktovat recepci
          </a>
        </div>
      </section>
    </>
  );
}
