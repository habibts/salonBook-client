"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"
import { showSuccess, showError } from "@/lib/toast"

interface Service {
  _id: string
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
  status: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const slots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"]
const PLACEHOLDER_IMAGE = "/images/hero-barbershop.jpg"

function BookingContent() {
  const params = useSearchParams()
  const serviceId = params.get("serviceId") ?? ""
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const user = session?.user

  const [service, setService] = useState<Service | null>(null)
  const [date, setDate] = useState("")
  const [slot, setSlot] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (!serviceId) return
    fetch(`${API_BASE}/services`)
      .then((r) => r.json())
      .then((data: Service[]) => {
        const found = data.find((s) => s._id === serviceId) ?? null
        setService(found)
      })
      .finally(() => setLoading(false))
  }, [serviceId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !service || !date || !slot) {
      showError({ title: "Missing Fields", description: "Please fill in all required fields." })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user.id,
          customerName: user.name,
          customerEmail: user.email,
          serviceId: service._id,
          appointmentDate: date,
          timeSlot: slot,
          message,
        }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || await res.text())
      }
      showSuccess({ title: "Appointment Requested", description: "Your appointment request has been submitted." })
      router.push("/customer/appointments")
    } catch (e) {
      showError({ title: "Booking Failed", description: e instanceof Error ? e.message : "Failed to book appointment. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Card className="border-[#E9E3D8] bg-white">
          <CardHeader>
            <CardTitle className="font-heading text-[#151515]">
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-4 aspect-[16/9] w-full rounded-lg" />
            <p className="text-[#77736D]"><Skeleton className="h-4 w-64" /></p>
            <form className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-[#151515]">Date</label>
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <label className="text-sm text-[#151515]">Time Slot</label>
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((s) => (
                    <Skeleton key={s} className="h-10 w-full" />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-[#151515]">Message</label>
                <Skeleton className="h-24 w-full" />
              </div>
              <Button disabled className="w-full">
                <Skeleton className="h-10 w-full" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }
  if (!service) return <div className="container mx-auto max-w-3xl px-4 py-8">Service not found</div>

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card className="border-[#E9E3D8] bg-white">
        <CardHeader>
          <CardTitle className="font-heading text-[#151515]">{service.serviceName}</CardTitle>
        </CardHeader>
        <CardContent>
          <img
            src={imageError ? PLACEHOLDER_IMAGE : service.image}
            alt={service.serviceName}
            className="mb-4 aspect-[16/9] w-full rounded-lg object-cover"
            onError={() => setImageError(true)}
          />
          <p className="text-[#77736D]">{service.category} · ${service.price} · {service.duration} min</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-[#151515]">Date</label>
              <Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm text-[#151515]">Time Slot</label>
              <div className="grid grid-cols-4 gap-2">
                {slots.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={slot === s ? "default" : "outline"}
                    onClick={() => setSlot(s)}
                    className={slot === s ? "bg-[#C5A46D] text-[#151515]" : ""}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-[#151515]">Message</label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-[#C5A46D] text-[#151515] hover:bg-[#AE8C56]">
              {submitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <BookingContent />
    </Suspense>
  )
}
