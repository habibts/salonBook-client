import { format, isValid, parseISO } from "date-fns"

/** Status of an appointment request, owned by the backend. */
export type AppointmentStatus = "pending" | "confirmed" | "cancelled"

/** Payment state of an appointment, set only by the backend/Stripe flow. */
export type PaymentStatus = "unpaid" | "paid"

export interface Appointment {
  _id: string
  customerId: string
  customerName?: string
  customerEmail?: string
  serviceName: string
  serviceCategory: string
  serviceImage?: string
  servicePrice: number
  /** Booking day, stored as "yyyy-MM-dd". */
  appointmentDate: string
  /** Booking time, stored as "HH:mm" (24h). */
  appointmentTime: string
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  /** When the customer submitted the request. */
  createdAt: string
  updatedAt?: string
}

export interface AppointmentStats {
  total: number
  pending: number
  confirmed: number
  cancelled: number
}

export interface AppointmentListResponse {
  appointments: Appointment[]
}

export interface AppointmentResponse {
  appointment: Appointment
}

/** Derives dashboard statistics from the records returned by the API. */
export function getAppointmentStats(appointments: Appointment[]): AppointmentStats {
  const stats: AppointmentStats = {
    total: appointments.length,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  }

  for (const appointment of appointments) {
    if (appointment.status === "pending") stats.pending += 1
    else if (appointment.status === "confirmed") stats.confirmed += 1
    else if (appointment.status === "cancelled") stats.cancelled += 1
  }

  return stats
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function formatPrice(price: number): string {
  if (!Number.isFinite(price)) return "—"
  return priceFormatter.format(price)
}

export function formatAppointmentDate(value: string): string {
  const parsed = parseISO(value)
  if (!isValid(parsed)) return value || "—"
  return format(parsed, "dd MMM yyyy")
}

export function formatAppointmentTime(value: string): string {
  const parsed = parseISO(`2000-01-01T${value.length === 5 ? value : value.slice(0, 5)}`)
  if (!isValid(parsed)) return value || "—"
  return format(parsed, "hh:mm a")
}

/** Formats the moment the customer submitted the request. */
export function formatRequestedAt(value: string): string {
  const parsed = parseISO(value)
  if (!isValid(parsed)) return value || "—"
  return format(parsed, "dd MMM yyyy, hh:mm a")
}

export const statusLabels: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
}

export const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
}
