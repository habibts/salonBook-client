"use client"

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  CalendarDays,
  CalendarX,
  Clock,
  Home,
  RefreshCw,
  Sparkles,
  TriangleAlert,
} from "lucide-react"

import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { useExpressApi, ExpressApiError } from "@/lib/express-api"
import {
  type Appointment,
  appointmentTotal,
  formatDate,
  formatTime,
  isPaid,
  money,
} from "@/lib/payment"
import { cn } from "@/lib/utils"
import { showSuccess, showError, showWarning, showInfo } from "@/lib/toast"

/** How long we keep re-checking while the Stripe webhook catches up. */
const MAX_VERIFY_ATTEMPTS = 10
const VERIFY_RETRY_DELAY = 2_500

/**
 * The page never trusts the browser's own Stripe response — it only reaches
 * `paid` once the backend (updated by the webhook) reports `paymentStatus`.
 */
type Phase =
  "verifying" | "paid" | "processing" | "error" | "missing" | "declined"

/** Response of `POST /payments/verify` — the backend settles with Stripe. */
type VerifyPaymentResponse = {
  paid: boolean
  appointment: Appointment
}

/** Thrown when the appointment the link points at no longer exists. */
class AppointmentNotFoundError extends Error {
  constructor() {
    super("Appointment not found")
    this.name = "AppointmentNotFoundError"
  }
}

const primaryButtonClassName =
  "h-11 w-full gap-2 rounded-xl bg-midnight px-6 text-sm font-semibold text-white hover:bg-charcoal sm:w-auto"

const secondaryButtonClassName =
  "h-11 w-full gap-2 rounded-xl px-6 text-sm font-semibold sm:w-auto"

/* ── Shared pieces ─────────────────────────────────────────────────────── */

/** Centered single column that every state of this page renders into. */
function StateShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100svh-6rem)] items-center justify-center px-4 py-12 sm:px-6 lg:py-16">
      <div className="w-full max-w-xl">{children}</div>
    </div>
  )
}

/** Icon + heading + description block used by every non-success state. */
function StateCard({
  icon,
  iconClassName,
  title,
  description,
  children,
}: {
  icon: ReactNode
  iconClassName: string
  title: string
  description: string
  children?: ReactNode
}) {
  return (
    <StateShell>
      <div className="flex flex-col items-center text-center">
        <span
          aria-hidden="true"
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full",
            iconClassName
          )}
        >
          {icon}
        </span>
        <h1 className="mt-6 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {children}
      </div>
    </StateShell>
  )
}

/** Stacked on mobile, side-by-side from the `sm` breakpoint up. */
function ActionButtons({ children }: { children: ReactNode }) {
  return (
    <div className="mt-7 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
      {children}
    </div>
  )
}

/** Row inside the payment confirmation card. */
function DetailRow({
  label,
  mono,
  strong,
  children,
}: {
  label: string
  mono?: boolean
  strong?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <dt className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "min-w-0 text-sm break-words text-foreground sm:text-right",
          mono && "font-mono text-xs break-all",
          strong && "font-heading text-base font-semibold"
        )}
      >
        {children}
      </dd>
    </div>
  )
}

/** One-shot sage medallion with a drawn-on tick. */
function SuccessMedallion() {
  return (
    <div className="relative flex size-28 animate-check-pop items-center justify-center">
      <span
        aria-hidden="true"
        className="absolute inset-0 animate-halo rounded-full bg-sage/30"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-sage/15 ring-1 ring-sage/35"
      />
      <span
        aria-hidden="true"
        className="absolute -inset-2 rounded-full border border-gold/30"
      />
      <span className="surface-floating relative flex size-18 items-center justify-center rounded-full bg-sage text-white">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-9"
          aria-hidden="true"
        >
          <path
            d="M4.5 12.75l5 5 10-10"
            pathLength={100}
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-check-draw"
          />
        </svg>
      </span>
    </div>
  )
}

/* ── Confirmed state ───────────────────────────────────────────────────── */

