import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HeroSection() {
  return (
    <section className="relative isolate flex h-[280px] items-center overflow-hidden bg-midnight sm:h-[320px] md:h-[360px] lg:h-[380px]">
      <Image
        src="https://i.ibb.co.com/m5zjpfKc/6fc1b179-f968-4eb0-9e5d-da7065e54e05.jpg"
        alt="Master barber grooming a client in a premium barbershop with warm gold lighting"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_25%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-midnight/90 via-midnight/70 to-midnight/30" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#C5A46D]" />
            <p className="text-xs uppercase tracking-[0.25em] text-[#C5A46D]">
              THE ART OF MODERN GROOMING
            </p>
          </div>
          <h1 className="mt-4 font-heading text-[32px] font-semibold leading-[1.05] text-white sm:text-[38px] md:text-[46px] lg:text-[56px]">
            LOOK SHARP.
            <span className="block text-[#C5A46D]">FEEL CONFIDENT.</span>
          </h1>
          <p className="mt-4 max-w-[540px] text-[16px] leading-[1.7] text-[#E0DDD6]">
            Experience premium grooming with expert barbers, personalized
            services, and a style that defines you. Your perfect look starts
            here.
          </p>
          <div className="mt-6">
            <Link
              href="/services"
              className={cn(
                buttonVariants({ size: "lg" }),
                "inline-flex h-11 items-center gap-2 rounded-full bg-[#C5A46D] px-8 text-base font-medium text-[#151515] hover:bg-[#AE8C56]"
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
