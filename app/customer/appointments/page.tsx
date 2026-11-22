"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { CalendarDays, Clock, CreditCard, Scissors } from "lucide-react"

import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { useExpressApi, ExpressApiError } from "@/lib/express-api"
import { useTokenStore } from "@/lib/token-store"
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

export default function MyAppointmentsPage() {
  const router = useRouter()
  const { tokenData, isRestoring, isAuthenticated } = useTokenStore()
  const { expressFetch } = useExpressApi()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)

  const user = tokenData?.user

  const fetchAppointments = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await expressFetch<Appointment[]>("/appointments")
      if (Array.isArray(data)) {
        setAppointments(data.filter((a) => a.customerId === user.id))
      } else {
        setAppointments([])
      }
    } catch (e) {
      if (e instanceof ExpressApiError && e.status === 401) {
        setError("Your session has expired. Please sign in again.")
      } else if (e instanceof ExpressApiError && e.status === 403) {
        setError("Access denied.")
      } else {
        const message = e instanceof Error ? e.message : "Failed to load appointments"
        setError(message)
        showError({ title: "Failed to Load Appointments", description: message })
      }
    } finally {
      setLoading(false)
    }
  }, [expressFetch, user])

  // Wait for authentication restoration to complete before fetching
  useEffect(() => {
    if (isRestoring) return
    if (!isAuthenticated) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAppointments()
  }, [isRestoring, isAuthenticated, fetchAppointments])

  async function cancel(id: string) {
    setCancelling(id)
    try {
      interface ApiResponse { success: boolean }
      await expressFetch<ApiResponse>(`/appointments/${id}/cancel`, { method: "PATCH" })
      showSuccess({ title: "Appointment Cancelled", description: "Your appointment has been cancelled successfully." })
      fetchAppointments()
    } catch (e) {
      if (e instanceof ExpressApiError && e.status === 401) {
        showError({ title: "Session Expired", description: "Your session has expired. Please sign in again." })
      } else if (e instanceof ExpressApiError && e.status === 403) {
        showError({ title: "Access Denied", description: "You do not have permission to cancel this appointment." })
      } else if (e instanceof ExpressApiError && e.status === 400) {
        showError({ title: "Cannot Cancel", description: e.message })
      } else {
        showError({ title: "Cancellation Failed", description: e instanceof Error ? e.message : "Failed to cancel appointment. Please try again." })
      }
    } finally {
      setCancelling(null)
    }
  }

  // Show loading while authentication is restoring
  if (isRestoring) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="My bookings"
          title="My Appointments"
          description="Loading your appointments…"
        />
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
      </div>
    )
  }

  // Show sign-in prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="My bookings"
          title="My Appointments"
          description="You need to be signed in to view your appointments."
        />
        <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">Please sign in to view your appointments.</p>
          <Button onClick={() => router.push("/sign-in")} className="mt-4">
            Sign In
          </Button>
        </div>
      </div>
    )
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