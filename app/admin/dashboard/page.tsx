"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { ArrowUpRight, CalendarDays, ClipboardList, CreditCard, Scissors, Users, X, BadgeCheck, CalendarCheck, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard, type StatTone } from "@/components/dashboard/stat-card"
import { useExpressApi, ExpressApiError } from "@/lib/express-api"
import { useTokenStore } from "@/lib/token-store"
import { showError } from "@/lib/toast"

interface User {
  _id: string
  email: string
  name: string
  role?: string
  status?: string
  createdAt: string
}

interface Service {
  _id: string
  serviceName: string
  status: string
}

interface Appointment {
  _id: string
  customerId: string
  serviceName: string
  appointmentDate: string
  timeSlot?: string
  appointmentTime?: string
  status: string
  paymentStatus: string
  price?: number
  servicePrice?: number
  createdAt: string
}

interface Transaction {
  _id: string
  amount: number
  status: string
}

interface AdminStats {
  totalCustomers: number
  activeServices: number
  totalAppointments: number
  pendingAppointments: number
  confirmedAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  totalSuccessfulPayments: number
  totalRevenue: number
}

export default function AdminDashboardPage() {
  const { isRestoring, isAuthenticated, isAdmin } = useTokenStore()
  const { expressFetch } = useExpressApi()
  const [stats, setStats] = useState<AdminStats>({
    totalCustomers: 0,
    activeServices: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalSuccessfulPayments: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!isAdmin) return
    setLoading(true)
    setError(null)
    try {
      const [users, services, appointments, transactions] = await Promise.all([
        expressFetch<User[]>("/users"),
        expressFetch<Service[]>("/services"),
        expressFetch<Appointment[]>("/appointments"),
        expressFetch<Transaction[]>("/transactions"),
      ])

      const usersArray = Array.isArray(users) ? users : []
      const servicesArray = Array.isArray(services) ? services : []
      const appointmentsArray = Array.isArray(appointments) ? appointments : []
      const transactionsArray = Array.isArray(transactions) ? transactions : []

      const totalCustomers = usersArray.filter(u => u.role !== "admin").length
      const activeServices = servicesArray.filter(s => s.status === "active").length
      const totalAppointments = appointmentsArray.length
      const pendingAppointments = appointmentsArray.filter(a => a.status === "Pending").length
      const confirmedAppointments = appointmentsArray.filter(a => a.status === "Confirmed").length
      const completedAppointments = appointmentsArray.filter(a => a.status === "Completed").length
      const cancelledAppointments = appointmentsArray.filter(a => a.status === "Cancelled").length
      const successfulTransactions = transactionsArray.filter(t => t.status === "Paid")
      const totalSuccessfulPayments = successfulTransactions.length
      const totalRevenue = successfulTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)

      setStats({
        totalCustomers,
        activeServices,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        totalSuccessfulPayments,
        totalRevenue,
      })
    } catch (e) {
      if (e instanceof ExpressApiError && e.status === 401) {
        setError("Your session has expired. Please sign in again.")
      } else if (e instanceof ExpressApiError && e.status === 403) {
        setError("Access denied.")
      } else {
        const message = e instanceof Error ? e.message : "Failed to load dashboard stats"
        setError(message)
        showError({ title: "Failed to Load Dashboard", description: message })
      }
    } finally {
      setLoading(false)
    }
  }, [expressFetch, isAdmin])

  useEffect(() => {
    if (isRestoring) return
    if (!isAuthenticated || !isAdmin) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats()
  }, [isRestoring, isAuthenticated, isAdmin, fetchStats])

  const cards: {
    title: string
    value: number
    icon: typeof Users
    tone: StatTone
    hint: string
  }[] = [
    { title: "Total Registered Customers", value: stats.totalCustomers, icon: Users, tone: "blue", hint: "All customer accounts" },
    { title: "Total Active Services", value: stats.activeServices, icon: Scissors, tone: "gold", hint: "Services available for booking" },
    { title: "Total Appointment Requests", value: stats.totalAppointments, icon: CalendarDays, tone: "sage", hint: "All bookings across the platform" },
    { title: "Pending Appointments", value: stats.pendingAppointments, icon: Clock, tone: "amber", hint: "Awaiting confirmation" },
    { title: "Confirmed Appointments", value: stats.confirmedAppointments, icon: CalendarCheck, tone: "blue", hint: "Ready for service" },
    { title: "Cancelled Appointments", value: stats.cancelledAppointments, icon: X, tone: "red", hint: "Cancelled by customer or admin" },
    { title: "Completed Appointments", value: stats.completedAppointments, icon: BadgeCheck, tone: "green", hint: "Visits completed" },
    { title: "Total Successful Payments", value: stats.totalSuccessfulPayments, icon: CreditCard, tone: "green", hint: `${stats.totalRevenue > 0 ? `$${stats.totalRevenue.toLocaleString()}` : "$0"} in revenue` },
  ]

  if (isRestoring || loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="SalonBook Admin"
          title="Admin Dashboard"
          description="Loading dashboard statistics…"
        />
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-w-0">
          {cards.map((c, i) => (
            <StatCard
              key={c.title}
              label={c.title}
              value="…"
              icon={c.icon}
              tone={c.tone}
              hint={c.hint}
              order={i}
              simple
            />
          ))}
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="SalonBook Admin"
          title="Access Denied"
          description="You need admin privileges to view this page."
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="SalonBook Admin"
          title="Admin Dashboard"
          description="Failed to load dashboard statistics"
        />
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-background/60 px-6 py-10 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={fetchStats} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SalonBook Admin"
        title="Admin Dashboard"
        description="Overview of your salon's performance and activity."
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-w-0">
        {cards.map((c, i) => (
          <StatCard
            key={c.title}
            label={c.title}
            value={c.value}
            icon={c.icon}
            tone={c.tone}
            hint={c.hint}
            order={i}
            simple
          />
        ))}
      </div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/admin/services"
          className="animate-rise group flex flex-col rounded-xl border border-border bg-card p-5 surface-raised transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:surface-floating focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:outline-none"
          style={{ animationDelay: "70ms" }}
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-105">
            <Scissors className="size-5" aria-hidden="true" />
          </span>
          <span className="mt-4 font-heading text-base font-medium text-foreground">
            Manage Services
          </span>
          <span className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
            Add, edit and publish every salon service.
          </span>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">
            Open
            <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </span>
        </Link>
        <Link
          href="/admin/appointments"
          className="animate-rise group flex flex-col rounded-xl border border-border bg-card p-5 surface-raised transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:surface-floating focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:outline-none"
          style={{ animationDelay: "140ms" }}
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-105">
            <ClipboardList className="size-5" aria-hidden="true" />
          </span>
          <span className="mt-4 font-heading text-base font-medium text-foreground">
            Manage Appointments
          </span>
          <span className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
            Review requests and keep bookings moving.
          </span>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">
            Open
            <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </span>
        </Link>
        <Link
          href="/admin/users"
          className="animate-rise group flex flex-col rounded-xl border border-border bg-card p-5 surface-raised transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:surface-floating focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:outline-none"
          style={{ animationDelay: "210ms" }}
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-105">
            <Users className="size-5" aria-hidden="true" />
          </span>
          <span className="mt-4 font-heading text-base font-medium text-foreground">
            Manage Users
          </span>
          <span className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
            Control customer accounts and access.
          </span>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">
            Open
            <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </span>
        </Link>
        <Link
          href="/book-appointment"
          className="animate-rise group flex flex-col rounded-xl border border-border bg-card p-5 surface-raised transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:surface-floating focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:outline-none"
          style={{ animationDelay: "280ms" }}
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-105">
            <CalendarDays className="size-5" aria-hidden="true" />
          </span>
          <span className="mt-4 font-heading text-base font-medium text-foreground">
            New Booking
          </span>
          <span className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
            See the booking flow exactly as customers do.
          </span>
          <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">
            Open
            <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </span>
        </Link>
      </div>
    </div>
  )
}