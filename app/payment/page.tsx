"use client"

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Copy,
  CreditCard,
  Hash,
  Lock,
  Scissors,
  TriangleAlert,
  User,
  type LucideIcon,
} from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  type Appointment,
  appointmentTotal,
  formatDate,
  formatTime,
  money,
} from "@/lib/payment"
import { cn } from "@/lib/utils"
import { showError } from "@/lib/toast"
import { useExpressApi, ExpressApiError } from "@/lib/express-api"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
)

/* ── Small building blocks ──────────────────────────────────────────────── */

function DetailItem({
  icon: Icon,
  label,
  value,
  valueClassName,
  children,
  className,
}: {
  icon: LucideIcon
  label: string
  value: ReactNode
  valueClassName?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-gold ring-1 ring-border"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 text-sm font-medium break-words text-foreground",
            valueClassName
          )}
        >
          {value}
        </p>
      </div>
      {children}
    </div>
  )
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable — nothing to show */
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Copy booking reference"
      onClick={handleCopy}
      className="shrink-0 text-muted-foreground hover:text-gold"
    >
      {copied ? (
        <Check className="text-sage" aria-hidden="true" />
      ) : (
        <Copy aria-hidden="true" />
      )}
    </Button>
  )
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: ReactNode
  valueClassName?: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-medium text-foreground", valueClassName)}>
        {value}
      </p>
    </div>
  )
}

