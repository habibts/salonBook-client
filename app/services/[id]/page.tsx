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
      <div className="bg-[#F7F5F0]">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-48 mb-6" />
          <Skeleton className="aspect-[16/7] w-full rounded-2xl mb-6" />
          <div className="rounded-2xl bg-[#292929] p-8">
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
            <div className="rounded-xl border border-[#E9E3D8] bg-white p-6 space-y-3">
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
                <div key={i} className="rounded-xl border border-[#E9E3D8] bg-white p-6 text-center">
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
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">{error ?? "Service not found"}</p>
        <Button onClick={() => setRetryKey((k) => k + 1)} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-[#F7F5F0]">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-[#77736D]">
          <Link href="/" className="hover:text-[#C5A46D]">Home</Link>
          {" / "}
          <Link href="/services" className="hover:text-[#C5A46D]">Browse Services</Link>
          {" / "}
          <span className="text-[#151515]">{service.serviceName}</span>
        </nav>

        <section>
          <img
            src={imageError ? PLACEHOLDER_IMAGE : service.image}
            alt={service.serviceName}
            className="aspect-[16/7] w-full rounded-2xl object-cover object-[center_25%]"
            onError={() => setImageError(true)}
          />
          <div className="mt-6 rounded-2xl bg-[#292929] p-8 text-[#F7F5F0]">
            <p className="text-xs uppercase tracking-widest text-[#C5A46D]">SALONBOOK PREMIUM SERVICE</p>
            <span className="mt-3 inline-block rounded-full bg-[#C5A46D]/10 px-3 py-1 text-sm text-[#C5A46D]">{service.category}</span>
            <h1 className="mt-4 font-heading text-3xl font-semibold sm:text-4xl">{service.serviceName}</h1>
            <p className="mt-4 text-[#C7C2B9]">{service.description}</p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-6">
                <span className="text-2xl font-semibold text-[#C5A46D]">${service.price}</span>
                <span className="text-[#F7F5F0]">{service.duration} min</span>
              </div>
              <Button
                className="w-full bg-[#C5A46D] text-[#151515] hover:bg-[#AE8C56] sm:w-auto"
                disabled={isAdmin || !isActive}
                onClick={handleBook}
              >
                {isAdmin ? "Booking not available for admin" : "Book Appointment"}
              </Button>
            </div>
            <p className="mt-2 text-sm text-[#C7C2B9]">Status: {service.status}</p>
            {!isActive && <p className="mt-2 text-red-400">This service is not available for booking.</p>}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-semibold text-[#151515]">About This Service</h2>
          <Card className="mt-4 border-[#E9E3D8] bg-white">
            <CardContent className="space-y-3 p-6 text-[#77736D]">
              <p>{service.description}</p>
              <p><strong className="text-[#151515]">Category:</strong> {service.category}</p>
              <p><strong className="text-[#151515]">Duration:</strong> {service.duration} min</p>
              <p><strong className="text-[#151515]">Price:</strong> ${service.price}</p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-semibold text-[#151515]">Why Choose SalonBook</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Scissors, title: "Expert Styling", desc: "Skilled professionals for your look." },
              { icon: Crown, title: "Premium Care", desc: "Quality products and service." },
              { icon: Award, title: "Personalized Experience", desc: "Tailored to your needs." },
            ].map((f) => (
              <Card key={f.title} className="border-[#E9E3D8] bg-white p-6 text-center">
                <f.icon className="mx-auto size-8 text-[#C5A46D]" />
                <h3 className="mt-3 font-heading text-lg text-[#151515]">{f.title}</h3>
                <p className="mt-1 text-sm text-[#77736D]">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-heading text-2xl font-semibold text-[#151515]">Related Services</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s) => (
                <ServiceCard key={s._id} service={s} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 rounded-2xl bg-[#151515] px-6 py-12 text-center">
          <h2 className="font-heading text-2xl font-semibold text-[#F7F5F0]">Ready for a Fresh Look?</h2>
          <p className="mt-2 text-[#C7C2B9]">Book your next grooming experience with SalonBook.</p>
          <Button
            className="mt-6 bg-[#C5A46D] text-[#151515] hover:bg-[#AE8C56]"
            disabled={isAdmin || !isActive}
            onClick={handleBook}
          >
            Book Your Appointment
          </Button>
        </section>
      </div>
    </div>
  )
}