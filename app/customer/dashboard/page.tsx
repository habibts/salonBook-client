"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  Clock,
  Scissors,
  X,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard, type StatTone } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { useExpressApi, ExpressApiError } from "@/lib/express-api"
import { useTokenStore } from "@/lib/token-store"
import { showError } from "@/lib/toast"

interface Appointment {
  _id: string
  customerId: string
  serviceName: string
  appointmentDate: string
  /** The API stores the slot as `timeSlot`; older records used `appointmentTime`. */
  timeSlot?: string
  appointmentTime?: string
  status: string
  paymentStatus: string
  /** The API stores the amount as `price`; older records used `servicePrice`. */
  price?: number
  servicePrice?: number
  createdAt: string
}

export default function CustomerDashboardPage() {
  const router = useRouter()
  const { tokenData, isRestoring, isAuthenticated } = useTokenStore()
  const { expressFetch } = useExpressApi()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const total = appointments.length
  const pending = appointments.filter((a) => a.status === "Pending").length
  const confirmed = appointments.filter((a) => a.status === "Confirmed").length
  const completed = appointments.filter((a) => a.status === "Completed").length
  const cancelled = appointments.filter((a) => a.status === "Cancelled").length

  const recent = [...appointments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const cards: {
    title: string
    value: number
    icon: typeof CalendarDays
    tone: StatTone
    hint: string
  }[] = [
    { title: "Total Appointments", value: total, icon: CalendarDays, tone: "gold", hint: "Bookings on your account" },
    { title: "Pending", value: pending, icon: Clock, tone: "amber", hint: "Awaiting confirmation" },
    { title: "Confirmed", value: confirmed, icon: CalendarCheck, tone: "blue", hint: "Ready to be welcomed in" },
    { title: "Completed", value: completed, icon: BadgeCheck, tone: "green", hint: "Visits already enjoyed" },
    { title: "Cancelled", value: cancelled, icon: X, tone: "red", hint: "Bookings you cancelled" },
  ]

  const firstName = user?.name?.split(" ")[0]

  // Show loading while authentication is restoring
  if (isRestoring) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="My SalonBook"
          title="Loading…"
          description="Restoring your session"
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c, i) => (
            <StatCard
              key={c.title}
              label={c.title}
              value="…"
              icon={c.icon}
              tone={c.tone}
              hint={c.hint}
              order={i}
            />
          ))}
        </div>
        <Card className="animate-rise">
          <CardContent className="pt-4">
            <ul className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i}>
                  <Skeleton className="h-14 w-full rounded-lg" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show sign-in prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="My SalonBook"
          title="Please sign in"
          description="You need to be signed in to view your dashboard."
          action={
            <Button onClick={() => router.push("/sign-in")}>
              Sign In
              <ArrowRight className="ml-1 size-4" aria-hidden="true" />
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My SalonBook"
        title={firstName ? `Welcome back, ${firstName}` : "Your Dashboard"}
        description="Track your appointments, see what is coming up and manage every visit in one place."
        action={
          <Button onClick={() => router.push("/book-appointment")}>
            Book Appointment
            <ArrowRight className="ml-1 size-4" aria-hidden="true" />
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c, i) => (
          <StatCard
            key={c.title}
            label={c.title}
            value={loading ? "…" : c.value}
            icon={c.icon}
            tone={c.tone}
            hint={c.hint}
            order={i}
          />
        ))}
      </div>

      <Card className="animate-rise">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <CardTitle className="text-lg">Recent Appointments</CardTitle>
            <CardDescription>Your latest booking activity</CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/customer/appointments")}
          >
            View All
            <ArrowRight className="ml-1 size-4" aria-hidden="true" />
          </Button>
        </CardHeader>

        <CardContent className="pt-4">
          {loading ? (
            <ul className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i}>
                  <Skeleton className="h-14 w-full rounded-lg" />
                </li>
              ))}
            </ul>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-background/60 px-6 py-10 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button onClick={fetchAppointments} className="mt-4">
                Retry
              </Button>
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-background/60 px-6 py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-gold/10 text-gold">
                <Scissors className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-heading text-base font-medium text-foreground">
                  No appointments yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  When you book a service, it will appear here.
                </p>
              </div>
              <Button
                onClick={() => router.push("/book-appointment")}
                className="mt-1"
              >
                Book your first visit
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {recent.map((a) => (
                <li
                  key={a._id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors duration-200 hover:border-border hover:bg-background/70"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold"
                    >
                      <CalendarDays className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {a.serviceName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.appointmentDate} · {a.timeSlot ?? a.appointmentTime ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground tabular-nums">
                      ${a.price ?? a.servicePrice ?? 0}
                    </span>
                    <StatusBadge status={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}