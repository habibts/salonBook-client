import type { ReactNode } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"

/**
 * Server-side guard for every `/admin/*` route: only a session whose role is
 * "admin" may render the admin dashboard. Customers are redirected back to
 * their own dashboard — navigation order is never the security boundary.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const headersList = await headers()
  const userId = headersList.get("x-user-id")
  const userEmail = headersList.get("x-user-email")
  const userRole = headersList.get("x-user-role")

  if (!userId || !userEmail || !userRole) {
    redirect("/sign-in")
  }

  if (userRole !== "admin") {
    redirect("/customer/dashboard")
  }

  return <DashboardShell role="admin">{children}</DashboardShell>
}