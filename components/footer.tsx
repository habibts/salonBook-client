"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Clock, Mail, MapPin, Phone } from "lucide-react"
import { fetchWithTimeout } from "@/lib/fetch"

const mutedText = "text-[#A7A39C]"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

interface Category {
  name: string
  count: number
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h2 className="font-heading text-sm font-semibold tracking-[0.2em] text-gold uppercase">
        {children}
      </h2>
      <span aria-hidden="true" className="mt-3 block h-px w-10 bg-gold/50" />
    </>
  )
}

function ContactRow({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-dark-border bg-charcoal text-gold"
      >
        {icon}
      </span>
      <div className={`min-w-0 pt-1.5 text-sm leading-relaxed ${mutedText}`}>
        {children}
      </div>
    </li>
  )
}

function ServiceCategoryLink({ category, onNavigate, currentCategory }: { category: string; onNavigate: () => void; currentCategory?: string }) {
  const isActive = currentCategory === category
  
  return (
    <Link
      href={`/services?category=${encodeURIComponent(category)}`}
      onClick={onNavigate}
      className={`text-sm transition-colors hover:text-gold ${mutedText} ${isActive ? "text-gold font-medium" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      {category}
    </Link>
  )
}

function HomeLink({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      router.push("/")
    }
    onNavigate()
  }

  return (
    <Link
      href="/"
      onClick={handleClick}
      className={`text-sm transition-colors hover:text-gold ${mutedText}`}
    >
      Home
    </Link>
  )
}

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  // Get current category from URL if on services page (client-side only)
  const [currentCategory, setCurrentCategory] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (pathname === "/services" && typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentCategory(new URLSearchParams(window.location.search).get("category") ?? undefined)
    }
  }, [pathname])

  const closeMobileMenu = () => {
    const mobileNav = document.getElementById("mobile-nav")
    if (mobileNav) {
      const event = new CustomEvent("close-mobile-menu")
      window.dispatchEvent(event)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function fetchCategories() {
      try {
        const res = await fetchWithTimeout(`${API_BASE}/services`, { cache: "no-store" })
        if (!res.ok) throw new Error("Failed to fetch services")
        const data = (await res.json()) as Array<{ category: string; status: string }>
        
        const activeServices = data.filter((s) => s.status === "active")
        const categoryMap = new Map<string, number>()
        activeServices.forEach((s) => {
          categoryMap.set(s.category, (categoryMap.get(s.category) ?? 0) + 1)
        })
        
        const categoryList = Array.from(categoryMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name))
        
        if (!cancelled) {
          setCategories(categoryList)
        }
      } catch {
        if (!cancelled) {
          setCategories([])
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false)
        }
      }
    }

    fetchCategories()
    return () => { cancelled = true }
  }, [])

  const handleNavigation = () => {
    closeMobileMenu()
    if (pathname !== "/") {
      router.push("/")
    }
  }

  const handleCategoryNavigate = (category: string) => {
    closeMobileMenu()
    if (pathname === "/services" && currentCategory === category) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <footer className="border-t border-dark-border bg-midnight">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-4 lg:gap-10">
          {/* Column 1 — Brand */}
          <div className="min-w-0">
            <Link
              href="/"
              onClick={handleNavigation}
              className="font-heading text-2xl font-semibold tracking-wide text-gold transition-colors hover:text-gold-hover"
            >
              SalonBook
            </Link>
            <p className={`mt-4 max-w-sm text-sm leading-relaxed ${mutedText}`}>
              Your destination for premium grooming and personalized salon
              experiences. Discover expert services and book your perfect
              appointment with ease.
            </p>
            <ul
              aria-label="Social media"
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              <li>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className={`flex size-9 cursor-pointer items-center justify-center rounded-full border border-dark-border bg-charcoal transition-colors hover:border-gold/60 hover:text-gold ${mutedText}`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-4 fill-current">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className={`flex size-9 cursor-pointer items-center justify-center rounded-full border border-dark-border bg-charcoal transition-colors hover:border-gold/60 hover:text-gold ${mutedText}`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-4 fill-current">
                    <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X"
                  className={`flex size-9 cursor-pointer items-center justify-center rounded-full border border-dark-border bg-charcoal transition-colors hover:border-gold/60 hover:text-gold ${mutedText}`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-4 fill-current">
                    <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className={`flex size-9 cursor-pointer items-center justify-center rounded-full border border-dark-border bg-charcoal transition-colors hover:border-gold/60 hover:text-gold ${mutedText}`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-4 fill-current">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2 — Useful Links */}
          <div className="min-w-0">
            <FooterHeading>Useful Links</FooterHeading>
            <nav aria-label="Useful links">
              <ul className="mt-6 space-y-3">
                <li>
                  <HomeLink onNavigate={handleNavigation} />
                </li>
                <li>
                  <Link
                    href="/services"
                    onClick={closeMobileMenu}
                    className={`text-sm transition-colors hover:text-gold ${mutedText}`}
                  >
                    Browse Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sign-in"
                    onClick={closeMobileMenu}
                    className={`text-sm transition-colors hover:text-gold ${mutedText}`}
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sign-up"
                    onClick={closeMobileMenu}
                    className={`text-sm transition-colors hover:text-gold ${mutedText}`}
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Column 3 — Services by Category */}
          <div className="min-w-0">
            <FooterHeading>Our Services</FooterHeading>
            <nav aria-label="Services by category">
              <ul className="mt-6 space-y-3">
                {loadingCategories ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <li key={i}>
                      <div className="h-5 w-3/4 animate-pulse bg-charcoal/50 rounded" />
                    </li>
                  ))
                ) : categories.length === 0 ? (
                  <li>
                    <span className={`text-sm ${mutedText}`}>No categories available</span>
                  </li>
                ) : (
                  categories.map((cat) => (
                    <li key={cat.name}>
                      <ServiceCategoryLink
                        category={cat.name}
                        onNavigate={() => handleCategoryNavigate(cat.name)}
                        currentCategory={currentCategory ?? undefined}
                      />
                    </li>
                  ))
                )}
              </ul>
            </nav>
          </div>

          {/* Column 4 — Contact Information */}
          <div className="min-w-0">
            <FooterHeading>Contact Information</FooterHeading>
            <ul className="mt-6 space-y-4">
              <ContactRow icon={<Phone className="size-4" />}>
                <a
                  href="tel:01303556666"
                  className="transition-colors hover:text-gold"
                >
                  01303556666
                </a>
              </ContactRow>
              <ContactRow icon={<Mail className="size-4" />}>
                <a
                  href="mailto:support@salonbook.com"
                  className="break-all transition-colors hover:text-gold"
                >
                  support@salonbook.com
                </a>
              </ContactRow>
              <ContactRow icon={<MapPin className="size-4" />}>
                <span>Dhaka, Bangladesh</span>
              </ContactRow>
              <ContactRow icon={<Clock className="size-4" />}>
                <span className="block font-medium text-ivory">
                  Opening Hours
                </span>
                <span className="block">
                  Saturday – Thursday: 10:00 AM – 9:00 PM
                </span>
                <span className="block">Friday: 2:00 PM – 9:00 PM</span>
              </ContactRow>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-dark-border pt-6 sm:mt-16 sm:flex-row">
          <p className={`text-xs sm:text-sm ${mutedText}`}>
            © 2026 SalonBook. All rights reserved.
          </p>
          <p
            className={`text-center text-xs sm:text-sm ${mutedText} sm:text-right`}
          >
            Designed for a premium grooming experience.
          </p>
        </div>
      </div>
    </footer>
  )
}