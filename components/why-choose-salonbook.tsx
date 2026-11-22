import { CalendarCheck, Crown, Scissors, UserCheck } from "lucide-react"

const features = [
  { icon: Scissors, title: "Expert Barbers", desc: "Get the perfect look with skilled professionals who understand modern men's grooming." },
  { icon: Crown, title: "Premium Experience", desc: "Enjoy a comfortable and refined grooming experience in a stylish salon environment." },
  { icon: CalendarCheck, title: "Easy Online Booking", desc: "Book your preferred grooming service with just a few clicks, anytime and anywhere." },
  { icon: UserCheck, title: "Personalized Care", desc: "Find grooming services that match your personal style and preferences." },
]

export function WhyChooseSalonBook() {
  return (
    <section className="bg-[#151515] py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-[#C5A46D]">WHY CHOOSE SALONBOOK</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold text-[#F7F5F0] sm:text-4xl">
            More Than a Haircut. <span className="text-[#C5A46D]">It&apos;s an Experience.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#C7C2B9]">
            Discover a better grooming experience with expert professionals, premium services, and effortless online booking.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex h-full flex-col rounded-xl border border-[#3A3834] bg-[#292929] p-6 transition-colors hover:border-[#C5A46D]"
            >
              <f.icon className="size-8 text-[#C5A46D]" />
              <h3 className="mt-4 font-heading text-lg text-[#F7F5F0]">{f.title}</h3>
              <p className="mt-2 text-sm text-[#C7C2B9]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
