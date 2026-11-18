"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ServiceCard } from "@/components/service-card"

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

export function FeaturedServices() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchServices() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/services`)
      if (!res.ok) throw new Error("Failed to fetch services")
      const data = (await res.json()) as Service[]
      const active = data
        .filter((s) => s.status === "active")
        .sort((a, b) => b._id.localeCompare(a._id))
        .slice(0, 6)
      setServices(active)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  return (
    <section className="bg-[#151515] px-4 py-16">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-[#C5A46D]">
          OUR PREMIUM SERVICES
        </p>
        <h2 className="mt-3 font-heading text-3xl font-semibold text-[#F7F5F0] sm:text-4xl">
          Experience the Art of Grooming
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[#C7C2B9]">
          Discover premium grooming services designed to elevate your style and confidence.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-7xl bg-[#F7F5F0] p-6 sm:p-8">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchServices} className="mt-4">
              Retry
            </Button>
          </div>
        ) : services.length === 0 ? (
          <p className="text-center text-[#77736D]">No services available.</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button
                className="border border-[#151515] bg-[#151515] text-[#C5A46D] hover:bg-[#292929] hover:text-[#F7F5F0]"
                onClick={() => router.push("/services")}
              >
                Explore All Services
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
