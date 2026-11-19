"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster, toast } from "@/components/ui/toast"

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

  const badgeClass = (status: string) => {
    switch (status) {
      case "Pending": return "bg-[#FFF4DF] text-[#9A6700] border-[#F0D9A8]"
      case "Confirmed": return "bg-[#E8F0FF] text-[#315DAB] border-[#D1DFFF]"
      case "Completed": return "bg-[#E6F3E9] text-[#287A45] border-[#C8E5D0]"
      case "Cancelled": return "bg-[#FCE9E8] text-[#B84040] border-[#F2CECC]"
      default: return ""
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Toaster />
      <h1 className="font-heading text-3xl font-semibold text-[#151515]">Manage Appointments</h1>
      <p className="text-[#77736D]">Review appointment requests, manage bookings, and track appointment status.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total", value: total },
          { label: "Pending", value: pending },
          { label: "Confirmed", value: confirmed },
          { label: "Completed", value: completed },
          { label: "Cancelled", value: cancelled },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-[#E9E3D8] bg-white p-4">
            <p className="text-sm text-[#77736D]">{c.label}</p>
            <p className="text-2xl font-semibold text-[#151515]">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 md:flex-row">
        <Input placeholder="Search appointments..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-[#E9E3D8] bg-white" />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-full md:w-48 border-[#E9E3D8] bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="border-[#E9E3D8] bg-white">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter("all") }} className="border-[#E9E3D8]">
          Clear Filters
        </Button>
      </div>

      {loading ? (
        <Skeleton className="mt-6 h-64 w-full" />
      ) : error ? (
        <div className="mt-6 text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchAppointments} className="mt-4">Retry</Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-center text-[#77736D]">No appointments match your search or filters.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-[#E9E3D8] bg-white">
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
                    <div className="font-medium text-[#151515]">{a.customerName}</div>
                    <div className="text-xs text-[#77736D]">{a.customerEmail}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {a.serviceImage && <img src={a.serviceImage} alt={a.serviceName} className="h-10 w-10 rounded object-cover" />}
                      <span>{a.serviceName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{a.appointmentDate}</TableCell>
                  <TableCell>{a.appointmentTime}</TableCell>
                  <TableCell>${a.price}</TableCell>
                  <TableCell>
                    <Badge className={a.paymentStatus === "Paid" ? "bg-[#E6F3E9] text-[#287A45]" : "bg-[#FFF4DF] text-[#9A6700]"}>{a.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={badgeClass(a.status)}>{a.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setSelected(a)} className="border-[#E9E3D8]">View</Button>
                      {a.status === "Pending" && (
                        <AlertDialog>
                          <AlertDialogTrigger>
                            <Button size="sm" className="bg-red-500 text-white hover:bg-red-600">Cancel</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to cancel this appointment?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                              <AlertDialogAction onClick={() => cancel(a._id)}>Confirm Cancellation</AlertDialogAction>
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
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm text-[#292929]">
              <p><strong>Customer:</strong> {selected.customerName} ({selected.customerEmail})</p>
              <p><strong>Service:</strong> {selected.serviceName}</p>
              <p><strong>Date:</strong> {selected.appointmentDate}</p>
              <p><strong>Time:</strong> {selected.appointmentTime}</p>
              <p><strong>Price:</strong> ${selected.price}</p>
              <p><strong>Duration:</strong> {selected.duration} min</p>
              <p><strong>Status:</strong> {selected.status}</p>
              <p><strong>Payment:</strong> {selected.paymentStatus}</p>
              <p><strong>Message:</strong> {selected.message || "—"}</p>
              <p><strong>Created:</strong> {selected.createdAt}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
