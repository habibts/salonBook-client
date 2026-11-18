"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Toaster, toast } from "@/components/ui/toast"
import { authClient } from "@/lib/auth-client"
import type { DashboardRole } from "@/lib/roles"
import { cn } from "@/lib/utils"

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
  { label: "My Profile", href: "/admin/profile", icon: UserRound },
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
  const { data: session } = authClient.useSession()
  const user = session?.user ?? null

  const labelClass = hideLabelsUntilLg ? "hidden lg:block" : "block"
  const linkJustify = hideLabelsUntilLg
    ? "justify-center lg:justify-start"
    : "justify-start"

  return (
    <>
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-dark-border px-3 lg:px-4">
        <Link
          href="/"
          aria-label="SalonBook — Home"
          className="flex min-w-0 items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold font-heading text-base font-semibold text-midnight">
            S
          </span>
          <span
            className={cn(
              "truncate font-heading text-lg font-semibold tracking-wide text-gold",
              labelClass
            )}
          >
            SalonBook
          </span>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[#A7A39C] transition-colors hover:bg-ivory/10 hover:text-gold"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Role-based navigation */}
      <nav
        aria-label={role === "admin" ? "Admin navigation" : "Customer navigation"}
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3"
      >
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
                "flex h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
                linkJustify,
                isActive
                  ? "bg-gold/10 text-gold"
                  : "text-[#A7A39C] hover:bg-ivory/5 hover:text-ivory"
              )}
            >
              <item.icon className="size-5 shrink-0" aria-hidden="true" />
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
            "flex h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#A7A39C] transition-colors outline-none hover:bg-ivory/5 hover:text-ivory focus-visible:ring-2 focus-visible:ring-gold/60",
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
            "flex h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#A7A39C] transition-colors outline-none hover:bg-ivory/5 hover:text-gold focus-visible:ring-2 focus-visible:ring-gold/60 disabled:opacity-60",
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
 * Shared dashboard chrome: responsive sidebar (icon rail on tablet, drawer on
 * mobile), sticky header with the page title and the signed-in user, and the
 * toast viewport used by every dashboard page.
 *
 * The role is resolved from the authenticated session in the route layout that
 * renders this shell — the sidebar only reflects what the server already
 * enforced.
 */
function DashboardShell({ role, children }: DashboardShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const { data: session, isPending } = authClient.useSession()
  const user = session?.user ?? null

  const items = getNavItems(role)
  const active = matchNavItem(pathname, items)
  const title = active?.label ?? (role === "admin" ? "Admin Dashboard" : "Customer Dashboard")

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)

    try {
      const { error } = await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/")
          },
        },
      })

      if (error) {
        toast.add({
          type: "error",
          title: "Could not sign out",
          description: error.message ?? "Please try again.",
        })
        setLoggingOut(false)
      }
    } catch {
      toast.add({
        type: "error",
        title: "Could not sign out",
        description: "Something went wrong. Please try again.",
      })
      setLoggingOut(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full bg-ivory text-midnight">
      {/* Desktop sidebar — icon rail from `md`, full sidebar from `lg` */}
      <aside
        aria-label="Dashboard sidebar"
        className="sticky top-0 hidden h-svh shrink-0 flex-col self-start border-r border-dark-border bg-midnight md:flex md:w-16 lg:w-64"
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
        <main className="flex min-w-0 flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

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
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-midnight shadow-2xl shadow-black/40">
            <SidebarContent
              role={role}
              onClose={() => setDrawerOpen(false)}
              onLogout={handleLogout}
              loggingOut={loggingOut}
            />
          </div>
        </div>
      )}

      {/* Toasts for the whole dashboard */}
      <Toaster />
    </div>
  )
}

export { DashboardShell }
