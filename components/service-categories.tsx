"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { showError } from "@/lib/toast"
import { fetchWithTimeout } from "@/lib/fetch"

interface Service {
  _id: string
  category: string
  image: string
  status: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

export function ServiceCategories() {
  const [categories, setCategories] = useState<{ name: string; image: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchCategories() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchWithTimeout(`${API_BASE}/services`)
      if (!res.ok) throw new Error("Failed to fetch services")
      const data = (await res.json()) as Service[]
      const active = data.filter((s) => s.status === "active")
      const map = new Map<string, string>()
      active.forEach((s) => {
        if (!map.has(s.category)) map.set(s.category, s.image)
      })
      setCategories(Array.from(map, ([name, image]) => ({ name, image })))
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong"
      setError(message)
      showError({ title: "Failed to Load Categories", description: message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories()
  }, [])

  if (loading) {
    return (
      <section className="bg-light-rose py-16 md:py-20 dark:bg-midnight">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-xl border border-soft-border dark:border-dark-border"
              >
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <Skeleton className="h-3 w-12 mb-2" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="bg-light-rose py-16 md:py-20 dark:bg-midnight">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchCategories} className="mt-4">
            Retry
          </Button>
        </div>
      </section>
    )
  }

  if (categories.length === 0) return null

  return (
    <section className="bg-light-rose py-16 md:py-20 lg:py-24 dark:bg-midnight">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-rose dark:text-gold">DISCOVER OUR EXPERTISE</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold text-dark-text dark:text-white">Explore Our Services</h2>
        <div className="mt-2 h-px w-12 bg-primary-rose dark:bg-gold" />
        <p className="mt-4 max-w-2xl text-muted-text dark:text-champagne">
          From precision cuts to premium grooming, discover the perfect service for your style.
        </p>

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Link
              key={c.name}
              href={`/services?category=${encodeURIComponent(c.name)}`}
              className="group relative overflow-hidden rounded-xl border border-soft-border transition-all duration-500 hover:-translate-y-1 hover:border-primary-rose/60 hover:shadow-xl focus-visible:-translate-y-1 focus-visible:border-primary-rose/60 focus-visible:shadow-xl dark:border-dark-border"
            >
              <img
                src={c.image}
                alt={c.name}
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-text/60 to-dark-text/10 transition-opacity duration-500 group-hover:from-dark-text/80 dark:from-midnight/60 dark:to-midnight/10" />
              <div className="absolute right-0 bottom-0 left-0 p-5">
                <span className="text-xs text-primary-rose dark:text-gold">0{i + 1}</span>
                <h3 className="font-heading text-lg text-white">{c.name}</h3>
                <span className="inline-flex items-center gap-1 text-sm text-primary-rose transition-transform group-hover:translate-x-1 dark:text-gold">
                  Explore Services <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
