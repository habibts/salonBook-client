"use client"

import { usePathname } from "next/navigation"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

/**
 * Dashboard routes render inside `DashboardShell`, which already provides the
 * brand, navigation, user menu and logout. The public marketing chrome would
 * only duplicate it (and squeeze the shell below a sticky header), so it is
 * omitted there. `/payment` keeps the Navbar — it is a public checkout flow —
 * but drops the marketing Footer so the page ends on the secure-checkout note.
 */
const DASHBOARD_ROUTE = /^\/(?:admin|customer)(?:\/|$)/
const FOOTERLESS_ROUTES = /^\/(?:admin|customer|payment)(?:\/|$)/

function SiteHeader() {
  const pathname = usePathname()
  if (DASHBOARD_ROUTE.test(pathname)) return null
  return <Navbar />
}

function SiteFooter() {
  const pathname = usePathname()
  if (FOOTERLESS_ROUTES.test(pathname)) return null
  return <Footer />
}

export { SiteHeader, SiteFooter }
