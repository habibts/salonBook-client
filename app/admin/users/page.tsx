"use client"

import { useEffect, useMemo, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster, toast } from "@/components/ui/toast"

interface User {
  _id: string
  name: string
  email: string
  image?: string
  role?: string
  createdAt?: string
  status?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const PAGE_SIZE = 10

export default function ManageUsersPage() {
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
  const [toDelete, setToDelete] = useState<string | null>(null)
  const [toBlock, setToBlock] = useState<string | null>(null)

  async function fetchUsers() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/users`)
      if (!res.ok) throw new Error("Failed")
      const data = (await res.json()) as User[]
      setUsers(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error")
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
    const res = await fetch(`${API_BASE}/users/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.add({ type: "success", title: "Updated" })
      fetchUsers()
    } else {
      toast.add({ type: "error", title: "Update failed" })
    }
  }

  async function deleteUser(id: string) {
    const res = await fetch(`${API_BASE}/users/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.add({ type: "success", title: "Deleted" })
      fetchUsers()
    } else {
      toast.add({ type: "error", title: "Delete failed" })
    }
    setToDelete(null)
  }

  function canModify(u: User) {
    if (!currentUser) return false
    if (u._id === currentUser.id) return false
    if ((u.role ?? "customer") === "admin") return false
    return true
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Toaster />
      <h1 className="font-heading text-3xl font-semibold text-[#151515]">Manage Users</h1>
      <p className="text-[#77736D]">Manage customer accounts, monitor user activity, and control access.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total Users", value: total },
          { label: "Active Users", value: active },
          { label: "Blocked Users", value: blocked },
          { label: "Customers", value: customers },
          { label: "Admins", value: admins },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-[#E9E3D8] bg-white p-4">
            <p className="text-sm text-[#77736D]">{c.label}</p>
            <p className="text-2xl font-semibold text-[#151515]">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 md:flex-row">
        <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-[#E9E3D8] bg-white" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-full md:w-48 border-[#E9E3D8] bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="border-[#E9E3D8] bg-white">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? "all")}>
          <SelectTrigger className="w-full md:w-48 border-[#E9E3D8] bg-white"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent className="border-[#E9E3D8] bg-white">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter("all"); setRoleFilter("all") }} className="border-[#E9E3D8]">
          Clear Filters
        </Button>
      </div>

      {loading ? (
        <Skeleton className="mt-6 h-64 w-full" />
      ) : error ? (
        <div className="mt-6 text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchUsers} className="mt-4">Retry</Button>
        </div>
      ) : paged.length === 0 ? (
        <p className="mt-6 text-center text-[#77736D]">No users found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-[#E9E3D8] bg-white">
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
                  <TableCell className="flex items-center gap-2">
                    <Avatar>
                      {u.image ? <AvatarImage src={u.image} /> : null}
                      <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                    </Avatar>
                    <span>{u.name}</span>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role ?? "customer"}</TableCell>
                  <TableCell>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</TableCell>
                  <TableCell>
                    <Badge className={(u.status ?? "active") === "active" ? "bg-[#E6F3E9] text-[#287A45]" : "bg-[#FCE9E8] text-[#B84040]"}>
                      {u.status ?? "active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelected(u)} className="border-[#E9E3D8]">View</Button>
                    {canModify(u) && (
                      <>
                        {(u.status ?? "active") === "active" ? (
                          <AlertDialog>
                            <AlertDialogTrigger>
                              <Button size="sm" className="bg-yellow-500 text-white hover:bg-yellow-600">Block</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Block User?</AlertDialogTitle>
                                <AlertDialogDescription>This user will no longer be able to access their account.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => updateStatus(u._id, "blocked")}>Confirm Block</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button size="sm" onClick={() => updateStatus(u._id, "active")} className="bg-[#C5A46D] text-[#151515] hover:bg-[#AE8C56]">Unblock</Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger>
                            <Button size="sm" className="bg-red-500 text-white hover:bg-red-600">Delete</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User?</AlertDialogTitle>
                              <AlertDialogDescription>This action is permanent.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteUser(u._id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} variant="outline" className="border-[#E9E3D8]">Previous</Button>
        <span className="text-sm text-[#77736D]">Page {page} of {totalPages}</span>
        <Button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} variant="outline" className="border-[#E9E3D8]">Next</Button>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm text-[#292929]">
              <p><strong>Name:</strong> {selected.name}</p>
              <p><strong>Email:</strong> {selected.email}</p>
              <p><strong>Role:</strong> {selected.role ?? "customer"}</p>
              <p><strong>Status:</strong> {selected.status ?? "active"}</p>
              <p><strong>Joined:</strong> {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "—"}</p>
              <p><strong>ID:</strong> {selected._id}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
