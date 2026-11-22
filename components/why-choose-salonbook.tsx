import { CalendarCheck, Crown, Scissors, UserCheck } from "lucide-react"

const features = [
  { icon: Scissors, title: "Expert Barbers", desc: "Get the perfect look with skilled professionals who understand modern men's grooming." },
  { icon: Crown, title: "Premium Experience", desc: "Enjoy a comfortable and refined grooming experience in a stylish salon environment." },
  { icon: CalendarCheck, title: "Easy Online Booking", desc: "Book your preferred grooming service with just a few clicks, anytime and anywhere." },
  { icon: UserCheck, title: "Personalized Care", desc: "Find grooming services that match your personal style and preferences." },
]

export function WhyChooseSalonBook() {
  return (
    <section id="why-choose-salonbook" className="bg-warm-cream py-12 md:py-16 lg:py-20 dark:bg-midnight">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-primary-rose dark:text-gold">WHY CHOOSE SALONBOOK</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold text-dark-text dark:text-white sm:text-4xl">
            More Than a Haircut. <span className="text-primary-rose dark:text-gold">It&apos;s an Experience.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-text dark:text-champagne">
            Discover a better grooming experience with expert professionals, premium services, and effortless online booking.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group flex h-full flex-col rounded-xl border border-soft-border bg-white p-6 transition-all duration-500 hover:border-primary-rose/50 hover:shadow-xl hover:-translate-y-1 surface-raised dark:border-dark-border dark:bg-charcoal"
            >
              <div className="inline-flex size-12 items-center justify-center rounded-xl bg-primary-rose/10 text-primary-rose group-hover:bg-primary-rose group-hover:text-white transition-all duration-500 dark:bg-gold/10 dark:text-gold dark:group-hover:bg-gold dark:group-hover:text-midnight">
                <f.icon className="size-6" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-heading text-lg text-dark-text dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-text dark:text-champagne">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}