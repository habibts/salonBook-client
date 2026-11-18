import Link from "next/link"
import Image from "next/image"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-midnight">
      {/* Background photograph */}
      <Image
        src="/images/hero-barbershop.jpg"
        alt="Master barber grooming a client in a premium barbershop with warm gold lighting"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Cinematic dark overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/85 to-midnight/30" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="max-w-2xl">
          <h1 className="font-heading text-5xl font-bold tracking-wide text-white sm:text-6xl lg:text-7xl">
            LOOK SHARP.
            <span className="block text-gold">FEEL CONFIDENT.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ivory sm:text-lg sm:leading-relaxed">
            Experience premium grooming with expert barbers, personalized
            services, and a style that defines you. Your perfect look starts
            here.
          </p>
          <div className="mt-10">
            <Link
              href="/services"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 rounded-full bg-gold px-8 text-base font-medium text-midnight hover:bg-gold-hover"
              )}
            >
              Explore Salon Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
