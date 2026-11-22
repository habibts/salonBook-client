import type { ReactNode } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { auth } from "@/lib/auth"
import { resolveDashboardRole } from "@/lib/roles"

const authInstance = await auth;

/**
 * Server-side guard for the `/dashboard/admin/*` routes — the Admin Profile
 * page lives here. The session is read from the Better Auth cookie on the
 * server, so the page can never render for a visitor or for a customer, and
 * the sidebar only reflects what was already enforced above it.
 */
export default async function DashboardAdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await authInstance!.api.getSession({ headers: await headers() })

  if (!session) redirect("/sign-in")
  if (resolveDashboardRole(session.user) !== "admin")
    redirect("/customer/dashboard")

  return <DashboardShell role="admin">{children}</DashboardShell>
}