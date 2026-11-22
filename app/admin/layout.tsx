import type { ReactNode } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { auth } from "@/lib/auth"
import { resolveDashboardRole } from "@/lib/roles"

const authInstance = await auth;

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
  const session = await authInstance!.api.getSession({ headers: await headers() })

  if (!session) redirect("/sign-in")
  if (resolveDashboardRole(session.user) !== "admin") redirect("/customer/dashboard")

  return <DashboardShell role="admin">{children}</DashboardShell>
}