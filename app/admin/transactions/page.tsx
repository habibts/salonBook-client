"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search } from "lucide-react"
import { Receipt, CheckCircle, Clock, DollarSign } from "lucide-react"
import { useExpressApi, ExpressApiError } from "@/lib/express-api"
import { ProtectedPageLoading } from "@/components/dashboard/protected-page-loading"
import { useTokenStore } from "@/lib/token-store"

interface Transaction {
  _id: string
  customerId?: string
  paymentIntentId?: string
  appointmentId?: string
  amount?: number
  status?: string
  createdAt?: string
}

interface TransactionDetails {
  transaction: Transaction
  appointment?: {
    appointmentDate?: string
    timeSlot?: string
  }
  service?: {
    name?: string
  }
}

export default function AdminTransactionsPage() {
  const { expressFetch } = useExpressApi()
  const { isRestoring } = useTokenStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sort, setSort] = useState("newest")
  const [dateFilter, setDateFilter] = useState("all")
  const [selected, setSelected] = useState<string | null>(null)
  const [details, setDetails] = useState<TransactionDetails | null>(null)

  const isLoading = isRestoring || loading

  async function loadTransactions() {
    try {
      setLoading(true)
      setError("")
      const data = await expressFetch<Transaction[]>("/transactions")
      setTransactions(Array.isArray(data) ? data : [])
    } catch (err) {
      if (err instanceof ExpressApiError && err.status === 401) {
        setError("Your session has expired. Please sign in again.")
      } else if (err instanceof ExpressApiError && err.status === 403) {
        setError("Access denied. Admin privileges required.")
      } else {
        setError("Failed to load transactions")
      }
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    if (!selected) return
    expressFetch<TransactionDetails>(`/transactions/${selected}/details`)
      .then(setDetails)
      .catch(() => setDetails(null))
  }, [selected])

  let filtered = transactions.filter((t) => {
    const q = query.toLowerCase()
    const match = (t.customerId || "").toLowerCase().includes(q) ||
      (t.paymentIntentId || "").toLowerCase().includes(q) ||
      (t.appointmentId || "").toLowerCase().includes(q)
    const statusMatch = statusFilter === "all" || t.status === statusFilter
    let dateMatch = true
    const createdAt = t.createdAt ? new Date(t.createdAt) : new Date()
    const now = new Date()
    if (dateFilter === "today") dateMatch = createdAt.toDateString() === now.toDateString()
    if (dateFilter === "7d") dateMatch = (now.getTime() - createdAt.getTime()) <= 7 * 24 * 60 * 60 * 1000
    if (dateFilter === "30d") dateMatch = (now.getTime() - createdAt.getTime()) <= 30 * 24 * 60 * 60 * 1000
    return match && statusMatch && dateMatch
  })
  if (sort === "newest") filtered = [...filtered].sort((a, b) => new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime())
  if (sort === "oldest") filtered = [...filtered].sort((a, b) => new Date(a.createdAt ?? "").getTime() - new Date(b.createdAt ?? "").getTime())
  if (sort === "highest") filtered = [...filtered].sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
  if (sort === "lowest") filtered = [...filtered].sort((a, b) => (a.amount ?? 0) - (b.amount ?? 0))

  const total = transactions.length
  const success = transactions.filter((t) => t.status === "Paid").length
  const pending = transactions.filter((t) => t.status === "Pending").length
  const revenue = transactions.filter((t) => t.status === "Paid").reduce((s, t) => s + (t.amount || 0), 0) / 100

  function handleClose(open: boolean) { if (!open) { setSelected(null); setDetails(null) } }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-[#171717]">Transactions</h1>
        <p className="text-sm text-[#77736D]">Monitor and manage payment transactions across the platform.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#DED6C8] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[#77736D]">Total Transactions</CardTitle>
              <Receipt className="size-5 text-[#B8955A]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-[#171717]">{total}</p>
            <p className="text-xs text-[#77736D]">All recorded transactions</p>
          </CardContent>
        </Card>
        <Card className="border-[#DED6C8] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[#77736D]">Successful Payments</CardTitle>
              <CheckCircle className="size-5 text-[#657C67]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-[#171717]">{success}</p>
            <p className="text-xs text-[#77736D]">Successfully completed payments</p>
          </CardContent>
        </Card>
        <Card className="border-[#DED6C8] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[#77736D]">Pending Payments</CardTitle>
              <Clock className="size-5 text-[#B8955A]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-[#171717]">{pending}</p>
            <p className="text-xs text-[#77736D]">Awaiting payment completion</p>
          </CardContent>
        </Card>
        <Card className="border-[#DED6C8] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[#77736D]">Total Revenue</CardTitle>
              <DollarSign className="size-5 text-[#B8955A]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-[#171717]">${revenue.toFixed(2)}</p>
            <p className="text-xs text-[#77736D]">From successful payments</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#77736D]" />
          <Input placeholder="Search transactions..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9 max-w-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 rounded-md border border-[#DED6C8] bg-white px-3 text-sm">
          <option value="all">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="h-9 rounded-md border border-[#DED6C8] bg-white px-3 text-sm">
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 rounded-md border border-[#DED6C8] bg-white px-3 text-sm">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>
        <Button variant="outline" onClick={() => { setQuery(""); setStatusFilter("all"); setDateFilter("all"); setSort("newest") }}>Reset</Button>
      </div>

      {error ? <p className="text-red-600">{error}</p> : isLoading ? (
        <ProtectedPageLoading />
      ) : (filtered.length === 0 ? (
        <div className="rounded-xl border border-[#DED6C8] bg-white p-12 text-center">
          <Receipt className="mx-auto size-10 text-[#B8955A]" />
          <h3 className="mt-4 font-heading text-lg text-[#171717]">No transactions yet</h3>
          <p className="mt-2 text-sm text-[#77736D]">Payment transactions will appear here once customers complete their payments.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#DED6C8] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[#F1EDE5]">
              <tr>
                <th className="p-3 text-left">Transaction ID</th>
                <th className="p-3 text-left">Appointment</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t._id} className="border-t border-[#DED6C8]">
                  <td className="p-3 break-all">{t.paymentIntentId || t._id}</td>
                  <td className="p-3">{t.appointmentId}</td>
                  <td className="p-3">${((t.amount || 0) / 100).toFixed(2)}</td>
                  <td className="p-3"><Badge className={t.status === "Paid" ? "bg-[#657C67] text-white" : "bg-[#B8955A] text-[#171717]"}>{t.status}</Badge></td>
                  <td className="p-3">{new Date(t.createdAt ?? "").toLocaleString()}</td>
                  <td className="p-3"><Button size="sm" variant="outline" onClick={() => setSelected(t._id)}>View Details</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <Dialog open={!!selected} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {!details ? <p>Loading...</p> : (
            <div className="space-y-4 text-sm">
              <p><strong>Transaction ID:</strong> {details.transaction._id}</p>
              <p><strong>Payment Status:</strong> {details.transaction.status}</p>
              <p><strong>Amount:</strong> ${((details.transaction.amount || 0) / 100).toFixed(2)}</p>
              <p><strong>Date:</strong> {new Date(details.transaction.createdAt ?? "").toLocaleString()}</p>
              <p><strong>Stripe Payment Intent:</strong> {details.transaction.paymentIntentId || "—"}</p>
              <p><strong>Appointment ID:</strong> {details.transaction.appointmentId}</p>
              <p><strong>Customer ID:</strong> {details.transaction.customerId}</p>
              <p><strong>Service:</strong> {details.service?.name || "—"}</p>
              <p><strong>Appointment Date:</strong> {details.appointment?.appointmentDate || "—"}</p>
              <p><strong>Appointment Time:</strong> {details.appointment?.timeSlot || "—"}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}