"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import {
  CalendarDays,
  ClipboardList,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Scissors,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { authClient, clearJWT } from "@/lib/auth-client"
import { expressLogout } from "@/lib/express-api"
import { useTokenStore } from "@/lib/token-store"
import type { DashboardRole } from "@/lib/roles"
import { cn } from "@/lib/utils"
import { showError } from "@/lib/toast"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const CUSTOMER_NAV: NavItem[] = [
  { label: "Overview", href: "/customer/dashboard", icon: LayoutDashboard },
  { label: "My Appointments", href: "/customer/appointments", icon: CalendarDays },
  { label: "My Profile", href: "/customer/profile", icon: UserRound },
]

const ADMIN_NAV: NavItem[] = [
  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Manage Services", href: "/admin/services", icon: Scissors },
  { label: "Add Service", href: "/admin/services/new", icon: PlusCircle },
  { label: "Manage Appointments", href: "/admin/appointments", icon: ClipboardList },
  { label: "Manage Users", href: "/admin/users", icon: Users },
  { label: "Transactions", href: "/admin/transactions", icon: CreditCard },
  { label: "My Profile", href: "/dashboard/admin/profile", icon: UserRound },
]

function getNavItems(role: DashboardRole): NavItem[] {
  return role === "admin" ? ADMIN_NAV : CUSTOMER_NAV
}

/**
 * Picks the navigation entry that owns the current path. The longest matching
 * href wins so `/admin/services/new` highlights "Add Service" rather than
 * "Manage Services".
 */
