"use client"

import { useRef, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster, toast } from "@/components/ui/toast"
import { User, Mail, Calendar, IdCard, UserRound } from "lucide-react"

function getInitials(name?: string) {
  const initials = (name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
  return initials || "?"
}

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(user?.name ?? "")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function save() {
    if (!name.trim()) {
      toast.add({ type: "error", title: "Name required" })
      return
    }
    setSaving(true)
    try {
      await authClient.updateUser({ name: name.trim() })
      toast.add({ type: "success", title: "Profile updated" })
      setOpen(false)
    } catch {
      toast.add({ type: "error", title: "Update failed" })
    } finally {
      setSaving(false)
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) {
      toast.add({ type: "error", title: "Invalid image type" })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.add({ type: "error", title: "Image too large (max 5MB)" })
      return
    }
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function saveImage() {
    if (!preview) return
    setUploading(true)
    try {
      await authClient.updateUser({ image: preview })
      toast.add({ type: "success", title: "Profile image updated" })
      setPreview(null)
    } catch {
      toast.add({ type: "error", title: "Upload failed" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <Toaster />
      <div className="rounded-2xl bg-[#171717] p-6 text-[#F1EDE5]">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-[#B8955A]">
              {user?.image ? <AvatarImage src={user.image} /> : null}
              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-heading text-2xl font-semibold">{isPending ? "Loading..." : user?.name}</h1>
              <p className="text-sm text-[#E8D8B9]">{user?.email}</p>
              <div className="mt-1 flex gap-2">
                <Badge className="bg-[#B8955A] text-[#171717]">Customer</Badge>
                <Badge className="bg-[#657C67] text-white">Active</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
            <Button onClick={() => fileRef.current?.click()} className="bg-[#B8955A] text-[#171717] hover:bg-[#AE8C56]">Change Photo</Button>
            <Button onClick={() => setOpen(true)} className="bg-[#B8955A] text-[#171717] hover:bg-[#AE8C56]">Edit Profile</Button>
          </div>
        </div>
      </div>

      {preview && (
        <div className="flex items-center gap-4 rounded-xl border border-[#DED6C8] bg-white p-4">
          <img src={preview} alt="preview" className="size-16 rounded-full object-cover" />
          <div className="flex gap-2">
            <Button onClick={saveImage} disabled={uploading} className="bg-[#B8955A] text-[#171717] hover:bg-[#AE8C56]">{uploading ? "Uploading..." : "Save Photo"}</Button>
            <Button variant="outline" onClick={() => setPreview(null)}>Cancel</Button>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving} className="bg-[#B8955A] text-[#171717] hover:bg-[#AE8C56]">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="border-[#DED6C8] bg-white">
        <CardHeader>
          <CardTitle className="text-[#171717]">Personal Information</CardTitle>
          <p className="text-sm text-[#77736D]">Your personal account details</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <User className="size-5 text-[#B8955A]" />
            <div>
              <p className="text-xs text-[#77736D]">Full Name</p>
              <p className="text-[#34312D]">{user?.name ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="size-5 text-[#B8955A]" />
            <div>
              <p className="text-xs text-[#77736D]">Email Address</p>
              <p className="break-all text-[#34312D]">{user?.email ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <IdCard className="size-5 text-[#B8955A]" />
            <div>
              <p className="text-xs text-[#77736D]">User ID</p>
              <p className="break-all text-[#34312D]">{user?.id ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="size-5 text-[#B8955A]" />
            <div>
              <p className="text-xs text-[#77736D]">Account Created</p>
              <p className="text-[#34312D]">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#DED6C8] bg-white">
        <CardHeader>
          <CardTitle className="text-[#171717]">Account Overview</CardTitle>
          <p className="text-sm text-[#77736D]">A quick overview of your account</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#DED6C8] bg-[#F1EDE5] p-4">
            <p className="text-xs text-[#77736D]">Account Role</p>
            <p className="font-semibold text-[#171717]">Customer</p>
          </div>
          <div className="rounded-xl border border-[#DED6C8] bg-[#F1EDE5] p-4">
            <p className="text-xs text-[#77736D]">Account Status</p>
            <p className="font-semibold text-[#657C67]">Active</p>
          </div>
          <div className="rounded-xl border border-[#DED6C8] bg-[#F1EDE5] p-4">
            <p className="text-xs text-[#77736D]">Member Since</p>
            <p className="font-semibold text-[#34312D]">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p>
          </div>
          <div className="rounded-xl border border-[#DED6C8] bg-[#F1EDE5] p-4">
            <p className="text-xs text-[#77736D]">Auth Provider</p>
            <p className="font-semibold text-[#34312D]">Email</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#DED6C8] bg-white">
        <CardHeader>
          <CardTitle className="text-[#171717]">Account Security</CardTitle>
          <p className="text-sm text-[#77736D]">Manage your account security and authentication</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#34312D]">Authentication Provider: Email/Password</p>
          <p className="text-sm text-[#77736D]">Password change requires backend support not currently available.</p>
          <Button onClick={() => authClient.signOut()} className="bg-[#B8955A] text-[#171717] hover:bg-[#AE8C56]">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
