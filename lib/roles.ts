/**
 * SalonBook has exactly two roles: customer and admin.
 *
 * The value comes from the Better Auth session (see `user.additionalFields`
 * in `lib/auth.ts`), never from anything the browser sends. Accounts that
 * predate the `role` field have no value stored and are therefore customers.
 */
export type DashboardRole = "customer" | "admin"

interface MaybeRoleUser {
  role?: unknown
}

export function resolveDashboardRole(user: MaybeRoleUser | null | undefined): DashboardRole {
  return user && user.role === "admin" ? "admin" : "customer"
}
