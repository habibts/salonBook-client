"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ServiceCard } from "@/components/service-card"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { showError } from "@/lib/toast"
import { fetchWithTimeout } from "@/lib/fetch"

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

function ServicesPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState(searchParams.get("category") ?? "all")
  const [sort, setSort] = useState("none")

  // Sync category with URL search params
  useEffect(() => {
    const urlCategory = searchParams.get("category")
    if (urlCategory !== category) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategory(urlCategory ?? "all")
    }
  }, [searchParams, category])

  function updateUrl(params: Record<string, string>) {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(params).forEach(([key, value]) => {
      if (value) newParams.set(key, value)
      else newParams.delete(key)
    })
    router.push(`/services?${newParams.toString()}`, { scroll: false })
  }

  async function fetchServices() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchWithTimeout(`${API_BASE}/services`, { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to fetch services")
      const data = (await res.json()) as Service[]
      setServices(data)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong"
      setError(message)
      showError({ title: "Failed to Load Services", description: message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchServices()
  }, [])

  const activeServices = useMemo(
    () => services.filter((s) => s.status === "active"),
    [services]
  )

  const categories = useMemo(
    () => Array.from(new Set(activeServices.map((s) => s.category))),
    [activeServices]
  )

  const filtered = useMemo(() => {
    let list = activeServices.filter((s) =>
      s.serviceName.toLowerCase().includes(search.toLowerCase())
    )
    if (category !== "all") list = list.filter((s) => s.category === category)
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price)
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price)
    return list
  }, [activeServices, search, category, sort])

  function clearFilters() {
    setSearch("")
    setCategory("all")
    setSort("none")
    updateUrl({})
  }

  return (
    <div className="bg-background py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card px-5 py-7 surface-raised sm:px-8 sm:py-9">
          <span aria-hidden="true" className="absolute -top-20 -right-16 size-56 rounded-full border border-gold/20" />
          <span aria-hidden="true" className="absolute top-0 right-0 h-px w-1/3 bg-gradient-to-l from-gold/70 to-transparent" />
          <div className="relative">
            <p className="flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.22em] text-charcoal uppercase dark:text-gold">
              <span aria-hidden="true" className="h-px w-7 bg-gold/70" />
              SalonBook services
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold text-foreground sm:text-4xl">
              Explore Our Services
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              Discover premium grooming services tailored to your style.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-4 surface-raised sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => {
                const value = e.target.value
                setSearch(value)
                updateUrl({ search: value })
              }}
              className="h-11 border-border bg-background pl-10 text-foreground"
            />
          </div>
          <Select value={category} onValueChange={(v) => {
            const value = v ?? "all"
            setCategory(value)
            updateUrl({ category: value === "all" ? "" : value })
          }}>
            <SelectTrigger className="h-11 w-full border-border bg-background text-foreground md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => {
            const value = v ?? "none"
            setSort(value)
            updateUrl({ sort: value === "none" ? "" : value })
          }}>
            <SelectTrigger className="h-11 w-full border-border bg-background text-foreground md:w-48">
              <SelectValue placeholder="Sort by price" />
            </SelectTrigger>
            <SelectContent className="border-border bg-card text-foreground">
              <SelectItem value="none">Default</SelectItem>
              <SelectItem value="low">Price: Low to High</SelectItem>
              <SelectItem value="high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={clearFilters} className="h-11 border-border bg-card px-5">
            Clear Filters
          </Button>
          </div>
        </section>

        {!loading && !error && (
          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{filtered.length} services found</p>
            <span className="hidden h-px flex-1 bg-border sm:block" />
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="flex h-full flex-col overflow-hidden border-border bg-card">
                <Skeleton className="aspect-[16/9] w-full" />
                <CardHeader className="flex-1 p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-5 w-20" />
                </CardHeader>
                <CardContent className="flex flex-1 flex-col p-4">
                  <Skeleton className="h-12 w-full mb-3" />
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
                <CardFooter className="mt-auto p-4">
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <p className="text-sm text-destructive dark:text-champagne">{error}</p>
            <Button onClick={fetchServices} className="mt-4">
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
            <p className="font-heading text-xl text-foreground">No services found</p>
            <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <ServicesPageContent />
    </Suspense>
  )
}
