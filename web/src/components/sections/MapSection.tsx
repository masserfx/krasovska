import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONTACT } from "@/lib/constants";

export function MapSection() {
  return (
    <section className="py-20">
      <Container>
        <SectionHeading subtitle={`${CONTACT.street}, ${CONTACT.city}`}>
          Kde nás najdete
        </SectionHeading>

        {/* Static map image — click opens Google Maps */}
        <a
          href={CONTACT.googleMaps}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-2xl border border-border shadow-lg transition-shadow hover:shadow-xl"
        >
          <Image
            src="/mapa-krasovska.png"
            alt="Mapa — Sportovní hala Krašovská, Plzeň-Bolevec"
            width={1200}
            height={500}
            className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1100px"
            priority
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/10">
            <span className="flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-semibold text-primary opacity-0 shadow-lg backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Otevřít v Google Maps
            </span>
          </div>
        </a>

        <div className="mt-6 flex items-center justify-center gap-6">
          <a
            href={CONTACT.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Navigovat do haly
          </a>
          <a
            href={`tel:${CONTACT.phone}`}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            {CONTACT.phoneDisplay}
          </a>
        </div>
      </Container>
    </section>
  );
}
