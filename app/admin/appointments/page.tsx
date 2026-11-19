"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster, toast } from "@/components/ui/toast"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { BadgeCheck, CalendarCheck, CalendarDays, Clock, XCircle } from "lucide-react"

interface Appointment {
  _id: string
  customerId: string
  customerName?: string
  customerEmail?: string
  serviceName: string
  serviceImage?: string
  category?: string
  appointmentDate: string
  appointmentTime: string
  price: number
  duration: number
  message?: string
  status: string
  paymentStatus: string
  createdAt: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [toCancel, setToCancel] = useState<string | null>(null)

  async function fetchAppointments() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/appointments`)
      if (!res.ok) throw new Error("Failed")
      const data = (await res.json()) as Appointment[]
      setAppointments(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const filtered = useMemo(() => {
    let list = appointments
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((a) =>
        (a.customerName ?? "").toLowerCase().includes(q) ||
        (a.customerEmail ?? "").toLowerCase().includes(q) ||
        a.serviceName.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter)
    return list
  }, [appointments, search, statusFilter])

  const total = appointments.length
  const pending = appointments.filter((a) => a.status === "Pending").length
  const confirmed = appointments.filter((a) => a.status === "Confirmed").length
  const completed = appointments.filter((a) => a.status === "Completed").length
  const cancelled = appointments.filter((a) => a.status === "Cancelled").length

  async function cancel(id: string) {
    const res = await fetch(`${API_BASE}/appointments/${id}/cancel`, { method: "PATCH" })
    if (res.ok) {
      toast.add({ type: "success", title: "Cancelled" })
      fetchAppointments()
    } else {
      toast.add({ type: "error", title: "Cancel failed" })
    }
    setToCancel(null)
  }

  const stats = [
    { label: "Total", value: total, icon: CalendarDays, tone: "gold" as const },
    { label: "Pending", value: pending, icon: Clock, tone: "amber" as const },
    { label: "Confirmed", value: confirmed, icon: CalendarCheck, tone: "blue" as const },
    { label: "Completed", value: completed, icon: BadgeCheck, tone: "green" as const },
    { label: "Cancelled", value: cancelled, icon: XCircle, tone: "red" as const },
  ]

  return (
    <div className="space-y-6">
      <Toaster />

      <PageHeader
        eyebrow="Bookings"
        title="Manage Appointments"
        description="Review appointment requests, manage bookings, and track appointment status."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((c, i) => (
          <StatCard
            key={c.label}
            label={c.label}
            value={loading ? "…" : c.value}
            icon={c.icon}
            tone={c.tone}
            order={i}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center">
        <Input
          placeholder="Search appointments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:flex-1"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter("all") }}>
          Clear Filters
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : error ? (
        <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={fetchAppointments} className="mt-4">
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          No appointments match your search or filters.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card surface-raised">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a._id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{a.customerName}</div>
                    <div className="text-xs text-muted-foreground">{a.customerEmail}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {a.serviceImage && (
                        <img
                          src={a.serviceImage}
                          alt={a.serviceName}
                          className="size-10 rounded-lg object-cover ring-1 ring-border"
                        />
                      )}
                      <span className="text-foreground">{a.serviceName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.appointmentDate}</TableCell>
                  <TableCell className="text-muted-foreground">{a.appointmentTime}</TableCell>
                  <TableCell className="font-medium text-foreground tabular-nums">
                    ${a.price}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={a.paymentStatus} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelected(a)}>
                        View
                      </Button>
                      {a.status === "Pending" && (
                        <AlertDialog>
                          <AlertDialogTrigger>
                            <Button size="sm" variant="destructive">
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this appointment?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                              <AlertDialogAction onClick={() => cancel(a._id)}>
                                Confirm Cancellation
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Appointment Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
              {[
                ["Customer", `${selected.customerName ?? "—"} (${selected.customerEmail ?? "—"})`],
                ["Service", selected.serviceName],
                ["Date", selected.appointmentDate],
                ["Time", selected.appointmentTime],
                ["Price", `$${selected.price}`],
                ["Duration", `${selected.duration} min`],
                ["Status", selected.status],
                ["Payment", selected.paymentStatus],
                ["Message", selected.message || "—"],
                ["Created", selected.createdAt],
              ].map(([label, value]) => (
                <div key={label as string} className="contents">
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
