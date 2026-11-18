import type { Appointment } from "@/lib/appointments"

/**
 * Shape of an appointment document in the `appointments` collection.
 *
 * `customerId` is stamped from the Better Auth session when the document is
 * created and is what every read/cancel request is checked against.
 */
export interface AppointmentDoc {
  _id: unknown
  customerId: string
  customerName?: string
  customerEmail?: string
  serviceName: string
  serviceCategory: string
  serviceImage?: string
  servicePrice: number
  appointmentDate: string
  appointmentTime: string
  status: "pending" | "confirmed" | "cancelled"
  paymentStatus: "unpaid" | "paid"
  createdAt: Date
  updatedAt: Date
}

/** Converts a Mongo document into the JSON shape the dashboard consumes. */
export function serializeAppointment(doc: AppointmentDoc): Appointment {
  return {
    _id: String(doc._id),
    customerId: doc.customerId,
    customerName: doc.customerName,
    customerEmail: doc.customerEmail,
    serviceName: doc.serviceName,
    serviceCategory: doc.serviceCategory,
    serviceImage: doc.serviceImage,
    servicePrice: doc.servicePrice,
    appointmentDate: doc.appointmentDate,
    appointmentTime: doc.appointmentTime,
    status: doc.status,
    paymentStatus: doc.paymentStatus,
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
  }
}
