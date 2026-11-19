import type { Metadata } from "next"
import Link from "next/link"
import { ArrowUpRight, CalendarDays, ClipboardList, Scissors, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard — SalonBook",
}

const QUICK_LINKS = [
  {
    title: "Manage Services",
    href: "/admin/services",
    icon: Scissors,
    description: "Add, edit and publish every salon service.",
  },
  {
    title: "Manage Appointments",
    href: "/admin/appointments",
    icon: ClipboardList,
    description: "Review requests and keep bookings moving.",
  },
  {
    title: "Manage Users",
    href: "/admin/users",
    icon: Users,
    description: "Control customer accounts and access.",
  },
  {
    title: "New Booking",
    href: "/book-appointment",
    icon: CalendarDays,
    description: "See the booking flow exactly as customers do.",
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Midnight hero */}
      <section className="animate-rise relative overflow-hidden rounded-2xl border border-dark-border bg-midnight px-6 py-10 dark:bg-charcoal sm:px-10 sm:py-12">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full border border-gold/20"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-24 bottom-[-4rem] size-32 rotate-45 border border-gold/15"
        />

        <div className="relative max-w-2xl">
          <p className="flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">
            <span aria-hidden="true" className="h-px w-7 bg-gold/70" />
            SalonBook Admin
          </p>
          <h1 className="mt-4 font-heading text-3xl leading-tight font-semibold text-ivory sm:text-[2.75rem]">
            Good to see you back.
          </h1>
          <div aria-hidden="true" className="mt-4 h-px w-16 bg-gold/60" />
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#A9A49C]">
            Manage salons, services and bookings from here. The full analytics
            suite is still being polished — everything below is live today.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/admin/appointments"
              className="inline-flex h-10 items-center justify-center rounded-full bg-gold px-6 text-sm font-medium text-midnight transition-colors duration-200 hover:bg-gold-hover"
            >
              Review Appointments
            </Link>
            <Link
              href="/admin/services/new"
              className="inline-flex h-10 items-center justify-center rounded-full border border-dark-border px-6 text-sm font-medium text-ivory transition-colors duration-200 hover:border-gold/60 hover:text-gold"
            >
              Add a Service
            </Link>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_LINKS.map((link, i) => (
          <Link
            key={link.href}
            href={link.href}
            className="animate-rise group flex flex-col rounded-xl border border-border bg-card p-5 surface-raised transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:surface-floating focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:outline-none"
            style={{ animationDelay: `${(i + 1) * 70}ms` }}
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-105">
              <link.icon className="size-5" aria-hidden="true" />
            </span>
            <span className="mt-4 font-heading text-base font-medium text-foreground">
              {link.title}
            </span>
            <span className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
              {link.description}
            </span>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">
              Open
              <ArrowUpRight
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
