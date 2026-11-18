"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
  { label: "Sign In", href: "/sign-in" },
]

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

export function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-dark-border bg-midnight/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/"
          aria-label="SalonBook — Home"
          className="font-heading text-xl font-semibold tracking-wide text-gold transition-colors hover:text-gold-hover"
        >
          SalonBook
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {navLinks.map((link) => {
            const active = isActivePath(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-2 text-sm font-medium transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:bg-gold after:transition-all after:duration-300",
                  active
                    ? "text-gold after:w-full"
                    : "text-ivory after:w-0 hover:text-gold hover:after:w-full"
                )}
              >
                {link.label}
              </Link>
            )
          })}
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-full bg-gold px-6 text-midnight hover:bg-gold-hover"
            )}
          >
            Sign Up
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-lg text-ivory transition-colors hover:bg-ivory/10 hover:text-gold md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="border-t border-dark-border bg-midnight/95 px-4 pt-3 pb-6 backdrop-blur-md sm:px-6 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActivePath(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={closeMenu}
                  className={cn(
                    "flex min-h-11 items-center rounded-lg px-4 text-sm font-medium transition-colors",
                    active
                      ? "bg-gold/10 text-gold"
                      : "text-ivory hover:bg-ivory/5 hover:text-gold"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
            <Link
              href="/sign-up"
              onClick={closeMenu}
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-3 h-11 rounded-full bg-gold text-base text-midnight hover:bg-gold-hover"
              )}
            >
              Sign Up
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
