import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Admin Dashboard — SalonBook",
}

export default function AdminDashboardPage() {
  return (
    <section className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-midnight px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-dark-border bg-charcoal p-8 text-center shadow-xl shadow-black/30 sm:p-10">
        <p className="font-heading text-xs font-semibold tracking-[0.3em] text-gold uppercase">
          SalonBook
        </p>
        <h1 className="mt-5 font-heading text-3xl font-semibold text-ivory">
          Admin Dashboard
        </h1>
        <div aria-hidden="true" className="mx-auto mt-4 h-px w-12 bg-gold/50" />
        <p className="mt-4 text-sm leading-relaxed text-[#A7A39C]">
          Manage salons, services, and bookings from here. This area is
          currently under construction — check back soon.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-10 items-center justify-center rounded-full bg-gold px-6 text-sm font-medium text-midnight transition-colors hover:bg-gold-hover"
        >
          Back to Home
        </Link>
      </div>
    </section>
  )
}
