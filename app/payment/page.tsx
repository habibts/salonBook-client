"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  Clock,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  Smartphone,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

const METHODS: { label: string; icon: LucideIcon; note: string }[] = [
  { label: "Credit / Debit Card", icon: CreditCard, note: "Visa, Mastercard, Amex" },
  { label: "Mobile Banking", icon: Smartphone, note: "bKash, Nagad, Rocket" },
  { label: "PayPal", icon: Wallet, note: "Pay with your PayPal balance" },
]

const SUMMARY_ROWS: [string, string][] = [
  ["Hourly Rate", "$30"],
  ["Total Hours", "1"],
  ["Subtotal", "$30"],
  ["Security Deposit", "$10"],
  ["Service Fee", "$5"],
]

export default function PaymentPage() {
  const [method, setMethod] = useState("credit-/-debit-card")

  return (
    <div className="min-h-screen bg-background">
      {/* Midnight hero band: breadcrumb + page heading */}
      <div className="bg-midnight">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-10 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm">
            <ol className="flex flex-wrap items-center gap-1.5 text-[#A9A49C]">
              {[
                { label: "Home", href: "/" },
                { label: "Studios", href: "/services" },
                { label: "Booking", href: "/book-appointment" },
              ].map((crumb) => (
                <li key={crumb.label} className="inline-flex items-center gap-1.5">
                  <Link
                    href={crumb.href}
                    className="underline-offset-4 transition-colors hover:text-gold hover:underline"
                  >
                    {crumb.label}
                  </Link>
                  <ChevronRight className="size-3.5 text-[#6F6A62]" aria-hidden="true" />
                </li>
              ))}
              <li className="font-medium text-gold">Payment</li>
            </ol>
          </nav>

          <header className="mt-6">
            <p className="flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">
              <span aria-hidden="true" className="h-px w-7 bg-gold/70" />
              Checkout
            </p>
            <h1 className="mt-3 font-heading text-3xl leading-tight font-semibold text-ivory sm:text-[2.5rem]">
              Complete Your Booking
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#A9A49C]">
              Review your booking details and payment information before proceeding.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">
              <Lock className="size-3.5" aria-hidden="true" />
              Secure checkout
            </span>
          </header>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          {/* Payment method + card details */}
          <Card className="animate-rise border-border bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg">Payment Method</CardTitle>
              <CardDescription>Choose how you would like to pay.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <RadioGroup
                value={method}
                onValueChange={setMethod}
                className="grid gap-3 sm:grid-cols-3"
              >
                {METHODS.map((m) => {
                  const value = m.label.toLowerCase().replace(/\s/g, "-")
                  const selected = method === value
                  return (
                    <label
                      key={m.label}
                      className={cn(
                        "flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition-all duration-200 outline-none",
                        "focus-visible:ring-2 focus-visible:ring-gold/50",
                        selected
                          ? "border-gold bg-gold/10 shadow-[inset_0_0_0_1px_rgba(184,149,90,0.35)]"
                          : "border-border bg-background/60 hover:border-gold/50 hover:bg-background"
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <m.icon
                          className={cn(
                            "size-5 transition-colors",
                            selected ? "text-gold" : "text-muted-foreground"
                          )}
                          aria-hidden="true"
                        />
                        <RadioGroupItem
                          value={value}
                          aria-label={m.label}
                          className="data-checked:border-gold data-checked:bg-gold data-checked:text-foreground"
                        />
                      </span>
                      <span className="text-sm leading-snug font-medium text-foreground">
                        {m.label}
                      </span>
                      <span className="text-xs text-muted-foreground">{m.note}</span>
                    </label>
                  )
                })}
              </RadioGroup>

              <div className="mt-7 space-y-4">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                  Card details
                </p>

                <div className="space-y-1.5">
                  <Label htmlFor="cardholder">Cardholder Name</Label>
                  <Input id="cardholder" placeholder="John Doe" autoComplete="cc-name" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                    autoComplete="cc-number"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" inputMode="numeric" autoComplete="cc-exp" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      type="password"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                    />
                  </div>
                </div>

                <p className="flex items-start gap-2 rounded-lg border border-border bg-background/70 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sage" aria-hidden="true" />
                  Your card details are encrypted end-to-end. SalonBook never
                  stores your full card number.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Booking summary */}
          <Card className="animate-rise h-fit border-border bg-card" style={{ animationDelay: "90ms" }}>
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg">Booking Summary</CardTitle>
              <CardDescription>Everything included in this payment.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <img
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1"
                alt="Studio"
                className="aspect-[16/9] w-full rounded-xl object-cover ring-1 ring-border"
              />

              <div className="mt-4">
                <h3 className="font-heading text-lg font-medium text-foreground">
                  Studio Name
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">Category · Location</p>
              </div>

              <dl className="mt-4 space-y-2 rounded-xl border border-border bg-background/70 px-4 py-3.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="inline-flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-3.5 text-gold" aria-hidden="true" />
                    Date
                  </dt>
                  <dd className="font-medium text-foreground tabular-nums">2026-12-01</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="inline-flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-3.5 text-gold" aria-hidden="true" />
                    Time
                  </dt>
                  <dd className="font-medium text-foreground tabular-nums">
                    10:00 – 11:00
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="inline-flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-3.5 text-gold" aria-hidden="true" />
                    Total hours
                  </dt>
                  <dd className="font-medium text-foreground tabular-nums">1</dd>
                </div>
              </dl>

              <div className="mt-5 space-y-2.5 border-t border-border pt-4 text-sm">
                {SUMMARY_ROWS.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground tabular-nums">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-baseline justify-between gap-3 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3.5">
                <span className="text-[11px] font-semibold tracking-[0.16em] text-gold uppercase">
                  Total Payable
                </span>
                <span className="font-heading text-2xl font-semibold text-foreground tabular-nums">
                  $45
                </span>
              </div>

              <Button size="lg" className="mt-5 w-full">
                <Lock className="mr-2 size-4" aria-hidden="true" />
                Pay Now
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Secure Checkout · Your payment information is protected.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
