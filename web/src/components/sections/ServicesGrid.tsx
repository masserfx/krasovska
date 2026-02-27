import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IMAGES } from "@/lib/constants";

const services = [
  {
    title: "Badminton",
    description: "9 profesionálních kurtů s povrchem Taraflex® od Gerflor. Zapůjčení raket a míčků na recepci.",
    href: "/badminton",
    image: IMAGES.services.badminton,
    price: "od 180 Kč/hod",
  },
  {
    title: "Víceúčelová plocha",
    description: "Plocha 77×24 m pro florbal, volejbal, futsal, nohejbal a další kolektivní sporty.",
    href: "/viceucelova-plocha",
    image: IMAGES.services.plocha,
    price: "od 900 Kč/hod",
  },
  {
    title: "Cvičební sál",
    description: "Sál pro skupinové lekce, jógu, pilates, bojové sporty a fitness tréninky.",
    href: "/cvicebni-sal",
    image: IMAGES.services.sal,
    price: "od 350 Kč/hod",
  },
];

export function ServicesGrid() {
  return (
    <section className="py-20">
      <Container>
        <SectionHeading subtitle="Vyberte si sportoviště, které vám vyhovuje">
          Naše služby
        </SectionHeading>

        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={service.image.src}
                  alt={service.image.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">{service.title}</h3>
                  <span className="text-sm font-semibold text-primary">{service.price}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{service.description}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-primary group-hover:underline">
                  Více informací →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
