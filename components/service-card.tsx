"use client"

import { useRouter } from "next/navigation"
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

export function ServiceCard({ service }: { service: Service }) {
  const router = useRouter()
  return (
    <Card className="flex h-full flex-col overflow-hidden border-[#3A3834] bg-[#292929] text-[#F7F5F0]">
      <img src={service.image} alt={service.serviceName} className="aspect-[16/9] w-full object-cover" />
      <CardHeader className="flex-1">
        <CardTitle className="line-clamp-2 font-heading text-[#F7F5F0]">{service.serviceName}</CardTitle>
        <Badge className="bg-[#C5A46D]/10 text-[#C5A46D]">{service.category}</Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="line-clamp-3 text-sm text-[#C7C2B9]">{service.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-sm">
          <span className="font-semibold text-[#C5A46D]">${service.price}</span>
          <span className="text-[#F7F5F0]">{service.duration} min</span>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button
          className="w-full bg-[#C5A46D] text-[#151515] hover:bg-[#AE8C56]"
          onClick={() => router.push(`/services/${service._id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}
