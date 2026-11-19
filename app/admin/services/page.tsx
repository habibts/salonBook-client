"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster, toast } from "@/components/ui/toast"
import { Card } from "@/components/ui/card"

interface Service {
  _id: string
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
  status: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

export default function ManageServicesPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const [toDelete, setToDelete] = useState<string | null>(null)

  async function fetchServices() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/services`)
      if (!res.ok) throw new Error("Failed")
      const data = (await res.json()) as Service[]
      setServices(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const categories = useMemo(() => Array.from(new Set(services.map((s) => s.category))), [services])

  const filtered = useMemo(() => {
    let list = services
    if (search) list = list.filter((s) => s.serviceName.toLowerCase().includes(search.toLowerCase()))
    if (category !== "all") list = list.filter((s) => s.category === category)
    if (status !== "all") list = list.filter((s) => s.status === status)
    return list
  }, [services, search, category, status])

  const total = services.length
  const active = services.filter((s) => s.status === "active").length
  const inactive = services.filter((s) => s.status !== "active").length

  async function toggleStatus(s: Service) {
    const newStatus = s.status === "active" ? "inactive" : "active"
    const res = await fetch(`${API_BASE}/services/${s._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      toast.add({ type: "success", title: "Status updated" })
      fetchServices()
    } else {
      toast.add({ type: "error", title: "Update failed" })
    }
  }

  async function deleteService(id: string) {
    const res = await fetch(`${API_BASE}/services/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.add({ type: "success", title: "Deleted" })
      fetchServices()
    } else {
      toast.add({ type: "error", title: "Delete failed" })
    }
    setToDelete(null)
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Toaster />
      <Toaster />
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold text-[#151515]">Manage Services</h1>
          <p className="text-[#77736D]">Manage, update and monitor all salon services.</p>
        </div>
        <Button onClick={() => router.push("/admin/services/new")} className="bg-[#C5A46D] text-[#151515] hover:bg-[#AE8C56]">
          + Add New Service
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="border-[#E9E3D8] bg-white p-4"><p className="text-sm text-[#77736D]">Total Services</p><p className="text-2xl font-semibold text-[#151515]">{total}</p></Card>
        <Card className="border-[#E9E3D8] bg-white p-4"><p className="text-sm text-[#77736D]">Active Services</p><p className="text-2xl font-semibold text-[#151515]">{active}</p></Card>
        <Card className="border-[#E9E3D8] bg-white p-4"><p className="text-sm text-[#77736D]">Inactive Services</p><p className="text-2xl font-semibold text-[#151515]">{inactive}</p></Card>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="border-[#E9E3D8] bg-white" />
        <Select value={category} onValueChange={(v) => setCategory(v ?? "all")}>
          <SelectTrigger className="w-full md:w-48 border-[#E9E3D8] bg-white"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent className="border-[#E9E3D8] bg-white">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
          <SelectTrigger className="w-full md:w-48 border-[#E9E3D8] bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="border-[#E9E3D8] bg-white">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => { setSearch(""); setCategory("all"); setStatus("all") }} className="border-[#E9E3D8]">
          Clear Filters
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : error ? (
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchServices} className="mt-4">Retry</Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-[#77736D]">No services found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#E9E3D8] bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s._id}>
                  <TableCell><img src={s.image} alt={s.serviceName} className="h-12 w-12 rounded object-cover" /></TableCell>
                  <TableCell>{s.serviceName}</TableCell>
                  <TableCell>{s.category}</TableCell>
                  <TableCell>${s.price}</TableCell>
                  <TableCell>{s.duration} min</TableCell>
                  <TableCell>
                    <Badge className={s.status === "active" ? "bg-[#C5A46D]/10 text-[#C5A46D]" : "bg-gray-200 text-gray-600"}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleStatus(s)} className="border-[#E9E3D8]">
                      Toggle
                    </Button>
                    <AlertDialog>
                    <AlertDialogTrigger>
                      <Button size="sm" className="bg-red-500 text-white hover:bg-red-600">Delete</Button>
                    </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete service?</AlertDialogTitle>
                          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteService(s._id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
