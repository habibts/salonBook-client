"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useTokenStore } from "@/lib/token-store"
import { useExpressApi } from "@/lib/express-api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Mail, Calendar, IdCard } from "lucide-react"
import { showSuccess, showError } from "@/lib/toast"

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
  const router = useRouter()
  const { tokenData, isRestoring, isAuthenticated, clearTokenData } = useTokenStore()
  const { expressFetch } = useExpressApi()
  const user = tokenData?.user
  const userImage = user?.image ?? undefined
  const avatarSrc = userImage as string | undefined
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(user?.name ?? "")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Show loading skeleton while restoring auth
  if (isRestoring) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <div className="rounded-2xl bg-[#171717] p-6 text-[#F1EDE5]">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-full border-2 border-[#B8955A]" />
              <div>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="mt-1 h-4 w-64" />
                <Skeleton className="mt-2 h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>

        <Card className="border-[#DED6C8] bg-white">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-5" />
                <div>
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="mt-1 h-4 w-48" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#DED6C8] bg-white">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-[#DED6C8] bg-[#F1EDE5] p-4">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="mt-1 h-5 w-40" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[#DED6C8] bg-white">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-80" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Not authenticated - redirect to sign-in
  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <Card className="border-[#DED6C8] bg-white">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-[#34312D]">Please sign in to view your profile.</p>
            <Button onClick={() => router.push("/sign-in")} className="mt-4 bg-[#B8955A] text-[#171717] hover:bg-[#AE8C56]">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  async function save() {
    if (!name.trim()) {
      showError({ title: "Name Required", description: "Please enter your name." })
      return
    }
    setSaving(true)
    try {
      // Use expressFetch to call protected Express API endpoint
      await expressFetch("/api/user/profile", {
        method: "PUT",
        body: JSON.stringify({ name: name.trim() }),
      })
      showSuccess({ title: "Profile Updated", description: "Your profile has been updated successfully." })
      setOpen(false)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to update profile. Please try again."
      showError({ title: "Profile Update Failed", description: message })
    } finally {
      setSaving(false)
    }
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!["image/jpeg","image/png","image/webp"].includes(file.type)) {
      showError({ title: "Invalid Image Type", description: "Only JPG, PNG, and WEBP images are allowed." })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showError({ title: "Image Too Large", description: "Maximum size is 5 MB." })
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
      await expressFetch("/api/user/profile/image", {
        method: "PUT",
        body: JSON.stringify({ image: preview }),
      })
      showSuccess({ title: "Profile Image Updated", description: "Your profile photo has been updated." })
      setPreview(null)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to upload image. Please try again."
      showError({ title: "Image Upload Failed", description: message })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="rounded-2xl bg-[#171717] p-6 text-[#F1EDE5]">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-[#B8955A]">
              {avatarSrc ? <AvatarImage src={avatarSrc} /> : null}
              <AvatarFallback>{getInitials(user?.name ?? undefined)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-heading text-2xl font-semibold">{user?.name}</h1>
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
          <Button onClick={() => { clearTokenData(); router.push("/sign-in"); }} className="bg-[#B8955A] text-[#171717] hover:bg-[#AE8C56]">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}