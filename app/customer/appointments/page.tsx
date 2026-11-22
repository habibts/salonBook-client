"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Clock, CreditCard, Scissors } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { showSuccess, showError } from "@/lib/toast"

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
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const fetchAppointments = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/appointments`)
      if (!res.ok) throw new Error(`Failed to load appointments: ${res.status}`)
      const data = (await res.json()) as Appointment[]
      setAppointments(data.filter((a) => a.customerId === user.id))
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load appointments"
      setError(message)
      showError({ title: "Failed to Load Appointments", description: message })
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAppointments()
  }, [fetchAppointments])

  async function cancel(id: string) {
    setCancelling(id)
    try {
      const res = await fetch(`${API_BASE}/appointments/${id}/cancel`, { method: "PATCH" })
      if (res.ok) {
        showSuccess({ title: "Appointment Cancelled", description: "Your appointment has been cancelled successfully." })
        fetchAppointments()
      } else {
        const errorData = await res.json().catch(() => ({}))
        showError({ title: "Cancellation Failed", description: errorData.error || "Failed to cancel appointment. Please try again." })
      }
    } catch {
      showError({ title: "Cancellation Failed", description: "Network error. Please try again." })
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div className="space-y-6">

      <PageHeader
        eyebrow="My bookings"
        title="My Appointments"
        description="Every visit you have requested — confirmed, pending or already enjoyed."
      />

      {error ? (
        <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={fetchAppointments} className="mt-4">
            Retry
          </Button>
        </div>
      ) : loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-rise transition-all duration-300">
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center p-4">
                <Skeleton className="h-24 w-full shrink-0 rounded-lg sm:w-24" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
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
                    <Button
                      variant="destructive"
                      onClick={() => cancel(a._id)}
                      disabled={cancelling === a._id}
                    >
                      {cancelling === a._id ? "Cancelling…" : "Cancel"}
                    </Button>
                  )}
                  {a.status === "Confirmed" && a.paymentStatus === "Unpaid" && (
                    <Button onClick={() => router.push(`/payment?appointmentId=${a._id}`)}>
                      Pay Now
                    </Button>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(a._id)
                    showSuccess({ title: "Appointment ID Copied", description: "ID copied to clipboard." })
                  }}
                >
                  <Copy className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
