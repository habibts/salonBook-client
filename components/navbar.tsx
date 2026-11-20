"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { LayoutDashboard, LogOut, Menu, User, X } from "lucide-react"

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

const publicLinks = [
  { label: "Home", href: "/" },
  { label: "Browse Services", href: "/services" },
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

  async function handleSignOut() {
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
    } catch {
      // Sign-out failed — the session stays active and the Navbar is unchanged.
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        aria-label="Open account menu"
        className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight"
      >
        <Avatar className="ring-2 ring-dark-border transition-shadow hover:ring-gold/50">
          {user.image ? (
            <AvatarImage src={user.image} alt={`${user.name}'s avatar`} />
          ) : null}
          <AvatarFallback className="bg-charcoal text-gold">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-56 rounded-xl border border-dark-border bg-charcoal p-1.5 text-ivory shadow-xl shadow-black/40 ring-dark-border"
      >
        <DropdownMenuItem
          closeOnClick
          onClick={() => router.push(dashboardHref)}
          className="cursor-pointer gap-2.5 px-2.5 py-2 text-ivory hover:bg-gold/10 hover:text-gold focus:bg-gold/10 focus:text-gold"
        >
          <LayoutDashboard />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem
          closeOnClick
          onClick={() => router.push("/customer/profile")}
          className="cursor-pointer gap-2.5 px-2.5 py-2 text-ivory hover:bg-gold/10 hover:text-gold focus:bg-gold/10 focus:text-gold"
        >
          <User />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-dark-border" />
        <DropdownMenuItem
          closeOnClick
          onClick={handleSignOut}
          className="cursor-pointer gap-2.5 px-2.5 py-2 text-ivory hover:bg-gold/10 hover:text-gold focus:bg-gold/10 focus:text-gold"
        >
          <LogOut />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  const { data: session, isPending } = authClient.useSession()
  const user = session?.user ?? null
  const showAuthLinks = !isPending && user === null

  const navLinks = [
    ...publicLinks,
    ...(showAuthLinks ? [{ label: "Sign In", href: "/sign-in" }] : []),
  ]

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
          {showAuthLinks && (
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full bg-gold px-6 text-midnight hover:bg-gold-hover"
              )}
            >
              Sign Up
            </Link>
          )}
        </nav>

        {/* Session state: loading skeleton, account menu, or nothing */}
        {isPending ? (
          <span
            aria-hidden="true"
            className="size-8 shrink-0 animate-pulse rounded-full border border-dark-border bg-charcoal/60"
          />
        ) : user ? (
          <AccountMenu user={user} />
        ) : null}

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
          </div>
        </nav>
      )}
    </header>
  )
}
