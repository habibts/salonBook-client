"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Service {
  _id: string
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
}

const PLACEHOLDER_IMAGE = "/images/hero-barbershop.jpg"

export function ServiceCard({ service }: { service: Service }) {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)

  return (
    <Card className="group flex h-full flex-col border-border bg-card text-card-foreground hover:-translate-y-1 hover:border-gold/60 hover:surface-floating focus-within:border-gold/70 focus-within:surface-floating">
      <img
        src={imageError ? PLACEHOLDER_IMAGE : service.image}
        alt={service.serviceName}
        className="aspect-[16/9] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.045]"
        onError={() => setImageError(true)}
      />
      <CardHeader className="flex-1">
        <CardTitle className="line-clamp-2 font-heading text-lg text-foreground">{service.serviceName}</CardTitle>
        <Badge className="border-gold/30 bg-gold/10 text-charcoal dark:text-gold">{service.category}</Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{service.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          <span className="font-semibold text-charcoal dark:text-gold">${service.price}</span>
          <span className="text-muted-foreground">{service.duration} min</span>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button
          className="w-full bg-gold text-midnight hover:bg-gold-hover"
          onClick={() => router.push(`/services/${service._id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
