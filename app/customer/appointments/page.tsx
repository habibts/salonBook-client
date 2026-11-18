"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Toaster, toast } from "@/components/ui/toast"

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

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>

  return (
    <div className="space-y-4">
      <Toaster />
      {appointments.length === 0 ? (
        <p className="text-[#77736D]">No appointments found.</p>
      ) : (
        appointments.map((a) => (
          <Card key={a._id} className="border-[#3A3834] bg-[#292929] text-[#F7F5F0]">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row">
              {a.serviceImage && <img src={a.serviceImage} alt={a.serviceName} className="h-24 w-24 rounded object-cover" />}
              <div className="flex-1">
                <h3 className="font-heading text-lg">{a.serviceName}</h3>
                <p className="text-sm text-[#C7C2B9]">{a.appointmentDate} {a.appointmentTime} · ${a.price} · {a.duration} min</p>
                <p className="text-sm">Status: {a.status} · Payment: {a.paymentStatus}</p>
                <p className="text-xs text-[#77736D]">Requested: {a.createdAt}</p>
              </div>
              <div className="flex items-center">
                {a.status === "Pending" && (
                  <Button onClick={() => cancel(a._id)} className="bg-red-500 text-white hover:bg-red-600">
                    Cancel
                  </Button>
                )}
                {a.status === "Confirmed" && a.paymentStatus === "Unpaid" && (
                  <Button className="bg-[#C5A46D] text-[#151515]">Pay Now</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
