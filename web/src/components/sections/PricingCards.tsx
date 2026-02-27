import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { PRICING } from "@/lib/constants";

type PricingFilter = "badminton" | "plocha" | "sal";

export function PricingCards({ filter }: { filter?: PricingFilter }) {
  const items = filter
    ? { [filter]: PRICING[filter] }
    : PRICING;

  return (
    <section className="bg-surface py-20">
      <Container>
        {!filter && (
          <SectionHeading subtitle="Ceny platné od 1. 1. 2026 včetně DPH">
            Ceník
          </SectionHeading>
        )}

        <div className={`grid gap-8 ${filter ? "" : "md:grid-cols-3"}`}>
          {Object.values(items).map((service) => (
            <div
              key={service.title}
              className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
            >
              <div className="bg-primary px-6 py-4">
                <h3 className="text-lg font-bold text-white">{service.title}</h3>
              </div>
              <div className="p-6">
                <table className="w-full">
                  <tbody>
                    {service.rows.map((row) => (
                      <tr key={row.label} className="border-b border-border last:border-0">
                        <td className="py-3 text-sm text-muted">{row.label}</td>
                        <td className="py-3 text-right">
                          <span className="font-bold text-foreground">{row.price}</span>
                          {"memberPrice" in row && row.memberPrice && (
                            <div className="text-xs text-primary">
                              člen: {row.memberPrice}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filter && (
                  <div className="mt-4 text-center">
                    <Button href="/rezervace" variant="outline" size="md">
                      Rezervovat
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {!filter && (
          <p className="mt-6 text-center text-sm text-muted">
            * Zvýhodněná cena pro držitele členské karty
          </p>
        )}
      </Container>
    </section>
  );
}
