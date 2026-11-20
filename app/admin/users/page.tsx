"use client"

import { useEffect, useMemo, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster, toast } from "@/components/ui/toast"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { ShieldCheck, UserCheck, UserRound, Users, UserX } from "lucide-react"
import { useExpressApi, ExpressApiError } from "@/lib/express-api"
import { useTokenStore } from "@/lib/token-store"

interface User {
  _id: string
  name: string
  email: string
  image?: string
  role?: string
  createdAt?: string
  status?: string
}

const PAGE_SIZE = 10

export default function ManageUsersPage() {
  const { expressFetch } = useExpressApi()
  const { isRestoring } = useTokenStore()
  const { data: session } = authClient.useSession()
  const currentUser = session?.user
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<User | null>(null)

  const isLoading = isRestoring || loading

  async function fetchUsers() {
    setLoading(true)
    setError(null)
    try {
      const data = await expressFetch<User[]>("/users")
      setUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      if (e instanceof ExpressApiError && e.status === 401) {
        setError("Your session has expired. Please sign in again.")
      } else if (e instanceof ExpressApiError && e.status === 403) {
        setError("Access denied. Admin privileges required.")
      } else {
        setError(e instanceof Error ? e.message : "Error")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filtered = useMemo(() => {
    let list = users
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    }
    if (statusFilter !== "all") list = list.filter((u) => (u.status ?? "active") === statusFilter)
    if (roleFilter !== "all") list = list.filter((u) => (u.role ?? "customer") === roleFilter)
    return list
  }, [users, search, statusFilter, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const total = users.length
  const active = users.filter((u) => (u.status ?? "active") === "active").length
  const blocked = users.filter((u) => (u.status ?? "active") === "blocked").length
  const customers = users.filter((u) => (u.role ?? "customer") === "customer").length
  const admins = users.filter((u) => (u.role ?? "customer") === "admin").length

  function getInitials(name: string) {
    return name.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?"
  }

  async function updateStatus(id: string, status: string) {
    try {
      interface ApiResponse { success: boolean }
      await expressFetch<ApiResponse>(`/users/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      toast.add({ type: "success", title: "Updated" })
      fetchUsers()
    } catch {
      toast.add({ type: "error", title: "Update failed" })
    }
  }

  async function deleteUser(id: string) {
    try {
      interface ApiResponse { success: boolean }
      await expressFetch<ApiResponse>(`/users/${id}`, { method: "DELETE" })
      toast.add({ type: "success", title: "Deleted" })
      fetchUsers()
    } catch {
      toast.add({ type: "error", title: "Delete failed" })
    }
  }

  function canModify(u: User) {
    if (!currentUser) return false
    if (u._id === currentUser.id) return false
    if ((u.role ?? "customer") === "admin") return false
    return true
  }

  const stats = [
    { label: "Total Users", value: total, icon: Users, tone: "gold" as const },
    { label: "Active", value: active, icon: UserCheck, tone: "green" as const },
    { label: "Blocked", value: blocked, icon: UserX, tone: "red" as const },
    { label: "Customers", value: customers, icon: UserRound, tone: "blue" as const },
    { label: "Admins", value: admins, icon: ShieldCheck, tone: "sage" as const },
  ]

  return (
    <div className="space-y-6">
      <Toaster />

      <PageHeader
        eyebrow="People"
        title="Manage Users"
        description="Manage customer accounts, monitor user activity, and control access."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((c, i) => (
          <StatCard
            key={c.label}
            label={c.label}
            value={isLoading ? "…" : c.value}
            icon={c.icon}
            tone={c.tone}
            order={i}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:flex-1"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? "all")}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => { setSearch(""); setStatusFilter("all"); setRoleFilter("all") }}
        >
          Clear Filters
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={fetchUsers} className="mt-4">Retry</Button>
        </div>
      ) : isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : paged.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          No users found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card surface-raised">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 ring-1 ring-border">
                        {u.image ? <AvatarImage src={u.image} /> : null}
                        <AvatarFallback className="bg-secondary text-[11px] font-semibold text-secondary-foreground">
                          {getInitials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <span
                      className={
                        (u.role ?? "customer") === "admin"
                          ? "rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-gold uppercase"
                          : "rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
                      }
                    >
                      {u.role ?? "customer"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={(u.status ?? "active") === "active" ? "Active" : "Blocked"} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelected(u)}>
                        View
                      </Button>
                      {canModify(u) && (
                        <>
                          {(u.status ?? "active") === "active" ? (
                            <AlertDialog>
                              <AlertDialogTrigger>
                                <Button size="sm" variant="destructive">Block</Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Block User?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This user will no longer be able to access their account.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => updateStatus(u._id, "blocked")}>
                                    Confirm Block
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <Button size="sm" onClick={() => updateStatus(u._id, "active")}>
                              Unblock
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger>
                              <Button size="sm" variant="destructive">Delete</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User?</AlertDialogTitle>
                                <AlertDialogDescription>This action is permanent.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteUser(u._id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} variant="outline">
          Previous
        </Button>
        <span className="text-sm text-muted-foreground tabular-nums">
          Page {page} of {totalPages}
        </span>
        <Button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} variant="outline">
          Next
        </Button>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">User Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
              {[
                ["Name", selected.name],
                ["Email", selected.email],
                ["Role", selected.role ?? "customer"],
                ["Status", selected.status ?? "active"],
                ["Joined", selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "—"],
                ["ID", selected._id],
              ].map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium break-words text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}