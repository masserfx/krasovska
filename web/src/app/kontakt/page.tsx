import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { MapSection } from "@/components/sections/MapSection";
import { CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Kontakt — Adresa, Telefon, E-mail",
  description:
    "Kontaktujte Sportovní halu Krašovská. Krašovská 32, 323 00 Plzeň-Bolevec. Telefon: 774 050 839. E-mail: recepce@halakrasovska.cz. 50 parkovacích míst zdarma.",
  openGraph: {
    title: "Kontakt — Hala Krašovská Plzeň",
    description: "Krašovská 32, Plzeň-Bolevec. Tel: 774 050 839. Parkování 50 míst zdarma.",
  },
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return (
    <>
      <section className="bg-primary py-16 text-white">
        <Container>
          <h1 className="text-4xl font-bold sm:text-5xl">Kontakt</h1>
          <p className="mt-2 text-lg text-white/80">
            Rádi zodpovíme vaše dotazy
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Kde nás najdete
              </h2>

              <div className="space-y-6">
                <div className="rounded-xl border border-border p-6">
                  <h3 className="mb-3 font-bold text-foreground">{CONTACT.name}</h3>
                  <address className="space-y-2 text-sm not-italic text-muted">
                    <p>{CONTACT.street}</p>
                    <p>{CONTACT.city}</p>
                    <p className="text-base">
                      <a href={`tel:${CONTACT.phone}`} className="font-semibold text-primary hover:underline">
                        {CONTACT.phoneDisplay}
                      </a>
                    </p>
                    <p>
                      <a href={`mailto:${CONTACT.email}`} className="text-primary hover:underline">
                        {CONTACT.email}
                      </a>
                    </p>
                  </address>
                </div>

                <div className="rounded-xl border border-border p-6">
                  <h3 className="mb-3 font-bold text-foreground">Provozní doba</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted">Pondělí – Pátek</dt>
                      <dd className="font-medium text-foreground">7:00 – 22:00</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted">Sobota – Neděle</dt>
                      <dd className="font-medium text-foreground">8:00 – 22:00</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-border p-6">
                  <h3 className="mb-3 font-bold text-foreground">Fakturační údaje</h3>
                  <div className="space-y-1 text-sm text-muted">
                    <p className="font-medium text-foreground">{CONTACT.org}</p>
                    <p>{CONTACT.legalAddress}</p>
                    <p>IČ: {CONTACT.ico}</p>
                    <p>DIČ: {CONTACT.dic}</p>
                    <p>
                      <a href={`mailto:${CONTACT.legalEmail}`} className="text-primary hover:underline">
                        {CONTACT.legalEmail}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                Napište nám
              </h2>
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1 block text-sm font-medium text-foreground">
                      Jméno
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-foreground">
                      E-mail
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="mb-1 block text-sm font-medium text-foreground">
                    Zpráva
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-8 py-3 font-semibold text-white transition-colors hover:bg-primary-light"
                >
                  Odeslat zprávu
                </button>
              </form>
            </div>
          </div>
        </Container>
      </section>

      <MapSection />
    </>
  );
}