function SummaryCard({
  appointment,
  total,
  children,
}: {
  appointment: Appointment
  total: number
  children?: ReactNode
}) {
  const additionalCharges = appointment.additionalCharges ?? 0
  const discount = appointment.discount ?? 0

  return (
    <Card className="rounded-2xl">
      <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Payment Summary
          </h2>
          <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-gold uppercase">
            Amount due
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-background p-3">
          {appointment.serviceImage ? (
            <img
              src={appointment.serviceImage}
              alt={appointment.serviceName}
              className="size-11 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-lg text-gold"
            >
              <Scissors className="size-5" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {appointment.serviceName}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {formatDate(appointment.appointmentDate)} ·{" "}
              {formatTime(appointment.appointmentTime ?? appointment.timeSlot)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <SummaryRow label="Service price" value={money(appointment.price)} />
          {additionalCharges > 0 && (
            <SummaryRow
              label="Additional charges"
              value={money(additionalCharges)}
            />
          )}
          {discount > 0 && (
            <SummaryRow
              label="Discount"
              value={`− ${money(discount)}`}
              valueClassName="text-sage"
            />
          )}
        </div>

        <Separator />

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Total
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Due today</p>
          </div>
          <p className="font-heading text-3xl font-semibold text-foreground">
            {money(total)}
          </p>
        </div>

        {children}

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5 text-gold" aria-hidden="true" />
          Secure payment powered by Stripe
        </p>
      </CardContent>
    </Card>
  )
}

/* ── Step 2 — Stripe checkout ───────────────────────────────────────────── */

function CheckoutForm({
  appointment,
  total,
  onBack,
}: {
  appointment: Appointment
  total: number
  onBack: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [succeeded, setSucceeded] = useState(false)

  async function handlePay() {
    if (!stripe || !elements) return
    setProcessing(true)
    setMessage(null)
    setSucceeded(false)
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?appointmentId=${encodeURIComponent(appointment._id)}`,
      },
      redirect: "if_required",
    })
    if (result.error) {
      const errorMessage = result.error.message ?? "Payment failed"
      setMessage(errorMessage)
      setSucceeded(false)
      showError({ title: "Payment Failed", description: errorMessage })
    } else {
      const paymentIntentId = result.paymentIntent?.id ?? ""
      const query = new URLSearchParams({ appointmentId: appointment._id })
      if (paymentIntentId) query.set("transactionId", paymentIntentId)
      setMessage("Payment confirmed. Verifying with our servers…")
      setSucceeded(true)
      router.replace(`/payment/success?${query.toString()}`)
    }
    setProcessing(false)
  }

  return (
    <>
      <div className="animate-rise space-y-5 lg:col-span-7">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={processing}
          className="-ml-2.5 self-start text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft aria-hidden="true" />
          Back to summary
        </Button>

        <PageHeader
          eyebrow="Secure checkout"
          title="Complete Your Payment"
          description="Enter your payment details below. Your card information is encrypted and processed securely by Stripe."
        />

        <Card className="rounded-2xl">
          <CardContent className="p-5 sm:p-6">
            <form
              id="payment-form"
              onSubmit={(e) => {
                e.preventDefault()
                void handlePay()
              }}
            >
              <PaymentElement />
            </form>
            {message && (
              <p
                role={succeeded ? "status" : "alert"}
                className={cn(
                  "mt-4 rounded-xl border px-4 py-3 text-xs leading-relaxed",
                  succeeded
                    ? "border-sage/35 bg-sage/15 text-sage"
                    : "border-gold/40 bg-champagne/60 text-charcoal dark:text-ivory"
                )}
              >
                {message}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5">
        <div
          className="animate-rise lg:sticky lg:top-24"
          style={{ animationDelay: "80ms" }}
        >
          <SummaryCard appointment={appointment} total={total}>
            <Button
              type="button"
              onClick={handlePay}
              disabled={!stripe || processing}
              className="h-11 w-full gap-2 rounded-xl bg-midnight px-5 text-sm font-semibold text-white hover:bg-charcoal"
            >
              {processing ? (
                <>
                  <Spinner aria-hidden="true" />
                  Processing…
                </>
              ) : (
                <>
                  <CreditCard aria-hidden="true" />
                  Pay {money(total)}
                </>
              )}
            </Button>
          </SummaryCard>
        </div>
      </div>
    </>
  )
}

/* ── Loading / error states ─────────────────────────────────────────────── */

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-6 lg:col-span-7">
          <div className="space-y-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-9 w-72 max-w-full" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
        <div className="lg:col-span-5">
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string
  onRetry?: () => void
}) {
  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <Card className="mx-auto max-w-md rounded-2xl">
        <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="size-5" aria-hidden="true" />
          </span>
          <h1 className="font-heading text-xl font-semibold text-foreground">
            Unable to load your booking
          </h1>
          <p className="max-w-xs text-sm break-words text-muted-foreground">
            {error}
          </p>
          {onRetry && (
            <Button
              type="button"
              onClick={onRetry}
              className="mt-2 h-11 rounded-xl bg-midnight px-6 text-sm font-semibold text-white hover:bg-charcoal"
            >
              Try again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────── */

function PaymentPageContent() {
  const params = useSearchParams()
  const appointmentId = params.get("appointmentId") ?? ""
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"summary" | "checkout">("summary")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const { expressFetch } = useExpressApi()

  const loadAppointments = useCallback(async () => {
    if (!appointmentId) return Promise.resolve()
    setLoading(true)
    setError(null)
    try {
      const data = await expressFetch<Appointment[]>("/appointments")
      const found = data.find((a) => a._id === appointmentId) ?? null
      if (found) setAppointment(found)
      else setError("Appointment not found")
    } catch (e) {
      if (e instanceof ExpressApiError && e.status === 401) {
        setError("Your session has expired. Please sign in again.")
      } else if (e instanceof ExpressApiError && e.status === 403) {
        setError("Access denied.")
      } else {
        const message = e instanceof Error ? e.message : "Failed to load appointment"
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }, [expressFetch, appointmentId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAppointments()
  }, [loadAppointments])

  function handleRetry() {
    setLoading(true)
    setError(null)
    void loadAppointments()
  }

  async function handleCheckout() {
    if (!appointmentId) return
    if (clientSecret) {
      setStep("checkout")
      return
    }
    setCreating(true)
    setCheckoutError(null)
    try {
      interface CreatePaymentIntentResponse {
        clientSecret: string
        paymentIntentId: string
      }
      const data = await expressFetch<CreatePaymentIntentResponse>("/payments/create-payment-intent", {
        method: "POST",
        body: JSON.stringify({ appointmentId }),
      })
      setClientSecret(data.clientSecret)
      setStep("checkout")
    } catch (e) {
      if (e instanceof ExpressApiError && e.status === 401) {
        setCheckoutError("Your session has expired. Please sign in again.")
      } else if (e instanceof ExpressApiError && e.status === 403) {
        setCheckoutError("This appointment is not eligible for payment.")
      } else if (e instanceof ExpressApiError && e.status === 409) {
        setCheckoutError("This appointment has already been paid.")
      } else if (e instanceof ExpressApiError && e.status === 404) {
        setCheckoutError("Appointment not found.")
      } else {
        const message = e instanceof Error ? e.message : "Unable to start payment. Please try again."
        setCheckoutError(message)
        showError({ title: "Payment Session Failed", description: message })
      }
    } finally {
      setCreating(false)
    }
  }

  if (!appointmentId) return <ErrorState error="Missing appointment" />
  if (loading) return <PageSkeleton />
  if (error) return <ErrorState error={error} onRetry={handleRetry} />
  if (!appointment) return null

  const total = appointmentTotal(appointment)

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {step === "summary" ? (
            <>
              <div className="animate-rise space-y-6 lg:col-span-7">
                <PageHeader
                  eyebrow="Secure checkout"
                  title="Review Your Booking"
                  description="Everything looks good? Review your appointment details before proceeding to payment."
                />

                <Card className="rounded-2xl">
                  <CardContent className="flex flex-col gap-5 p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      {appointment.serviceImage ? (
                        <img
                          src={appointment.serviceImage}
                          alt={appointment.serviceName}
                          className="size-16 shrink-0 rounded-xl object-cover ring-1 ring-border"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-background text-gold ring-1 ring-border"
                        >
                          <Scissors className="size-6" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-gold uppercase">
                          Your service
                        </p>
                        <h2 className="mt-1 font-heading text-xl font-semibold text-foreground">
                          {appointment.serviceName}
                        </h2>
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <StatusBadge status={appointment.status} />
                          <StatusBadge status={appointment.paymentStatus} />
                          {appointment.duration != null && (
                            <span className="text-xs text-muted-foreground">
                              {appointment.duration} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                      <DetailItem
                        icon={User}
                        label="Customer name"
                        value={appointment.customerName ?? "—"}
                      />
                      <DetailItem
                        icon={CalendarDays}
                        label="Appointment date"
                        value={formatDate(appointment.appointmentDate)}
                      />
                      <DetailItem
                        icon={Clock}
                        label="Appointment time"
                        value={formatTime(
                          appointment.appointmentTime ?? appointment.timeSlot
                        )}
                      />
                      <DetailItem
                        icon={Hash}
                        label="Booking reference"
                        value={appointment._id}
                        valueClassName="font-mono text-xs break-all"
                        className="sm:col-span-2"
                      >
                        <CopyButton value={appointment._id} />
                      </DetailItem>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-5">
                <div
                  className="animate-rise lg:sticky lg:top-24"
                  style={{ animationDelay: "80ms" }}
                >
                  <SummaryCard appointment={appointment} total={total}>
                    {checkoutError && (
                      <p className="rounded-xl border border-gold/40 bg-champagne/60 px-4 py-3 text-xs leading-relaxed break-words text-charcoal dark:text-ivory">
                        {checkoutError}
                      </p>
                    )}
                    <Button
                      type="button"
                      onClick={handleCheckout}
                      disabled={creating}
                      className="h-11 w-full gap-2 rounded-xl bg-midnight px-5 text-sm font-semibold text-white hover:bg-charcoal"
                    >
                      {creating ? (
                        <>
                          <Spinner aria-hidden="true" />
                          Preparing…
                        </>
                      ) : (
                        <>
                          Proceed to Checkout
                          <ArrowRight aria-hidden="true" />
                        </>
                      )}
                    </Button>
                  </SummaryCard>
                </div>
              </div>
            </>
          ) : (
            clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  appointment={appointment}
                  total={total}
                  onBack={() => setStep("summary")}
                />
              </Elements>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PaymentPageContent />
    </Suspense>
  )
}
