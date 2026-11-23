import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[32rem] items-center overflow-hidden bg-midnight sm:min-h-[36rem] lg:min-h-[40rem]">
      <Image
        src="https://i.ibb.co.com/m5zjpfKc/6fc1b179-f968-4eb0-9e5d-da7065e54e05.jpg"
        alt="Master barber grooming a client in a premium barbershop with warm gold lighting"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_25%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-midnight via-midnight/85 to-midnight/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-midnight/75 via-transparent to-midnight/15" />
      <div aria-hidden="true" className="absolute -right-24 -bottom-32 size-96 rounded-full border border-gold/25" />
      <div aria-hidden="true" className="absolute -right-8 -bottom-16 size-64 rounded-full border border-champagne/20" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl py-16 sm:py-20">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-gold" />
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              THE ART OF MODERN GROOMING
            </p>
          </div>
          <h1 className="mt-5 max-w-xl font-heading text-4xl font-semibold leading-[1.03] text-ivory sm:text-5xl lg:text-6xl">
            LOOK SHARP.
            <span className="block text-gold">FEEL CONFIDENT.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-champagne sm:text-lg">
            Experience premium grooming with expert barbers, personalized
            services, and a style that defines you. Your perfect look starts
            here.
          </p>
          <div className="mt-8">
            <Link
              href="/services"
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex h-12 items-center gap-2 rounded-full bg-gold px-7 text-base font-semibold text-midnight hover:bg-gold-hover hover:shadow-lg hover:shadow-gold/20"
              )}
            >
              Explore Salon Services
              <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
