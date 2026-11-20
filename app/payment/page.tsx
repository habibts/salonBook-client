"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement } from "@stripe/react-stripe-js"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

export function PaymentPageContent() {
  const params = useSearchParams()
  const appointmentId = params.get("appointmentId") ?? ""
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!appointmentId) {
      setError("Missing appointment")
      setLoading(false)
      return
    }
    fetch(`${API_BASE}/payments/create-payment-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text())
        return r.json()
      })
      .then((data) => setClientSecret(data.clientSecret))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [appointmentId])

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>
  if (error) return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>
  if (!clientSecret) return null

  return (
    <div className="min-h-screen bg-[#F1EDE5] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-heading text-3xl font-semibold text-[#171717]">Complete Your Booking</h1>
        <Card className="mt-6 border-[#DED6C8] bg-white">
          <CardHeader>
            <CardTitle className="text-[#171717]">Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentElement />
            </Elements>
            <Button disabled className="mt-6 w-full bg-[#B8955A] text-[#171717]">
              <Lock className="mr-2 size-4" /> Pay Now (coming soon)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  )
}
