import type { ReactNode } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"

/**
 * Server-side guard for every `/customer/*` route: the user identity is read
 * from headers set by middleware (which validates the JWT cookie), so a
 * customer-only page can never be reached without signing in, and an admin
 * is sent to the admin dashboard instead.
 */
export default async function CustomerLayout({
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

  if (userRole === "admin") {
    redirect("/admin/dashboard")
  }

  return <DashboardShell role="customer">{children}</DashboardShell>
}