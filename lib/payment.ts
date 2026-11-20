/**
 * Shared helpers for the Stripe payment flow.
 *
 * The checkout screen (`/payment`) and the confirmation screen
 * (`/payment/success`) render the same appointment record, so the shape, the
 * formatters and the total calculation live here once and are imported by
 * both pages.
 */

/** Appointment exactly as the backend returns it to the payment screens. */
export interface Appointment {
  _id: string
  serviceName: string
  serviceImage?: string
  customerName?: string
  appointmentDate: string
  appointmentTime?: string
  /** Some records store the slot under `timeSlot` instead. */
  timeSlot?: string
  price: number
  /** Optional breakdown — rendered only when the backend provides it. */
  additionalCharges?: number
  discount?: number
  duration?: number
  status: string
  paymentStatus: string
}

/* ── Formatters ─────────────────────────────────────────────────────────── */

/** USD formatter shared by every payment screen. */
export function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

/** "2026-11-25" → "Tue, November 25, 2026" (timezone-safe for date-only values). */
export function formatDate(value?: string) {
  if (!value) return "—"
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  const date = dateOnly
    ? new Date(
        Number(dateOnly[1]),
        Number(dateOnly[2]) - 1,
        Number(dateOnly[3])
      )
    : new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

/** "09:00" → "9:00 AM" */
export function formatTime(value?: string) {
  if (!value) return "—"
  const time = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim())
  if (!time) return value
  const hour = Number(time[1])
  const suffix = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${time[2]} ${suffix}`
}

/* ── Appointment payment helpers ────────────────────────────────────────── */

/**
 * Amount charged for an appointment — the same figure the checkout hands to
 * Stripe, so the confirmation card always agrees with the payment summary.
 */
export function appointmentTotal(appointment: Appointment): number {
  return (
    appointment.price +
    (appointment.additionalCharges ?? 0) -
    (appointment.discount ?? 0)
  )
}

/**
 * `true` only once the backend has flipped the record to Paid (the Stripe
 * webhook does this) — never on the strength of the browser's own response.
 */
export function isPaid(appointment: Appointment): boolean {
  return appointment.paymentStatus?.trim().toLowerCase() === "paid"
}
