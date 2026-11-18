"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarDays, CheckCircle2, Clock, XCircle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

interface Appointment {
  _id: string
  customerId: string
  serviceName: string
  appointmentDate: string
  appointmentTime: string
  status: string
  paymentStatus: string
  servicePrice: number
  createdAt: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

export default function CustomerDashboardPage() {
  const { data: session } = authClient.useSession()
  const user = session?.user
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetch(`${API_BASE}/appointments`)
      .then((r) => r.json())
      .then((data: Appointment[]) => {
        setAppointments(data.filter((a) => a.customerId === user.id))
      })
      .finally(() => setLoading(false))
  }, [user])

  const total = appointments.length
  const pending = appointments.filter((a) => a.status === "Pending").length
  const confirmed = appointments.filter((a) => a.status === "Confirmed").length
  const completed = appointments.filter((a) => a.status === "Completed").length

  const recent = [...appointments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const cards = [
    { title: "Total Appointments", value: total, icon: CalendarDays },
    { title: "Pending Appointments", value: pending, icon: Clock },
    { title: "Confirmed Appointments", value: confirmed, icon: CheckCircle2 },
    { title: "Completed Appointments", value: completed, icon: XCircle },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title} className="border-[#3A3834] bg-[#292929] text-[#F7F5F0]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-[#C7C2B9]">{c.title}</CardTitle>
              <c.icon className="size-5 text-[#C5A46D]" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{loading ? "..." : c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#3A3834] bg-[#292929] text-[#F7F5F0]">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Appointments</CardTitle>
          <Button onClick={() => (window.location.href = "/customer/appointments")} className="bg-[#C5A46D] text-[#151515] hover:bg-[#AE8C56]">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : recent.length === 0 ? (
            <p className="text-[#C7C2B9]">No appointments yet.</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((a) => (
                <li key={a._id} className="flex items-center justify-between border-b border-[#3A3834] pb-2">
                  <span>{a.serviceName}</span>
                  <span className="text-sm text-[#C7C2B9]">{a.appointmentDate} {a.appointmentTime}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
