import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { PricingCards } from "@/components/sections/PricingCards";
import { ReservationSteps } from "@/components/sections/ReservationSteps";
import { InfoBoxes } from "@/components/sections/InfoBoxes";
import { MapSection } from "@/components/sections/MapSection";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <ServicesGrid />
      <PricingCards />
      <ReservationSteps />
      <InfoBoxes />
      <MapSection />
    </>
  );
}
