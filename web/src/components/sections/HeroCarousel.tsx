"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { IMAGES } from "@/lib/constants";

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const slides = IMAGES.hero;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden bg-primary-dark">
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
      ))}

      <div className="relative z-10 flex h-full items-center justify-center text-center text-white">
        <div className="max-w-3xl px-4">
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Sportovní hala
            <br />
            <span className="text-white/90">Krašovská</span>
          </h1>
          <p className="mt-4 text-lg text-white/80 sm:text-xl">
            9 badmintonových kurtů · Víceúčelová plocha 77×24 m · Cvičební sál · Bistro
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button href="/rezervace" size="lg">
              Rezervovat plochu
            </Button>
            <Button href="/cenik" variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
              Zobrazit ceník
            </Button>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${
              i === current ? "w-8 bg-white" : "w-2 bg-white/50"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
