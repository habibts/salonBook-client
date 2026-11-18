"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface Service {
  _id: string
  category: string
  image: string
  status: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

export function ServiceCategories() {
  const [categories, setCategories] = useState<{ name: string; image: string }[]>([])

  useEffect(() => {
    fetch(`${API_BASE}/services`)
      .then((r) => r.json())
      .then((data: Service[]) => {
        const active = data.filter((s) => s.status === "active")
        const map = new Map<string, string>()
        active.forEach((s) => {
          if (!map.has(s.category)) map.set(s.category, s.image)
        })
        setCategories(Array.from(map, ([name, image]) => ({ name, image })))
      })
      .catch(() => setCategories([]))
  }, [])

  if (categories.length === 0) return null

  return (
    <section className="bg-[#151515] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-widest text-[#C5A46D]">DISCOVER OUR EXPERTISE</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold text-[#F7F5F0]">Explore Our Services</h2>
        <div className="mt-2 h-px w-12 bg-[#C5A46D]" />
        <p className="mt-4 max-w-2xl text-[#77736D]">
          From precision cuts to premium grooming, discover the perfect service for your style.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {categories.map((c, i) => (
            <Link
              key={c.name}
              href={`/services?category=${encodeURIComponent(c.name)}`}
              className="group relative w-full overflow-hidden rounded-xl border border-[#E9E3D8] sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]"
            >
              <img
                src={c.image}
                alt={c.name}
                className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151515]/80 to-[#151515]/20 transition-opacity group-hover:opacity-90" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-xs text-[#C5A46D]">0{i + 1}</span>
                <h3 className="font-heading text-lg text-white">{c.name}</h3>
                <span className="inline-flex items-center gap-1 text-sm text-[#C5A46D] transition-transform group-hover:translate-x-1">
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
