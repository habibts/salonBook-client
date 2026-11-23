"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { LayoutDashboard, LogOut, Menu, User, X, ChevronDown } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient, clearJWT } from "@/lib/auth-client"
import { expressLogout } from "@/lib/express-api"
import { useTokenStore } from "@/lib/token-store"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"
import { showSuccess, showError } from "@/lib/toast"

const publicLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Why Choose SalonBook?", href: "#why-choose-salonbook" },
]

/*
 * The current Better Auth session does not expose a role field (verified in
 * lib/auth.ts, the codebase, and the MongoDB user documents), so every
 * signed-in user is treated as a Customer. When a role field is added to the
 * session later, resolve it here — this is the only place that must change.
 */
type Role = "customer" | "admin"
const ACTIVE_ROLE = "customer" as Role
const dashboardHrefs: Record<Role, string> = {
  customer: "/customer/dashboard",
  admin: "/admin/dashboard",
}
const dashboardHref = dashboardHrefs[ACTIVE_ROLE]

type SessionUser = NonNullable<
  ReturnType<typeof authClient.useSession>["data"]
>["user"]

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}

function useAnchorActive(href: string) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!href.startsWith("#")) return

    const element = document.querySelector(href)
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting)
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [href])

  return isActive
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
  return initials || "?"
}

