import { HeroSection } from "@/components/hero-section"
import { FeaturedServices } from "@/components/featured-services"
import { ServiceCategories } from "@/components/service-categories"

export default function Page() {
  return (
    <main>
      <HeroSection />
      <ServiceCategories />
      <FeaturedServices />
    </main>
  )
}
