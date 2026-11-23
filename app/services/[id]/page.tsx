"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Award, Crown, Scissors } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ServiceCard } from "@/components/service-card"
import { showError } from "@/lib/toast"
import { fetchWithTimeout } from "@/lib/fetch"
import { useTokenStore } from "@/lib/token-store"

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
const PLACEHOLDER_IMAGE = "/images/hero-barbershop.jpg"

export default function ServiceDetailsPage() {
  const params = useParams()
  const id = params?.id as string
  const router = useRouter()
  const { isRestoring, isAuthenticated } = useTokenStore()

  const [service, setService] = useState<Service | null>(null)
  const [allServices, setAllServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const [imageError, setImageError] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isRestoring && !isAuthenticated) {
      router.push("/sign-in")
    }
  }, [isRestoring, isAuthenticated, router])

  useEffect(() => {
    const controller = new AbortController()

    async function fetchServices() {
      setLoading(true)
      setError(null)
      setService(null)
      setAllServices([])

      try {
        const res = await fetchWithTimeout(`${API_BASE}/services`, {
          signal: controller.signal,
          cache: "no-store",
        })
        if (!res.ok) throw new Error("Failed to fetch services")
        const data = (await res.json()) as Service[]
        if (controller.signal.aborted) return
        setAllServices(data)
        const found = data.find((s) => s._id === id) ?? null
        if (!found) setError("Service not found")
        else setService(found)
      } catch (e) {
        if (controller.signal.aborted) return
        const message = e instanceof Error ? e.message : "Something went wrong"
        setError(message)
        showError({ title: "Failed to Load Service", description: message })
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    if (id && isAuthenticated && !isRestoring) fetchServices()
    return () => controller.abort()
  }, [id, retryKey, isAuthenticated, isRestoring])

  const isAdmin = false
  const isActive = service?.status === "active"
  const related = allServices
    .filter((s) => s.status === "active" && s._id !== id)
    .slice(0, 3)

  function handleBook() {
    if (!isAuthenticated) {
      router.push(`/sign-in?redirect=/services/${id}`)
      return
    }
    if (isAdmin) return
    router.push(`/book-appointment?serviceId=${id}`)
  }

  if (loading || isRestoring) {
    return (
      <div className="bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <Skeleton className="h-4 w-48 mb-6" />
          <Skeleton className="aspect-[16/7] w-full rounded-2xl mb-6" />
          <div className="rounded-2xl border border-border bg-card p-8 surface-raised">
            <Skeleton className="h-4 w-48 mb-3" />
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-12 w-full mb-6" />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-6">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="w-full h-11 sm:w-auto" />
            </div>
          </div>
          <div className="mt-12">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3 rounded-xl border border-border bg-card p-6">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
          <div className="mt-12">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-6 text-center">
                  <Skeleton className="mx-auto size-8 mb-3" />
                  <Skeleton className="h-5 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-destructive dark:text-champagne">{error ?? "Service not found"}</p>
        <Button onClick={() => setRetryKey((k) => k + 1)} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <nav className="mb-7 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <Link href="/" className="rounded-sm transition-colors hover:text-gold focus-visible:text-gold">Home</Link>
          {" / "}
          <Link href="/services" className="rounded-sm transition-colors hover:text-gold focus-visible:text-gold">Browse Services</Link>
          {" / "}
          <span className="text-foreground">{service.serviceName}</span>
        </nav>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch">
          <img
            src={imageError ? PLACEHOLDER_IMAGE : service.image}
            alt={service.serviceName}
            className="h-full min-h-72 w-full rounded-2xl border border-border object-cover object-[center_25%] shadow-xl shadow-midnight/15"
            onError={() => setImageError(true)}
          />
          <div className="relative overflow-hidden rounded-2xl bg-charcoal p-6 text-ivory shadow-xl shadow-midnight/20 sm:p-8">
            <span aria-hidden="true" className="absolute -top-20 -right-16 size-56 rounded-full border border-gold/20" />
            <div className="relative flex h-full flex-col">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">SALONBOOK PREMIUM SERVICE</p>
              <span className="mt-4 inline-flex w-fit rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-sm text-gold">{service.category}</span>
              <h1 className="mt-5 font-heading text-3xl font-semibold leading-tight sm:text-4xl">{service.serviceName}</h1>
              <p className="mt-4 leading-7 text-champagne">{service.description}</p>
              <div className="mt-7 flex flex-wrap items-end justify-between gap-5 border-t border-dark-border pt-5">
                <div className="flex items-center gap-5">
                  <span className="font-heading text-3xl font-semibold text-gold">${service.price}</span>
                  <span className="border-l border-dark-border pl-5 text-sm text-champagne">{service.duration} min</span>
                </div>
              </div>
              <Button
                className="mt-6 w-full bg-gold px-6 text-midnight hover:bg-gold-hover hover:shadow-lg hover:shadow-gold/15 sm:w-auto"
                disabled={isAdmin || !isActive}
                onClick={handleBook}
              >
                {isAdmin ? "Booking not available for admin" : "Book Appointment"}
              </Button>
              <p className="mt-4 text-sm text-champagne">Status: {service.status}</p>
              {!isActive && <p className="mt-2 text-destructive dark:text-champagne">This service is not available for booking.</p>}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-heading text-2xl font-semibold text-foreground">About This Service</h2>
          <Card className="mt-5 border-border bg-card surface-raised">
            <CardContent className="grid gap-5 p-6 text-muted-foreground sm:grid-cols-[minmax(0,1.35fr)_minmax(12rem,0.65fr)] sm:p-7">
              <p className="leading-7">{service.description}</p>
              <div className="grid gap-3 rounded-xl border border-border bg-muted/45 p-4 text-sm">
                <p><strong className="text-foreground">Category:</strong> {service.category}</p>
                <p><strong className="text-foreground">Duration:</strong> {service.duration} min</p>
                <p><strong className="text-foreground">Price:</strong> ${service.price}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-14">
          <h2 className="font-heading text-2xl font-semibold text-foreground">Why Choose SalonBook</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {[
              { icon: Scissors, title: "Expert Styling", desc: "Skilled professionals for your look." },
              { icon: Crown, title: "Premium Care", desc: "Quality products and service." },
              { icon: Award, title: "Personalized Experience", desc: "Tailored to your needs." },
            ].map((f) => (
              <Card key={f.title} className="group border-border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:surface-floating">
                <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-gold/10 text-gold transition-transform duration-300 group-hover:scale-105"><f.icon className="size-6" /></span>
                <h3 className="mt-3 font-heading text-lg text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="font-heading text-2xl font-semibold text-foreground">Related Services</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s) => (
                <ServiceCard key={s._id} service={s} />
              ))}
            </div>
          </section>
        )}

        <section className="relative mt-14 overflow-hidden rounded-2xl bg-midnight px-6 py-14 text-center sm:px-10">
          <span aria-hidden="true" className="absolute -top-20 left-1/2 size-72 -translate-x-1/2 rounded-full border border-gold/20" />
          <div className="relative">
          <h2 className="font-heading text-2xl font-semibold text-ivory">Ready for a Fresh Look?</h2>
          <p className="mt-2 text-champagne">Book your next grooming experience with SalonBook.</p>
          <Button
            className="mt-6 bg-gold px-6 text-midnight hover:bg-gold-hover hover:shadow-lg hover:shadow-gold/15"
            disabled={isAdmin || !isActive}
            onClick={handleBook}
          >
            Book Your Appointment
          </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
