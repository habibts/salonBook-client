"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Home, Scissors, Sparkles } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFound() {
  const router = useRouter()

  function handleGoBack() {
    // router.back() silently does nothing if there is no history entry,
    // so fall back to Home to guarantee a working navigation path.
    router.back()
    setTimeout(() => router.push("/"), 100)
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-ivory text-midnight px-4 sm:px-6 lg:px-8 pt-20 pb-12"
      role="main"
      aria-label="Page not found"
    >
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left: message & actions */}
        <div className="space-y-6 lg:text-left text-center lg:text-left">
          <div className="flex items-center justify-center gap-2 lg:justify-start">
            <Link
              href="/"
              className="font-heading text-xl font-semibold tracking-wide text-gold transition-colors hover:text-gold-hover"
              aria-label="SalonBook — Home"
            >
              SalonBook
            </Link>
          </div>

          <div className="relative inline-block">
            <h1
              className={cn(
                "font-heading text-[12rem] font-semibold tracking-tighter text-midnight/5 leading-none select-none",
                "lg:text-[14rem]"
              )}
              aria-hidden="true"
            >
              404
            </h1>
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-1 h-[240px] bg-champagne/40 rounded-full opacity-50 lg:-top-20 lg:w-[300px]" />
          </div>

          <h2 className="font-heading text-3xl font-semibold text-midnight tracking-tight lg:text-4xl">
            Oops! This page has gone missing.
          </h2>

          <p className="text-lg text-muted-gray leading-relaxed max-w-lg mx-auto lg:mx-0 lg:text-left">
            The page you&rsquo;re looking for may have moved, been removed, or is no longer available.
            Let&rsquo;s help you find your perfect beauty experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
            <Link
              href="/"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-auto flex items-center justify-center gap-1.5"
              )}
            >
              <Home className="size-4" aria-hidden="true" />
              Back to Home
            </Link>
            <Link
              href="/services"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-auto flex items-center justify-center gap-1.5"
              )}
            >
              <Scissors className="size-4" aria-hidden="true" />
              Explore Services
            </Link>
          </div>

          <button
            type="button"
            onClick={handleGoBack}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-hover transition-colors underline underline-offset-4"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Go Back
          </button>
        </div>

        {/* Right: decorative visual */}
        <div className="hidden lg:flex flex-col items-center justify-center gap-6">
          <div className="relative w-48 h-64">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                width="200"
                height="260"
                viewBox="0 0 200 260"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gold/20 drop-shadow-[0_8px_24px_rgba(184,149,90,0.15)] animate-[float_6s_ease-in-out-infinite]"
              >
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {/* Ornamental outer ring */}
                <ellipse
                  cx="100"
                  cy="130"
                  rx="88"
                  ry="108"
                  stroke="url(#goldGradient)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="8 4"
                  className="text-gold/40"
                />
                {/* Scissors motif */}
                <path
                  d="M 50 160 Q 70 140 100 140 Q 130 140 150 160 L 150 190 Q 145 210 120 220 Q 100 230 80 220 Q 55 210 50 190 Z"
                  stroke="url(#goldGradient)"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                />
                <path
                  d="M 100 140 L 100 80 Q 100 50 130 50 Q 160 50 160 80"
                  stroke="url(#goldGradient)"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                />
                <path
                  d="M 100 140 L 100 80 Q 100 50 70 50 Q 40 50 40 80"
                  stroke="url(#goldGradient)"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#glow)"
                />
                {/* Decorative sparkles */}
                <circle cx="30" cy="60" r="2" fill="var(--gold)" opacity="0.6" />
                <circle cx="170" cy="200" r="2.5" fill="var(--gold)" opacity="0.5" />
                <circle cx="70" cy="210" r="1.5" fill="var(--gold)" opacity="0.4" />
                <circle cx="130" cy="40" r="2" fill="var(--gold)" opacity="0.5" />
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B8955A" />
                  <stop offset="100%" stopColor="#E8D8B9" />
                </linearGradient>
              </svg>
            </div>
            <div className="w-full h-px bg-hairline/40 mx-4" />
            <Sparkles className="size-4 text-gold/50" />
          </div>
        </div>
      </div>

      <div className="mt-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-gray">
          SalonBook &mdash; Premium grooming experiences
        </p>
      </div>
    </main>
  )
}