function matchNavItem(pathname: string, items: NavItem[]): NavItem | undefined {
  let match: NavItem | undefined
  let longest = -1

  for (const item of items) {
    const matches = pathname === item.href || pathname.startsWith(`${item.href}/`)
    if (matches && item.href.length > longest) {
      longest = item.href.length
      match = item
    }
  }

  return match
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

interface SidebarContentProps {
  role: DashboardRole
  /** Desktop rail hides labels until the `lg` breakpoint; the mobile drawer never does. */
  hideLabelsUntilLg?: boolean
  onClose?: () => void
  onLogout: () => void
  loggingOut: boolean
}

function SidebarContent({
  role,
  hideLabelsUntilLg = false,
  onClose,
  onLogout,
  loggingOut,
}: SidebarContentProps) {
  const pathname = usePathname()
  const items = getNavItems(role)
  const active = matchNavItem(pathname, items)

  const labelClass = hideLabelsUntilLg ? "hidden lg:block" : "block"
  const linkJustify = hideLabelsUntilLg
    ? "justify-center lg:justify-start"
    : "justify-start"

  return (
    <>
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-dark-border px-4">
        <Link
          href="/"
          aria-label="SalonBook — Home"
          className="flex min-w-0 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold font-heading text-base font-semibold text-midnight transition-transform duration-300 hover:scale-105">
            S
          </span>
          <span
            className={cn(
              "min-w-0 flex-col",
              hideLabelsUntilLg ? "hidden lg:flex" : "flex"
            )}
          >
            <span className="truncate font-heading text-lg leading-none font-semibold tracking-wide text-gold">
              SalonBook
            </span>
            <span className="mt-1.5 text-[9px] font-semibold tracking-[0.28em] text-champagne/70 uppercase">
              Dashboard
            </span>
          </span>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ivory/70 transition-colors hover:bg-ivory/10 hover:text-gold"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Role-based navigation */}
      <nav
        aria-label={role === "admin" ? "Admin navigation" : "Customer navigation"}
        className="sb-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3"
      >
        <p
          className={cn(
            "px-3 pt-2 pb-1.5 text-[10px] font-semibold tracking-[0.22em] text-champagne/70 uppercase",
            labelClass
          )}
        >
          Menu
        </p>

        {items.map((item) => {
          const isActive = active?.href === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              title={hideLabelsUntilLg ? item.label : undefined}
              className={cn(
                "relative flex h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
                linkJustify,
                isActive
                  ? "bg-gold/15 text-gold ring-1 ring-inset ring-gold/30"
                  : "text-ivory/70 hover:bg-ivory/[0.06] hover:text-ivory"
              )}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gold"
                />
              )}
              <item.icon
                className={cn(
                  "size-5 shrink-0 transition-colors duration-200",
                  isActive ? "text-gold" : "text-champagne/70"
                )}
                aria-hidden="true"
              />
              <span className={cn("truncate", labelClass)}>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Utility navigation */}
      <div className="flex shrink-0 flex-col gap-1 border-t border-dark-border p-3">
        <Link
          href="/"
          onClick={onClose}
          className={cn(
            "flex h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium text-ivory/70 transition-colors duration-200 outline-none hover:bg-ivory/[0.06] hover:text-ivory focus-visible:ring-2 focus-visible:ring-gold/60",
            linkJustify
          )}
        >
          <Home className="size-5 shrink-0" aria-hidden="true" />
          <span className={cn("truncate", labelClass)}>Back to Home</span>
        </Link>
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className={cn(
            "flex h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium text-ivory/70 transition-colors duration-200 outline-none hover:bg-gold/10 hover:text-gold focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-60",
            linkJustify
          )}
        >
          <LogOut className="size-5 shrink-0" aria-hidden="true" />
          <span className={cn("truncate", labelClass)}>
            {loggingOut ? "Logging out…" : "Logout"}
          </span>
        </button>
      </div>
    </>
  )
}

interface DashboardShellProps {
  role: DashboardRole
  children: ReactNode
}

/**
 * Shared dashboard chrome: a Midnight sidebar with Champagne Gold accents
 * (icon rail on tablet, drawer on mobile), a sticky topbar with the signed-in
 * user, and the toast viewport used by every dashboard page.
 *
 * The role is resolved from the authenticated session in the route layout that
 * renders this shell — the sidebar only reflects what the server already
 * enforced.
 */
function DashboardShell({ role, children }: DashboardShellProps) {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const { tokenData, clearTokenData } = useTokenStore()

  const user = tokenData?.user ?? null

  useEffect(() => {
    if (!drawerOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [drawerOpen])

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)

    try {
      const token = tokenData?.token

      const { error } = await authClient.signOut({
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

      if (error) {
        showError({ title: "Could not sign out", description: error.message ?? "Please try again." })
        setLoggingOut(false)
      }
    } catch {
      showError({ title: "Could not sign out", description: "Something went wrong. Please try again." })
      setLoggingOut(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full bg-background text-foreground">
      {/* Desktop sidebar — icon rail from `md`, full sidebar from `lg` */}
      <aside
        aria-label="Dashboard sidebar"
        className="sticky top-0 hidden h-svh shrink-0 flex-col self-start border-r border-dark-border bg-sidebar md:flex md:w-16 lg:w-64"
      >
        <SidebarContent
          role={role}
          hideLabelsUntilLg
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-controls="dashboard-drawer"
                aria-expanded={drawerOpen}
                aria-label="Open navigation menu"
                className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors duration-200 hover:border-gold/60 hover:text-gold focus-visible:ring-2 focus-visible:ring-gold/50 md:hidden"
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>

              <Link
                href="/"
                aria-label="SalonBook — Home"
                className="flex items-center gap-2.5 md:hidden"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-gold font-heading text-base font-semibold text-midnight">
                  S
                </span>
                <span className="font-heading text-lg font-semibold tracking-wide text-foreground">
                  SalonBook
                </span>
              </Link>

              <span className="hidden items-center gap-2.5 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase md:flex">
                <span aria-hidden="true" className="size-1.5 rotate-45 bg-gold" />
                SalonBook Dashboard
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
              <span className="hidden rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-gold uppercase sm:inline-flex">
                {role === "admin" ? "Admin" : "Member"}
              </span>
              <div className="flex items-center gap-2.5 rounded-full border border-border bg-card py-1 pr-3 pl-1">
                <Avatar className="size-8 ring-1 ring-gold/40">
                  {user?.image ? <AvatarImage src={user.image} alt="" /> : null}
                  <AvatarFallback className="bg-charcoal text-[11px] font-semibold text-gold">
                    {getInitials(user?.name ?? "")}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[9rem] truncate text-sm font-medium text-foreground sm:block">
                  {user?.name ?? "Guest"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div
            id="dashboard-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
            className="fixed inset-0 z-50 md:hidden"
          >
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setDrawerOpen(false)}
              className="animate-fade absolute inset-0 bg-midnight/70 backdrop-blur-[2px]"
            />
            <div className="animate-drawer surface-floating absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-sidebar">
              <SidebarContent
                role={role}
                onClose={() => setDrawerOpen(false)}
                onLogout={handleLogout}
                loggingOut={loggingOut}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { DashboardShell }
