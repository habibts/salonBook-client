"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatAppointmentDate,
  formatAppointmentTime,
  formatPrice,
  formatRequestedAt,
  getAppointmentStats,
  paymentLabels,
  statusLabels,
  type Appointment,
} from "@/lib/appointments"

const mockAppointments: Appointment[] = [
  {
    _id: "1",
    customerId: "c1",
    serviceName: "Haircut",
    serviceCategory: "Hair",
    serviceImage: "",
    servicePrice: 25,
    appointmentDate: "2026-11-20",
    appointmentTime: "10:30",
    status: "pending",
    paymentStatus: "unpaid",
    createdAt: "2026-11-18T10:00:00.000Z",
  },
  {
    _id: "2",
    customerId: "c1",
    serviceName: "Manicure",
    serviceCategory: "Nails",
    servicePrice: 15,
    appointmentDate: "2026-11-22",
    appointmentTime: "14:00",
    status: "confirmed",
    paymentStatus: "unpaid",
    createdAt: "2026-11-17T09:00:00.000Z",
  },
  {
    _id: "3",
    customerId: "c1",
    serviceName: "Facial",
    serviceCategory: "Skin",
    servicePrice: 40,
    appointmentDate: "2026-11-15",
    appointmentTime: "11:00",
    status: "cancelled",
    paymentStatus: "unpaid",
    createdAt: "2026-11-14T08:00:00.000Z",
  },
]

export default function CustomerDashboardPage() {
  const stats = getAppointmentStats(mockAppointments)

  const cards = [
    { title: "Total Appointment Requests", value: stats.total },
    { title: "Pending Appointments", value: stats.pending },
    { title: "Confirmed Appointments", value: stats.confirmed },
    { title: "Cancelled Appointments", value: stats.cancelled },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Requested</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAppointments.map((a) => (
                <TableRow key={a._id}>
                  <TableCell>{a.serviceName}</TableCell>
                  <TableCell>{a.serviceCategory}</TableCell>
                  <TableCell>{formatAppointmentDate(a.appointmentDate)}</TableCell>
                  <TableCell>{formatAppointmentTime(a.appointmentTime)}</TableCell>
                  <TableCell>{formatPrice(a.servicePrice)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{statusLabels[a.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{paymentLabels[a.paymentStatus]}</Badge>
                  </TableCell>
                  <TableCell>{formatRequestedAt(a.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
