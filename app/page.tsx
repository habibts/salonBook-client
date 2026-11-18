import { HeroSection } from "@/components/hero-section"
import { FeaturedServices } from "@/components/featured-services"
import { ServiceCategories } from "@/components/service-categories"
import { WhyChooseSalonBook } from "@/components/why-choose-salonbook"

export default function Page() {
  return (
    <main>
      <HeroSection />
      <FeaturedServices />
      <ServiceCategories />
      <WhyChooseSalonBook />
    </main>
  )
}
