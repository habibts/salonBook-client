"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useTokenStore } from "@/lib/token-store"
import { useExpressApi, ExpressApiError } from "@/lib/express-api"
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
import { fetchWithTimeout } from "@/lib/fetch"

function BookingContent() {
  const params = useSearchParams()
  const serviceId = params.get("serviceId") ?? ""
  const router = useRouter()
  const { tokenData, isRestoring, isAuthenticated } = useTokenStore()
  const { expressFetch } = useExpressApi()
  const user = tokenData?.user
  const [service, setService] = useState<Service | null>(null)
  const [date, setDate] = useState("")
  const [slot, setSlot] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Wait for authentication restoration to complete before fetching
  useEffect(() => {
    if (isRestoring) return
    if (!serviceId) return

    let cancelled = false

    async function loadService() {
      setLoading(true)
      try {
        const response = await fetchWithTimeout(`${API_BASE}/services`)
        const data: Service[] = await response.json()
        if (!cancelled) {
          const found = data.find((s) => s._id === serviceId) ?? null
          setService(found)
        }
      } catch {
        if (!cancelled) {
          setService(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadService()

    return () => {
      cancelled = true
    }
  }, [serviceId, isRestoring])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !service || !date || !slot) {
      showError({ title: "Missing Fields", description: "Please fill in all required fields." })
      return
    }
    setSubmitting(true)
    try {
      interface ApiResponse { success: boolean }
      await expressFetch<ApiResponse>("/appointments", {
        method: "POST",
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
      showSuccess({ title: "Appointment Requested", description: "Your appointment request has been submitted." })
      router.push("/customer/appointments")
    } catch (e) {
      if (e instanceof ExpressApiError && e.status === 401) {
        showError({ title: "Session Expired", description: "Your session has expired. Please sign in again." })
      } else if (e instanceof ExpressApiError && e.status === 403) {
        showError({ title: "Access Denied", description: "You do not have permission to book appointments." })
      } else if (e instanceof ExpressApiError && e.status === 409) {
        showError({ title: "Slot Unavailable", description: e.message })
      } else if (e instanceof ExpressApiError && e.status === 400) {
        showError({ title: "Invalid Request", description: e.message })
      } else {
        showError({ title: "Booking Failed", description: e instanceof Error ? e.message : "Failed to book appointment. Please try again." })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Show loading while authentication is restoring
  if (isRestoring) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-heading text-foreground">
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-4 aspect-[16/9] w-full rounded-lg" />
            <p className="text-muted-foreground"><span><Skeleton className="h-4 w-64" /></span></p>
            <form className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-foreground">Date</label>
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <label className="text-sm text-foreground">Time Slot</label>
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((s) => (
                    <Skeleton key={s} className="h-10 w-full" />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-foreground">Message</label>
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

  // Show sign-in prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-foreground">Please sign in to book an appointment.</p>
            <Button onClick={() => router.push("/sign-in")} className="mt-4 bg-gold text-midnight hover:bg-gold-hover">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-heading text-foreground">
              <Skeleton className="h-6 w-48" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-4 aspect-[16/9] w-full rounded-lg" />
            <p className="text-muted-foreground"><span><Skeleton className="h-4 w-64" /></span></p>
            <form className="mt-6 space-y-4">
              <div>
                <label className="text-sm text-foreground">Date</label>
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <label className="text-sm text-foreground">Time Slot</label>
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((s) => (
                    <Skeleton key={s} className="h-10 w-full" />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-foreground">Message</label>
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
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-heading text-foreground">{service.serviceName}</CardTitle>
        </CardHeader>
        <CardContent>
          <img
            src={imageError ? PLACEHOLDER_IMAGE : service.image}
            alt={service.serviceName}
            className="mb-4 aspect-[16/9] w-full rounded-lg object-cover"
            onError={() => setImageError(true)}
          />
          <p className="text-muted-foreground">{service.category} · ${service.price} · {service.duration} min</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-foreground">Date</label>
              <Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm text-foreground">Time Slot</label>
              <div className="grid grid-cols-4 gap-2">
                {slots.map((s) => (
                  <Button
                    key={s}
                    type="button"
                    variant={slot === s ? "default" : "outline"}
                    onClick={() => setSlot(s)}
                    className={slot === s ? "bg-gold text-midnight" : ""}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-foreground">Message</label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-gold text-midnight hover:bg-gold-hover">
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
