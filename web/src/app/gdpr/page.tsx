import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů (GDPR)",
  description:
    "Zásady ochrany osobních údajů Sportovní haly Krašovská, Badmintonová Akademie Plzeň, z.s.",
  alternates: { canonical: "/gdpr" },
  robots: { index: false, follow: true },
};

export default function GdprPage() {
  return (
    <>
      <section className="bg-primary py-16 text-white">
        <Container>
          <h1 className="text-4xl font-bold sm:text-5xl">Ochrana osobních údajů</h1>
        </Container>
      </section>

      <section className="py-16">
        <Container className="mx-auto max-w-3xl">
          <div className="prose prose-slate max-w-none space-y-6 text-muted">
            <h2 className="text-xl font-bold text-foreground">Správce osobních údajů</h2>
            <p>
              {CONTACT.org}, {CONTACT.legalAddress}, IČ: {CONTACT.ico}, DIČ: {CONTACT.dic}
              <br />
              E-mail: <a href={`mailto:${CONTACT.legalEmail}`} className="text-primary">{CONTACT.legalEmail}</a>
            </p>

            <h2 className="text-xl font-bold text-foreground">Rozsah zpracování</h2>
            <p>
              Zpracováváme osobní údaje poskytnuté prostřednictvím kontaktního
              formuláře na těchto stránkách (jméno, e-mail, obsah zprávy) za účelem
              zodpovězení vašeho dotazu.
            </p>

            <h2 className="text-xl font-bold text-foreground">Právní základ</h2>
            <p>
              Zpracování je založeno na oprávněném zájmu správce (čl. 6 odst. 1 písm.
              f) GDPR) — zodpovězení poptávek a dotazů návštěvníků.
            </p>

            <h2 className="text-xl font-bold text-foreground">Doba uchovávání</h2>
            <p>
              Údaje z kontaktního formuláře uchováváme po dobu nezbytnou pro vyřízení
              vašeho dotazu, maximálně 12 měsíců.
            </p>

            <h2 className="text-xl font-bold text-foreground">Cookies</h2>
            <p>
              Tyto stránky používají technicky nezbytné cookies a analytické cookies
              (Google Analytics) pro měření návštěvnosti. Analytické cookies jsou
              aktivovány pouze s vaším souhlasem.
            </p>

            <h2 className="text-xl font-bold text-foreground">Vaše práva</h2>
            <p>
              Máte právo na přístup k údajům, opravu, výmaz, omezení zpracování,
              přenositelnost a právo vznést námitku. Kontaktujte nás na{" "}
              <a href={`mailto:${CONTACT.legalEmail}`} className="text-primary">
                {CONTACT.legalEmail}
              </a>
              .
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
