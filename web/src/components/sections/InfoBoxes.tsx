import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const infoItems = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" /><path d="M8 12l3 3 5-5" />
      </svg>
    ),
    title: "Sportovní vybavení",
    description: "V recepci lze zapůjčit nebo zakoupit badmintonové rakety, míčky a další sportovní vybavení.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 3v18" />
      </svg>
    ),
    title: "Taraflex® povrch",
    description: "Moderní sportovní povrch Taraflex® od Gerflor na dřevěném roštu — šetrný ke kloubům a svalům.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
      </svg>
    ),
    title: "Platby",
    description: "Přijímáme platby v hotovosti. Připravujeme platební terminál a online rezervační systém.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 10l2-6h10l2 6M3 10h18v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z" /><path d="M6 14v4m12-4v4" />
      </svg>
    ),
    title: "Parkování zdarma",
    description: "Pro návštěvníky haly 50 parkovacích míst přímo u vstupu zcela zdarma.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 20V10a2 2 0 012-2h12a2 2 0 012 2v10M12 4v4M8 8l4-4 4 4" />
      </svg>
    ),
    title: "Sálová obuv",
    description: "Vstup na hrací plochu výhradně v sálové obuvi se světlou a tvrdou podrážkou.",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
    ),
    title: "Vratná záloha",
    description: "Vratná záloha 100 Kč za elektronický čip k šatně a skříňce.",
  },
];

export function InfoBoxes() {
  return (
    <section className="bg-surface py-20">
      <Container>
        <SectionHeading subtitle="Důležité informace pro návštěvníky haly">
          Pro návštěvníky
        </SectionHeading>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {infoItems.map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-white p-6">
              <div className="mb-3 text-primary">{item.icon}</div>
              <h3 className="mb-2 font-bold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
