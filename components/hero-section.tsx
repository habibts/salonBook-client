import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[30rem] items-center overflow-hidden bg-midnight sm:min-h-[34rem] lg:min-h-[38rem]">
      <Image
        src="https://i.ibb.co.com/m5zjpfKc/6fc1b179-f968-4eb0-9e5d-da7065e54e05.jpg"
        alt="Master barber grooming a client in a premium barbershop with warm gold lighting"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_25%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/85 to-midnight/25" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-gold" />
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              THE ART OF MODERN GROOMING
            </p>
          </div>
          <h1 className="mt-5 font-heading text-4xl font-semibold leading-[1.05] text-ivory sm:text-5xl lg:text-6xl">
            LOOK SHARP.
            <span className="block text-gold">FEEL CONFIDENT.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-champagne sm:text-lg">
            Experience premium grooming with expert barbers, personalized
            services, and a style that defines you. Your perfect look starts
            here.
          </p>
          <div className="mt-6">
            <Link
              href="/services"
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex h-12 items-center gap-2 rounded-full bg-gold px-7 text-base font-semibold text-midnight hover:bg-gold-hover"
              )}
            >
              Explore Salon Services
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
