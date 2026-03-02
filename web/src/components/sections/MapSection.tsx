"use client";

import { useState } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONTACT } from "@/lib/constants";

export function MapSection() {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <section className="py-20">
      <Container>
        <SectionHeading subtitle={`${CONTACT.street}, ${CONTACT.city}`}>
          Kde nás najdete
        </SectionHeading>

        <div className="relative overflow-hidden rounded-2xl border border-border shadow-lg">
          {/* Google Maps iframe */}
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2581.5!2d13.3558!3d49.7791!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470af29d3b8f5555%3A0x3f5e7c3c7c7c7c7c!2sSportovn%C3%AD%20hala%20Kra%C5%A1ovsk%C3%A1!5e0!3m2!1scs!2scz!4v1700000000000"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Sportovní hala Krašovská na mapě"
          />

          {/* Pin overlay — pointer-events-none lets map interaction through */}
          <div className="pointer-events-none absolute inset-0 z-20">
            {/* Centrovací wrapper pro pin */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {/* Pulzující kruhy */}
              <span className="absolute left-1/2 top-1/2 inline-flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-primary/20" />
              <span
                className="absolute left-1/2 top-1/2 inline-flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10"
                style={{ animation: "pulse-ring 2s ease-out infinite" }}
              />

              {/* Pin — clickable, opens Google Maps */}
              <a
                href={CONTACT.googleMaps}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto relative -mt-14 flex cursor-pointer flex-col items-center"
                style={{ animation: "pin-bounce 2s ease-in-out infinite" }}
                aria-label="Otevřít mapu v Google Maps"
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
              >
                <svg
                  width="48"
                  height="64"
                  viewBox="0 0 48 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-lg"
                >
                  <path
                    d="M24 0C10.745 0 0 10.745 0 24c0 18 24 40 24 40s24-22 24-40C48 10.745 37.255 0 24 0z"
                    fill="#003d91"
                  />
                  <circle cx="24" cy="22" r="14" fill="white" />
                  <text
                    x="24"
                    y="28"
                    textAnchor="middle"
                    fontFamily="system-ui, sans-serif"
                    fontSize="18"
                    fontWeight="bold"
                    fill="#003d91"
                  >
                    K
                  </text>
                  <ellipse cx="17" cy="14" rx="6" ry="4" fill="white" opacity="0.3" transform="rotate(-20 17 14)" />
                </svg>
                {/* Pin shadow */}
                <div
                  className="mt-[-4px] h-2 w-6 rounded-full bg-black/20 blur-[2px]"
                  style={{ animation: "pin-shadow 2s ease-in-out infinite" }}
                />
              </a>

              {/* Tooltip */}
              <div
                className={`pointer-events-none absolute bottom-full left-1/2 mb-3 w-72 -translate-x-1/2 transition-all duration-200 ${
                  tooltipVisible
                    ? "visible translate-y-0 opacity-100"
                    : "invisible translate-y-2 opacity-0"
                }`}
              >
                <div className="overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
                  {/* Thumbnail */}
                  <div className="relative h-32 w-full">
                    <Image
                      src="/images/hero/hala-zvenku.jpg"
                      alt="Sportovní hala Krašovská — pohled zvenku"
                      fill
                      className="object-cover"
                      sizes="288px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-2 left-3 text-xs font-semibold text-white/90">
                      Krašovská 32, Plzeň-Bolevec
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-foreground">
                      Sportovní hala Krašovská
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                        </svg>
                        {CONTACT.phoneDisplay}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                        </svg>
                        7:00–22:00
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 10l2-6h10l2 6M3 10h18v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2z" /><path d="M6 14v4m12-4v4" />
                      </svg>
                      50 parkovacích míst zdarma
                    </div>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      Otevřít v Google Maps
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
                {/* Tooltip arrow */}
                <div className="absolute left-1/2 -translate-x-1/2">
                  <div className="h-3 w-3 rotate-45 bg-white shadow-sm ring-1 ring-black/5" />
                </div>
              </div>
            </div>
          </div>
        </div>

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

      {/* CSS animations */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        }
        @keyframes pin-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pin-shadow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(0.7); opacity: 0.35; }
        }
      `}</style>
    </section>
  );
}
