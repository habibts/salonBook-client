import type { ReactNode } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { auth } from "@/lib/auth"
import { resolveDashboardRole } from "@/lib/roles"

/**
 * Server-side guard for every `/customer/*` route: the session is read from
 * the Better Auth cookie on the server, so a customer-only page can never be
 * reached without signing in, and an admin is sent to the admin dashboard
 * instead.
 */
export default async function CustomerLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect("/sign-in")
  if (resolveDashboardRole(session.user) === "admin") redirect("/admin/dashboard")

  return <DashboardShell role="customer">{children}</DashboardShell>
}
