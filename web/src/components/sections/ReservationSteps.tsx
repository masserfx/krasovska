import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

const steps = [
  {
    number: "1",
    title: "Výběr termínu",
    description: "Prohlédněte si aktuální obsazenost a dostupnost ploch v online rozvrhu.",
    cta: { label: "Prohlédnout rozvrh", href: "https://docs.google.com/spreadsheets/d/1UYiGZ2s9hdUi6H85loa3PgF9Naag0akC1rbcktIWMNY/edit#gid=1908510207", external: true },
  },
  {
    number: "2",
    title: "Potvrzení rezervace",
    description: "Kontaktujte nás telefonicky nebo emailem a potvrďte zvolený termín.",
    cta: { label: "Kontaktovat nás", href: "/kontakt" },
  },
  {
    number: "3",
    title: "Přijďte si zasportovat",
    description: "Platba při příchodu na recepci. 50 parkovacích míst přímo u haly zdarma.",
    cta: { label: "Kde nás najdete", href: "/kontakt" },
  },
];

export function ReservationSteps() {
  return (
    <section className="py-20">
      <Container>
        <SectionHeading subtitle="Rezervujte si sportoviště ve třech krocích">
          Rezervace
        </SectionHeading>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                {step.number}
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">{step.title}</h3>
              <p className="mb-4 text-sm text-muted">{step.description}</p>
              <Button
                href={step.cta.href}
                variant="outline"
                size="md"
                external={step.cta.external}
              >
                {step.cta.label}
              </Button>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
