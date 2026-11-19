"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Toaster, toast } from "@/components/ui/toast"
import { PageHeader } from "@/components/dashboard/page-header"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
const categories = ["Haircut & Styling","Hair Coloring","Hair Treatment","Facial & Skincare","Makeup","Manicure & Pedicure","Spa & Massage"]

export default function AddServicePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    serviceName: "",
    category: categories[0],
    description: "",
    price: "",
    duration: "",
    image: "",
    status: "active",
  })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed")
      toast.add({ type: "success", title: "Service created" })
      router.push("/admin/services")
    } catch {
      toast.add({ type: "error", title: "Create failed" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Toaster />

      <PageHeader
        eyebrow="Catalogue"
        title="Add New Service"
        description="Create a new salon service and make it available for customers to book."
      />

      <form
        onSubmit={handleSubmit}
        className="animate-rise max-w-3xl rounded-xl border border-border bg-card p-6 surface-raised sm:p-8"
      >
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="service-name">Service name</Label>
            <Input
              id="service-name"
              placeholder="e.g. Signature Haircut"
              value={form.serviceName}
              onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-category">Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v ?? categories[0] })}
            >
              <SelectTrigger id="service-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-description">Description</Label>
            <Textarea
              id="service-description"
              placeholder="Describe the service, what is included and who it is for."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="service-price">Price ($)</Label>
              <Input
                id="service-price"
                type="number"
                placeholder="45"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="service-duration">Duration (min)</Label>
              <Input
                id="service-duration"
                type="number"
                placeholder="60"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-image">Image URL</Label>
            <Input
              id="service-image"
              placeholder="https://..."
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-background/70 px-4 py-3">
            <Switch
              checked={form.status === "active"}
              onCheckedChange={(v) => setForm({ ...form, status: v ? "active" : "inactive" })}
              aria-label="Service active"
              className={form.status === "active" ? "data-checked:bg-sage!" : "data-checked:bg-muted-gray!"}
            />
            <span className="cursor-pointer text-sm leading-none font-medium">
              {form.status === "active" ? "Active — visible to customers" : "Inactive — hidden from customers"}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border pt-5">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Service"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
