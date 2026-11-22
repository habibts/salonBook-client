"use client"

import { CalendarPlus, Shield, Clock, Crown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const benefits = [
  {
    icon: CalendarPlus,
    title: "Easy Online Booking",
    subtitle: "Book in seconds",
    description:
      "Reserve your preferred grooming service anytime, anywhere with our intuitive online booking system. No phone calls, no waiting — just a few clicks and you're scheduled.",
  },
  {
    icon: Shield,
    title: "Trusted Professionals",
    subtitle: "Certified experts",
    description:
      "Every barber and stylist on our platform is verified, experienced, and committed to delivering exceptional results. Your look is in skilled hands you can trust.",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    subtitle: "Your time, your way",
    description:
      "Early morning trims, late evening cuts, or weekend appointments — book slots that fit your schedule. Reschedule or cancel with ease up to 2 hours before.",
  },
  {
    icon: Crown,
    title: "Premium Service Experience",
    subtitle: "Elevated grooming",
    description:
      "From hot towel treatments to personalized consultations, every visit includes premium touches that transform a routine haircut into a relaxing, rejuvenating experience.",
  },
] as const

export function SalonBookBenefits() {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-soft-peach dark:bg-midnight">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-primary-rose dark:text-gold">
            WHY CHOOSE SALONBOOK
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold text-dark-text dark:text-white sm:text-4xl lg:text-5xl">
            The SalonBook
            <span className="text-primary-rose dark:text-gold"> Difference</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-text dark:text-champagne max-w-2xl mx-auto leading-relaxed">
            We combine expert craftsmanship with modern convenience to deliver a grooming experience that exceeds expectations.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => (
            <Card
              key={benefit.title}
              className="group relative overflow-hidden border border-soft-border bg-white hover:border-primary-rose/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 surface-raised animate-rise dark:border-dark-border dark:bg-charcoal"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-rose/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 dark:from-gold/5" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-text/5 via-transparent to-transparent dark:from-midnight/5" />
              <CardContent className="relative flex h-full flex-col p-6 sm:p-8">
                <div className="inline-flex size-14 items-center justify-center rounded-xl bg-primary-rose/10 text-primary-rose group-hover:bg-primary-rose group-hover:text-white transition-all duration-500 dark:bg-gold/10 dark:text-gold dark:group-hover:bg-gold dark:group-hover:text-midnight">
                  <benefit.icon className="size-7" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-heading text-xl font-semibold text-dark-text dark:text-white">
                  {benefit.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-primary-rose dark:text-gold">{benefit.subtitle}</p>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-text dark:text-champagne">
                  {benefit.description}
                </p>
                <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-primary-rose/30 to-transparent dark:via-gold/30" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}