function SuccessView({
  appointment,
  transactionId,
  onAppointments,
  onHome,
}: {
  appointment: Appointment
  transactionId: string
  onAppointments: () => void
  onHome: () => void
}) {
  const total = appointmentTotal(appointment)

  return (
    <StateShell>
      <div className="flex flex-col items-center text-center">
        <SuccessMedallion />

        <p className="mt-7 flex animate-rise items-center justify-center gap-3 text-[11px] font-semibold tracking-[0.24em] text-gold uppercase">
          <span aria-hidden="true" className="h-px w-7 bg-gold/70" />
          Payment confirmed
          <span aria-hidden="true" className="h-px w-7 bg-gold/70" />
        </p>

        <h1 className="mt-3 animate-rise font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Payment Successful!
        </h1>

        <p className="mt-3 max-w-md animate-rise text-sm leading-relaxed text-muted-foreground sm:text-base">
          Your payment has been received successfully. Your appointment is now
          paid.
        </p>
      </div>

      {/* Payment confirmation card */}
      <Card
        className="mt-8 animate-rise rounded-2xl"
        style={{ animationDelay: "140ms" }}
      >
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Payment Confirmation
            </h2>
            <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-gold uppercase">
              Receipt
            </span>
          </div>

          <Separator className="mt-4" />

          <dl className="divide-y divide-border">
            <DetailRow label="Payment Status">
              <span className="sm:flex sm:justify-end">
                <StatusBadge status="Paid" />
              </span>
            </DetailRow>
            <DetailRow label="Appointment ID" mono>
              {appointment._id}
            </DetailRow>
            <DetailRow label="Service Name">
              {appointment.serviceName}
            </DetailRow>
            <DetailRow label="Appointment Date">
              {formatDate(appointment.appointmentDate)}
            </DetailRow>
            <DetailRow label="Appointment Time">
              {formatTime(appointment.appointmentTime ?? appointment.timeSlot)}
            </DetailRow>
            <DetailRow label="Total Amount" strong>
              {money(total)}
            </DetailRow>
            <DetailRow label="Transaction ID" mono>
              {transactionId || "—"}
            </DetailRow>
          </dl>
        </CardContent>
      </Card>

      <div className="animate-rise" style={{ animationDelay: "220ms" }}>
        <ActionButtons>
          <Button
            type="button"
            onClick={onAppointments}
            className={primaryButtonClassName}
          >
            <CalendarDays aria-hidden="true" />
            View My Appointments
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onHome}
            className={secondaryButtonClassName}
          >
            <Home aria-hidden="true" />
            Back to Home
          </Button>
        </ActionButtons>
      </div>

      <p
        className="mt-8 flex animate-rise items-start justify-center gap-2 text-center text-sm text-muted-foreground"
        style={{ animationDelay: "300ms" }}
      >
        <Sparkles
          aria-hidden="true"
          className="mt-0.5 size-3.5 shrink-0 text-gold"
        />
        <span>
          Thank you for choosing{" "}
          <span className="font-medium text-gold">SalonBook</span>. We look
          forward to seeing you!
        </span>
      </p>
    </StateShell>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────── */

function PaymentSuccessContent() {
  const params = useSearchParams()
  const router = useRouter()
  const { expressFetch } = useExpressApi()

  const appointmentId = params.get("appointmentId") ?? ""
  /** Stripe appends `payment_intent`; the checkout page sends `transactionId`. */
  const transactionId =
    params.get("transactionId") ?? params.get("payment_intent") ?? ""
  const redirectStatus = (params.get("redirect_status") ?? "").toLowerCase()
  const declined = [
    "failed",
    "canceled",
    "cancelled",
    "requires_payment_method",
  ].includes(redirectStatus)

  const [phase, setPhase] = useState<Phase>(() => {
    if (!appointmentId) return "missing"
    if (declined) return "declined"
    return "verifying"
  })
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [toastsShown, setToastsShown] = useState<Partial<Record<Phase, boolean>>>({})

  const runIdRef = useRef(0)
  const timerRef = useRef<number | null>(null)

  /**
   * Re-checks the backend until it reports `paymentStatus: Paid`.
   *
   * Every pass first asks the backend to settle the payment with Stripe
   * directly, so the page also works when the webhook has not reached the
   * server (local development, webhook downtime). That endpoint is
   * idempotent — retrying can never duplicate a charge or a transaction.
   */
  const verify = useCallback(() => {
    // A declined redirect never reaches the backend check — there is nothing
    // to poll for, so the dedicated "not completed" state stays on screen.
    if (!appointmentId || declined) return

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }

    const runId = runIdRef.current + 1
    runIdRef.current = runId
    const isCurrent = () => runIdRef.current === runId

    let tries = 0
    let lastFailure: string | null = null

    /** Reads the record, settling it with Stripe first when possible. */
    const readAppointment = async (): Promise<{
      appointment: Appointment
      paid: boolean
    }> => {
      try {
        const verification = await expressFetch<VerifyPaymentResponse>(
          "/payments/verify",
          {
            method: "POST",
            body: JSON.stringify({
              appointmentId,
              paymentIntentId: transactionId || undefined,
            }),
          }
        )
        if (verification?.appointment) {
          return {
            appointment: verification.appointment,
            paid: verification.paid || isPaid(verification.appointment),
          }
        }
      } catch (e) {
        // Only an expired session is fatal. Anything else — an older backend
        // without this endpoint, a network hiccup — falls back to the plain
        // read below, which the webhook can still update.
        if (e instanceof ExpressApiError && e.status === 401) throw e
      }

      const appointments = await expressFetch<Appointment[]>("/appointments")
      const found = appointments.find((item) => item._id === appointmentId)
      if (!found) throw new AppointmentNotFoundError()
      return { appointment: found, paid: isPaid(found) }
    }

    const run = async () => {
      if (!isCurrent()) return

      tries += 1
      if (tries === 1) {
        // Fresh pass — clear anything a previous pass left behind.
        setPhase("verifying")
        setError(null)
      }
      setAttempt(tries)

      try {
        const result = await readAppointment()
        if (!isCurrent()) return

        lastFailure = null
        setAppointment(result.appointment)

        if (result.paid) {
          setPhase("paid")
          return
        }
      } catch (e) {
        if (!isCurrent()) return
        if (e instanceof ExpressApiError && e.status === 401) {
          // The token refresh already failed once — polling cannot fix a
          // missing session, so stop and tell the customer to sign in again.
          setError(
            "Your session has expired. Please sign in again to confirm this payment."
          )
          setPhase("error")
          return
        }
        if (e instanceof AppointmentNotFoundError) {
          // The record is not there at all — polling will not bring it back.
          setError(
            "We couldn't find this appointment. The link may be out of date — open it again from your appointments list."
          )
          setPhase("error")
          return
        }
        lastFailure =
          e instanceof Error && e.message
            ? e.message
            : "We couldn't reach the booking service."
      }

      if (tries >= MAX_VERIFY_ATTEMPTS) {
        // Either the webhook is running late or the API keeps failing.
        setError(lastFailure)
        setPhase(lastFailure ? "error" : "processing")
        return
      }

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        void run()
      }, VERIFY_RETRY_DELAY)
    }

    void run()
  }, [appointmentId, declined, expressFetch, transactionId])

  // Show toasts when phase changes to terminal states
  useEffect(() => {
    if (phase === "paid" && !toastsShown.paid) {
      showSuccess({ title: "Payment Successful", description: "Your payment has been confirmed." })
      setTimeout(() => setToastsShown((prev) => ({ ...prev, paid: true })), 0)
    }
  }, [phase, toastsShown.paid])

  useEffect(() => {
    if (phase === "declined" && !toastsShown.declined) {
      showInfo({ title: "Checkout Cancelled", description: "No payment was completed during this checkout." })
      setTimeout(() => setToastsShown((prev) => ({ ...prev, declined: true })), 0)
    }
  }, [phase, toastsShown.declined])

  useEffect(() => {
    if (phase === "error" && !toastsShown.error) {
      showError({ title: "We Couldn't Verify Your Payment", description: error ?? "Something went wrong while confirming your payment. Please try again." })
      setTimeout(() => setToastsShown((prev) => ({ ...prev, error: true })), 0)
    }
  }, [phase, toastsShown.error, error])

  useEffect(() => {
    if (phase === "missing" && !toastsShown.missing) {
      showWarning({ title: "Missing Appointment Reference", description: "We couldn't tell which appointment this payment belongs to." })
      setTimeout(() => setToastsShown((prev) => ({ ...prev, missing: true })), 0)
    }
  }, [phase, toastsShown.missing])

  useEffect(() => {
    verify()

    return () => {
      runIdRef.current += 1
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [verify])

  const goHome = () => router.push("/")
  const goAppointments = () => router.push("/customer/appointments")
  const goBackToPayment = () =>
    router.push(`/payment?appointmentId=${encodeURIComponent(appointmentId)}`)

  if (phase === "missing") {
    return (
      <StateCard
        icon={<CalendarX className="size-6" />}
        iconClassName="size-16 border border-gold/30 bg-gold/10 text-gold"
        title="Missing appointment reference"
        description="We couldn't tell which appointment this payment belongs to. Open this page from your appointment's payment link, or check your appointments for the latest status."
      >
        <ActionButtons>
          <Button
            type="button"
            onClick={goAppointments}
            className={primaryButtonClassName}
          >
            <CalendarDays aria-hidden="true" />
            View My Appointments
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={goHome}
            className={secondaryButtonClassName}
          >
            <Home aria-hidden="true" />
            Back to Home
          </Button>
        </ActionButtons>
      </StateCard>
    )
  }

  if (phase === "declined") {
    return (
      <StateCard
        icon={<TriangleAlert className="size-6" />}
        iconClassName="size-16 border border-gold/40 bg-champagne/60 text-charcoal dark:text-ivory"
        title="Payment not completed"
        description="Your payment wasn't completed, so your card has not been charged. You can review your booking and try again whenever you're ready."
      >
        <ActionButtons>
          <Button
            type="button"
            onClick={goBackToPayment}
            className={primaryButtonClassName}
          >
            Try payment again
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={goHome}
            className={secondaryButtonClassName}
          >
            <Home aria-hidden="true" />
            Back to Home
          </Button>
        </ActionButtons>
      </StateCard>
    )
  }

  if (phase === "error") {
    return (
      <StateCard
        icon={<TriangleAlert className="size-6" />}
        iconClassName="size-16 border border-gold/40 bg-champagne/60 text-charcoal dark:text-ivory"
        title="We couldn't verify your payment"
        description={
          error ??
          "Something went wrong while confirming your payment. Please try again."
        }
      >
        <ActionButtons>
          <Button
            type="button"
            onClick={verify}
            className={primaryButtonClassName}
          >
            <RefreshCw aria-hidden="true" />
            Try again
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={goHome}
            className={secondaryButtonClassName}
          >
            <Home aria-hidden="true" />
            Back to Home
          </Button>
        </ActionButtons>
      </StateCard>
    )
  }

  if (phase === "processing") {
    return (
      <StateCard
        icon={<Clock className="size-6" />}
        iconClassName="size-16 border border-gold/35 bg-champagne/50 text-charcoal dark:text-ivory"
        title="We're still confirming your payment"
        description="Your confirmation is taking a little longer than usual. There's nothing else you need to do — check again in a moment and your appointment will show as paid as soon as it's through."
      >
        <ActionButtons>
          <Button
            type="button"
            onClick={verify}
            className={primaryButtonClassName}
          >
            <RefreshCw aria-hidden="true" />
            Check again
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={goHome}
            className={secondaryButtonClassName}
          >
            <Home aria-hidden="true" />
            Back to Home
          </Button>
        </ActionButtons>
      </StateCard>
    )
  }

  if (phase === "paid" && appointment) {
    return (
      <SuccessView
        appointment={appointment}
        transactionId={transactionId}
        onAppointments={goAppointments}
        onHome={goHome}
      />
    )
  }

  // Webhook still catching up — keep the customer calmly informed.
  return (
    <StateCard
      icon={<Spinner className="size-7 text-gold" />}
      iconClassName="size-20 border border-gold/30 bg-card text-gold surface-raised"
      title="Verifying Your Payment..."
      description="We're confirming your payment with our secure payment provider before completing your appointment. This usually takes just a few seconds."
    >
      <div className="mt-7 w-full max-w-64">
        <div
          role="progressbar"
          aria-label="Payment verification progress"
          aria-valuemin={0}
          aria-valuemax={MAX_VERIFY_ATTEMPTS}
          aria-valuenow={attempt}
          className="h-1.5 w-full overflow-hidden rounded-full bg-champagne/60"
        >
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-700 ease-out"
            style={{
              width: `${Math.round(
                (Math.max(attempt, 1) / MAX_VERIFY_ATTEMPTS) * 100
              )}%`,
            }}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Please keep this page open — it updates automatically as soon as your
          payment is confirmed.
        </p>
      </div>
    </StateCard>
  )
}

function PaymentSuccessSkeleton() {
  return (
    <div className="flex min-h-[calc(100svh-6rem)] items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="size-28 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-72 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="mt-8 h-96 w-full rounded-2xl" />
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessSkeleton />}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
