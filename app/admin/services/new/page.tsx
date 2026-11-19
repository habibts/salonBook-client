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
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Toaster />
      <h1 className="font-heading text-3xl font-semibold text-[#151515]">Add New Service</h1>
      <p className="mt-2 text-[#77736D]">Create a new salon service and make it available for customers to book.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-[#E9E3D8] bg-white p-6">
        <div>
          <Label>Service Name</Label>
          <Input value={form.serviceName} onChange={(e) => setForm({ ...form, serviceName: e.target.value })} required />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v ?? categories[0] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Price</Label>
            <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </div>
          <div>
            <Label>Duration (min)</Label>
            <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} required />
          </div>
        </div>
        <div>
          <Label>Image URL</Label>
          <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.status === "active"} onCheckedChange={(v) => setForm({ ...form, status: v ? "active" : "inactive" })} />
          <Label>Active</Label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={submitting} className="bg-[#C5A46D] text-[#151515] hover:bg-[#AE8C56]">
            {submitting ? "Creating..." : "Create Service"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
