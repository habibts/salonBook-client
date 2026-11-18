"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("none")

  async function fetchServices() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/services`)
      if (!res.ok) throw new Error("Failed to fetch services")
      const data = (await res.json()) as Service[]
      setServices(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchServices} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (activeServices.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>No services available.</p>
      </div>
    )
  }

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 size-4 text-[#A7A39C]" />
            <Input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-dark-border bg-charcoal pl-9 text-ivory placeholder:text-[#A7A39C]"
            />
          </div>
          <Select value={category} onValueChange={(v) => setCategory(v ?? "all")}>
            <SelectTrigger className="w-full border-dark-border bg-charcoal text-ivory md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="border-dark-border bg-charcoal text-ivory">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v ?? "none")}>
            <SelectTrigger className="w-full border-dark-border bg-charcoal text-ivory md:w-48">
              <SelectValue placeholder="Sort by price" />
            </SelectTrigger>
            <SelectContent className="border-dark-border bg-charcoal text-ivory">
              <SelectItem value="none">Default</SelectItem>
              <SelectItem value="low">Low to High</SelectItem>
              <SelectItem value="high">High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-[#A7A39C]">No search results found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service) => (
              <Card key={service._id} className="overflow-hidden border-dark-border bg-charcoal text-ivory">
                <img
                  src={service.image}
                  alt={service.serviceName}
                  className="h-48 w-full object-cover"
                />
                <CardHeader>
                  <CardTitle className="font-heading text-ivory">{service.serviceName}</CardTitle>
                  <Badge className="bg-gold/10 text-gold">{service.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#A7A39C]">{service.description}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-semibold text-gold">${service.price}</span>
                    <span>{service.duration} min</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-gold text-midnight hover:bg-gold-hover">
                    <Link href={`/services/${service._id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
  )
}
