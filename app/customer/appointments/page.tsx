"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Clock, CreditCard, Scissors } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster, toast } from "@/components/ui/toast"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"

interface Appointment {
  _id: string
  customerId: string
  serviceName: string
  serviceImage?: string
  appointmentDate: string
  appointmentTime: string
  price: number
  duration: number
  status: string
  paymentStatus: string
  createdAt: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

export default function MyAppointmentsPage() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const user = session?.user
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchAppointments() {
    if (!user) return
    setLoading(true)
    const res = await fetch(`${API_BASE}/appointments`)
    const data = (await res.json()) as Appointment[]
    setAppointments(data.filter((a) => a.customerId === user.id))
    setLoading(false)
  }

  useEffect(() => {
    fetchAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function cancel(id: string) {
    const res = await fetch(`${API_BASE}/appointments/${id}/cancel`, { method: "PATCH" })
    if (res.ok) {
      toast.add({ type: "success", title: "Cancelled" })
      fetchAppointments()
    } else {
      toast.add({ type: "error", title: "Cancel failed" })
    }
  }

  return (
    <div className="space-y-6">
      <Toaster />

      <PageHeader
        eyebrow="My bookings"
        title="My Appointments"
        description="Every visit you have requested — confirmed, pending or already enjoyed."
      />

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="animate-rise flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-gold/10 text-gold">
            <Scissors className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="font-heading text-lg font-medium text-foreground">
              No appointments found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Book a service and your visits will appear here.
            </p>
          </div>
          <Button onClick={() => router.push("/book-appointment")} className="mt-1">
            Book an appointment
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((a, i) => (
            <Card
              key={a._id}
              className="animate-rise transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40"
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {a.serviceImage ? (
                  <img
                    src={a.serviceImage}
                    alt={a.serviceName}
                    className="h-24 w-full shrink-0 rounded-lg object-cover sm:w-24"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-24 w-full shrink-0 items-center justify-center rounded-lg bg-background text-gold sm:w-24"
                  >
                    <Scissors className="size-6" />
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-heading text-lg font-medium text-foreground">
                      {a.serviceName}
                    </h3>
                    <StatusBadge status={a.status} />
                    <StatusBadge status={a.paymentStatus} />
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5 text-gold" aria-hidden="true" />
                      {a.appointmentDate}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5 text-gold" aria-hidden="true" />
                      {a.appointmentTime} · {a.duration} min
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CreditCard className="size-3.5 text-gold" aria-hidden="true" />${a.price}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {a.status === "Pending" && (
                    <Button variant="destructive" onClick={() => cancel(a._id)}>
                      Cancel
                    </Button>
                  )}
                  {a.status === "Confirmed" && a.paymentStatus === "Unpaid" && (
                    <Button>Pay Now</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
