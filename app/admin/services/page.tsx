"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster, toast } from "@/components/ui/toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { CircleCheck, CirclePause, Layers, Plus } from "lucide-react"
import { useExpressApi, ExpressApiError } from "@/lib/express-api"
import { useTokenStore } from "@/lib/token-store"
import { ImageUploader } from "@/components/ui/image-uploader"

interface Service {
  _id: string
  serviceName: string
  category: string
  description: string
  price: number
  duration: number
  image: string
  status: string
  createdAt?: string
}

type ServiceFormData = {
  serviceName: string
  category: string
  description: string
  price: string
  duration: string
  image: string
  status: string
}

export default function ManageServicesPage() {
  const router = useRouter()
  const { expressFetch } = useExpressApi()
  const { isRestoring } = useTokenStore()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const [toggling, setToggling] = useState<string | null>(null)
  const [editing, setEditing] = useState<Service | null>(null)
  const [editForm, setEditForm] = useState<ServiceFormData>({
    serviceName: "",
    category: "",
    description: "",
    price: "",
    duration: "",
    image: "",
    status: "active",
  })
  const [saving, setSaving] = useState(false)

  const isLoading = isRestoring || loading

  async function fetchServices() {
    try {
      setLoading(true)
      setError(null)
      const data = await expressFetch<Service[]>("/services")
      setServices(Array.isArray(data) ? data : [])
    } catch (e) {
      if (e instanceof ExpressApiError && e.status === 401) {
        setError("Your session has expired. Please sign in again.")
      } else if (e instanceof ExpressApiError && e.status === 403) {
        setError("Access denied. Admin privileges required.")
      } else {
        setError(e instanceof Error ? e.message : "Error")
      }
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
    setToggling(s._id)
    const newStatus = s.status === "active" ? "inactive" : "active"
    try {
      interface ApiResponse { success: boolean }
      await expressFetch<ApiResponse>(`/services/${s._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      })
      toast.add({ type: "success", title: "Status updated" })
      fetchServices()
    } catch {
      toast.add({ type: "error", title: "Update failed" })
    }
    setToggling(null)
  }

  async function deleteService(id: string) {
    try {
      interface ApiResponse { success: boolean }
      await expressFetch<ApiResponse>(`/services/${id}`, { method: "DELETE" })
      toast.add({ type: "success", title: "Deleted" })
      fetchServices()
    } catch {
      toast.add({ type: "error", title: "Delete failed" })
    }
  }

  async function saveEdit() {
    if (!editing) return
    setSaving(true)
    try {
      const payload = {
        serviceName: editForm.serviceName,
        category: editForm.category,
        description: editForm.description,
        price: Number(editForm.price),
        duration: Number(editForm.duration),
        image: editForm.image,
        status: editForm.status,
      }
      interface ApiResponse { success: boolean }
      await expressFetch<ApiResponse>(`/services/${editing._id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
      toast.add({ type: "success", title: "Updated" })
      setEditing(null)
      fetchServices()
    } catch {
      toast.add({ type: "error", title: "Update failed" })
    }
    setSaving(false)
  }

  const stats = [
    { label: "Total Services", value: total, icon: Layers, tone: "gold" as const },
    { label: "Active Services", value: active, icon: CircleCheck, tone: "green" as const },
    { label: "Inactive Services", value: inactive, icon: CirclePause, tone: "neutral" as const },
  ]

  return (
    <>
    <div className="space-y-6">
      <Toaster />

      <PageHeader
        eyebrow="Catalogue"
        title="Manage Services"
        description="Manage, update and monitor all salon services."
        action={
          <Button onClick={() => router.push("/admin/services/new")}>
            <Plus className="size-4" aria-hidden="true" />
            Add New Service
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((c, i) => (
          <StatCard
            key={c.label}
            label={c.label}
            value={isLoading ? "…" : c.value}
            icon={c.icon}
            tone={c.tone}
            order={i}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:flex-1"
        />
        <Select value={category} onValueChange={(v) => setCategory(v ?? "all")}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v ?? "all")}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => { setSearch(""); setCategory("all"); setStatus("all") }}
        >
          Clear Filters
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={fetchServices} className="mt-4">Retry</Button>
        </div>
      ) : isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          No services found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card surface-raised">
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
                  <TableCell>
                    <img
                      src={s.image}
                      alt={s.serviceName}
                      className="h-12 w-12 rounded-lg object-cover ring-1 ring-border"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{s.serviceName}</TableCell>
                  <TableCell className="text-muted-foreground">{s.category}</TableCell>
                  <TableCell className="font-medium text-foreground tabular-nums">
                    ${s.price}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.duration} min</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={s.status === "active"}
                        disabled={toggling === s._id}
                        onCheckedChange={() => toggleStatus(s)}
                        aria-label={`Toggle ${s.serviceName} status`}
                        className={
                          s.status === "active"
                            ? "data-checked:bg-sage!"
                            : "data-checked:bg-muted-gray!"
                        }
                      />
                      <span
                        className={
                          s.status === "active"
                            ? "text-sm font-medium text-sage"
                            : "text-sm font-medium text-muted-foreground"
                        }
                      >
                        {s.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => { setEditing(s); setEditForm({ ...s, price: String(s.price), duration: String(s.duration) }) }}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button size="sm" variant="destructive">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete service?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteService(s._id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>

    <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Edit Service</DialogTitle>
        </DialogHeader>
        {editing && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Service name</Label>
              <Input id="edit-name" value={editForm.serviceName} onChange={(e) => setEditForm({ ...editForm, serviceName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-category">Category</Label>
              <Input id="edit-category" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-price">Price ($)</Label>
                <Input id="edit-price" type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-duration">Duration (min)</Label>
                <Input id="edit-duration" type="number" value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })} />
              </div>
            </div>
            <ImageUploader
              value={editForm.image}
              onChange={(url) => setEditForm({ ...editForm, image: url })}
            />
            <div className="space-y-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                className="min-h-24 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground hover:border-gold/50 focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={saveEdit} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}