function AccountMenu({ user }: { user: SessionUser }) {
  const router = useRouter()
  const { tokenData, clearTokenData } = useTokenStore()
  const [signingOut, setSigningOut] = useState(false)

  // Determine role from tokenData (which has the role from JWT)
  const userRole = tokenData?.user?.role ?? "Customer"

  async function handleSignOut() {
    if (signingOut) return
    setSigningOut(true)

    try {
      const token = tokenData?.token
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/")
          },
        },
      })
      await clearJWT()
      if (token) {
        await expressLogout(token)
      }
      clearTokenData()
      showSuccess({ title: "Logged Out Successfully", description: "You have been safely signed out." })
    } catch {
      showError({ title: "Sign Out Failed", description: "Unable to sign out. Please try again." })
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        aria-label="Open account menu"
        className="group flex items-center gap-2 rounded-full p-0.5 outline-none transition-colors hover:bg-ivory/5 focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight"
      >
        <Avatar className="ring-2 ring-dark-border transition-all duration-300 group-hover:ring-gold/60">
          {user.image ? (
            <AvatarImage src={user.image} alt={`${user.name}'s avatar`} />
          ) : null}
          <AvatarFallback className="bg-charcoal text-gold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="size-4 text-ivory/70 transition-transform duration-300 group-data-[state=open]:rotate-180 group-hover:text-gold" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-64 rounded-2xl border border-dark-border bg-charcoal p-2 text-ivory shadow-2xl shadow-midnight/50 ring-1 ring-gold/10"
      >
        {/* User info header */}
        <div className="border-b border-dark-border px-2.5 py-3.5">
          <p className="truncate font-medium text-ivory">{user.name}</p>
          <p className="text-xs text-ivory/60 truncate">{user.email}</p>
          <p className="text-xs text-champagne capitalize">{userRole}</p>
        </div>
        <DropdownMenuItem
          closeOnClick
          onClick={() => router.push(dashboardHref)}
          className="cursor-pointer gap-2.5 px-2.5 py-2.5 text-ivory transition-colors hover:bg-gold/10 hover:text-gold focus:bg-gold/10 focus:text-gold"
        >
          <LayoutDashboard />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem
          closeOnClick
          onClick={() => router.push("/customer/profile")}
          className="cursor-pointer gap-2.5 px-2.5 py-2.5 text-ivory transition-colors hover:bg-gold/10 hover:text-gold focus:bg-gold/10 focus:text-gold"
        >
          <User />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-dark-border" />
        <DropdownMenuItem
          closeOnClick
          onClick={handleSignOut}
          disabled={signingOut}
          className="cursor-pointer gap-2.5 px-2.5 py-2.5 text-ivory transition-colors hover:bg-gold/10 hover:text-gold focus:bg-gold/10 focus:text-gold disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut />
          {signingOut ? (
            <>
              <Spinner className="size-4" />
              Signing Out…
            </>
          ) : (
            "Sign Out"
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ScrollLink({ href, label, active, onClick, isAnchorActive }: { href: string; label: string; active: boolean; onClick?: () => void; isAnchorActive?: boolean }) {
  const isAnchor = href.startsWith("#")
  const combinedActive = active || isAnchorActive

  if (isAnchor) {
    return (
      <a
        href={href}
        onClick={(e) => {
          e.preventDefault()
          const target = document.querySelector(href)
          if (target) {
            target.scrollIntoView({ behavior: "smooth" })
          }
          onClick?.()
        }}
        aria-current={combinedActive ? "page" : undefined}
        className={cn(
          "relative rounded-md px-1 py-2 text-sm font-medium transition-colors after:absolute after:-bottom-0.5 after:left-1 after:h-px after:bg-gold after:transition-all after:duration-300 cursor-pointer focus-visible:bg-gold/10",
          combinedActive
            ? "text-gold after:w-full"
            : "text-ivory after:w-0 hover:text-gold hover:after:w-full"
        )}
      >
        {label}
      </a>
    )
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={combinedActive ? "page" : undefined}
      className={cn(
        "relative rounded-md px-1 py-2 text-sm font-medium transition-colors after:absolute after:-bottom-0.5 after:left-1 after:h-px after:bg-gold after:transition-all after:duration-300 focus-visible:bg-gold/10",
        combinedActive
          ? "text-gold after:w-full"
          : "text-ivory after:w-0 hover:text-gold hover:after:w-full"
      )}
    >
      {label}
    </Link>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  const { data: session, isPending } = authClient.useSession()
  const user = session?.user ?? null
  const showAuthLinks = !isPending && user === null

  const whyChooseActive = useAnchorActive("#why-choose-salonbook")

  return (
    <header className="sticky top-0 z-50 border-b border-dark-border bg-midnight/95 shadow-[0_10px_30px_-24px_var(--midnight)] backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* LEFT: SalonBook logo */}
        <Link
          href="/"
          aria-label="SalonBook — Home"
          className="group flex shrink-0 items-center gap-2.5 rounded-lg font-heading text-xl font-semibold tracking-wide text-gold transition-colors hover:text-champagne focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-lg border border-gold/35 bg-gold/10 text-sm transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-midnight">S</span>
          <span>SalonBook</span>
        </Link>

        {/* CENTER: Navigation links - hidden on mobile, shown on desktop */}
        <nav
          aria-label="Main navigation"
          className="hidden flex-1 items-center justify-center gap-5 md:flex lg:gap-8"
        >
          {publicLinks.map((link) => {
            const active = isActivePath(pathname, link.href)
            const isAnchorActive = link.href === "#why-choose-salonbook" ? whyChooseActive : false
            return (
              <ScrollLink
                key={link.href}
                href={link.href}
                label={link.label}
                active={active}
                isAnchorActive={isAnchorActive}
                onClick={closeMenu}
              />
            )
          })}
        </nav>

        {/* RIGHT: Auth buttons / user menu + Mobile hamburger */}
        <div className="flex shrink-0 items-center justify-end gap-3">
          {isPending ? (
            <span
              aria-hidden="true"
              className="size-8 shrink-0 animate-pulse rounded-full border border-dark-border bg-charcoal/60"
            />
          ) : user ? (
            <AccountMenu user={user} />
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden rounded-md px-1 py-2 text-sm font-medium text-ivory transition-colors hover:text-gold focus-visible:bg-gold/10 sm:inline-block"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "hidden h-10 rounded-full bg-gold px-5 text-midnight hover:bg-gold-hover hover:shadow-lg hover:shadow-gold/15 sm:inline-flex"
                )}
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-xl border border-transparent text-ivory transition-colors hover:border-gold/25 hover:bg-ivory/10 hover:text-gold md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="border-t border-dark-border bg-midnight/98 px-4 pt-3 pb-6 shadow-2xl shadow-midnight/30 backdrop-blur-xl md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {publicLinks.map((link) => {
              const active = isActivePath(pathname, link.href)
              const isAnchorActive = link.href === "#why-choose-salonbook" ? whyChooseActive : false
              return (
                <ScrollLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  active={active}
                  isAnchorActive={isAnchorActive}
                  onClick={closeMenu}
                />
              )
            })}
            {showAuthLinks && (
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
            )}
            {!showAuthLinks && user && (
              <>
                <Link
                  href="/customer/profile"
                  onClick={closeMenu}
                  className="mt-2 flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-ivory transition-colors hover:bg-gold/10 hover:text-gold"
                >
                  <User className="size-4" />
                  Profile
                </Link>
                <Link
                  href="/customer/dashboard"
                  onClick={closeMenu}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2.5 text-ivory transition-colors hover:bg-gold/10 hover:text-gold"
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
