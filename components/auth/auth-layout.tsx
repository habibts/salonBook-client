import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import { GoogleButton } from "@/components/auth/google-button"

function AuthLayout({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-midnight lg:grid lg:grid-cols-2">
      {/* Subtle decorative gold glow (mobile / tablet) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(197,164,109,0.12),transparent_55%)] lg:hidden"
      />

      {/* Form panel */}
      <div className="relative flex min-h-full items-center justify-center p-4 py-12 sm:px-6 lg:p-10">
        <div className="w-full max-w-md rounded-2xl border border-champagne bg-white p-6 shadow-xl shadow-black/30 sm:p-8">
          <div className="text-center">
            <Link
              href="/"
              aria-label="SalonBook — Home"
              className="inline-block font-heading text-2xl font-semibold tracking-wide text-gold"
            >
              SalonBook
            </Link>
            <h1 className="mt-6 font-heading text-3xl font-semibold text-midnight">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-gray">
              {description}
            </p>
          </div>

          <div className="mt-8">{children}</div>

          <div className="my-6 flex items-center gap-3">
            <span aria-hidden="true" className="h-px flex-1 bg-champagne" />
            <span className="text-xs font-medium tracking-wider text-muted-gray uppercase">
              or
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-champagne" />
          </div>

          <GoogleButton />

          <div className="mt-6 text-center text-sm text-muted-gray">
            {footer}
          </div>
        </div>
      </div>

      {/* Salon imagery panel (desktop) */}
      <div className="relative h-full hidden lg:block">
        <Image
          src="/images/hero-barbershop.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="50vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/30 to-midnight/50"
        />
        <div className="relative flex h-full flex-col justify-end p-10 xl:p-14">
          <p className="font-heading text-3xl font-semibold leading-snug text-ivory">
            LOOK SHARP.{" "}
            <span className="text-gold">FEEL CONFIDENT.</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export { AuthLayout }
