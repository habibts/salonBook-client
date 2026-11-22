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
import { User, Mail, Calendar, IdCard, Phone } from "lucide-react"
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
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Show loading skeleton while restoring auth
  if (isRestoring) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <div className="rounded-2xl bg-midnight p-6 text-ivory">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-full border-2 border-gold" />
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

        <Card className="border-border bg-card">
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

        <Card className="border-border bg-card">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-muted p-4">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="mt-1 h-5 w-40" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
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
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-foreground">Please sign in to view your profile.</p>
            <Button onClick={() => router.push("/sign-in")} className="mt-4 bg-gold text-midnight hover:bg-gold-hover">
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
      await expressFetch("/user/profile", {
        method: "PUT",
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
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
      await expressFetch("/user/profile/image", {
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
      <div className="rounded-2xl bg-midnight p-6 text-ivory">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-gold">
              {avatarSrc ? <AvatarImage src={avatarSrc} /> : null}
              <AvatarFallback>{getInitials(user?.name ?? undefined)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-heading text-2xl font-semibold">{user?.name}</h1>
              <p className="text-sm text-champagne">{user?.email}</p>
              <div className="mt-1 flex gap-2">
                <Badge className="bg-gold text-midnight">Customer</Badge>
                <Badge className="bg-sage text-white">Active</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
            <Button onClick={() => fileRef.current?.click()} className="bg-gold text-midnight hover:bg-gold-hover">Change Photo</Button>
            <Button onClick={() => setOpen(true)} className="bg-gold text-midnight hover:bg-gold-hover">Edit Profile</Button>
          </div>
        </div>
      </div>

      {preview && (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <img src={preview} alt="preview" className="size-16 rounded-full object-cover" />
          <div className="flex gap-2">
            <Button onClick={saveImage} disabled={uploading} className="bg-gold text-midnight hover:bg-gold-hover">{uploading ? "Uploading..." : "Save Photo"}</Button>
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
            <div>
              <Label>Phone Number (Optional)</Label>
              <Input
                type="tel"
                placeholder="e.g., +1 555-123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving} className="bg-gold text-midnight hover:bg-gold-hover">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Personal Information</CardTitle>
          <p className="text-sm text-muted-foreground">Your personal account details</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3">
            <User className="size-5 text-gold" />
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="text-foreground">{user?.name ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="size-5 text-gold" />
            <div>
              <p className="text-xs text-muted-foreground">Email Address</p>
              <p className="break-all text-foreground">{user?.email ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="size-5 text-gold" />
            <div>
              <p className="text-xs text-muted-foreground">Phone Number</p>
              <p className="text-foreground">{user?.phone ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <IdCard className="size-5 text-gold" />
            <div>
              <p className="text-xs text-muted-foreground">User ID</p>
              <p className="break-all text-foreground">{user?.id ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="size-5 text-gold" />
            <div>
              <p className="text-xs text-muted-foreground">Account Created</p>
              <p className="text-foreground">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Account Overview</CardTitle>
          <p className="text-sm text-muted-foreground">A quick overview of your account</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-muted p-4">
            <p className="text-xs text-muted-foreground">Account Role</p>
            <p className="font-semibold text-foreground">Customer</p>
          </div>
          <div className="rounded-xl border border-border bg-muted p-4">
            <p className="text-xs text-muted-foreground">Account Status</p>
            <p className="font-semibold text-sage">Active</p>
          </div>
          <div className="rounded-xl border border-border bg-muted p-4">
            <p className="text-xs text-muted-foreground">Member Since</p>
            <p className="font-semibold text-foreground">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted p-4">
            <p className="text-xs text-muted-foreground">Auth Provider</p>
            <p className="font-semibold text-foreground">Email</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Account Security</CardTitle>
          <p className="text-sm text-muted-foreground">Manage your account security and authentication</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground">Authentication Provider: Email/Password</p>
          <p className="text-sm text-muted-foreground">Password change requires backend support not currently available.</p>
          <Button onClick={() => { clearTokenData(); router.push("/sign-in"); }} className="bg-gold text-midnight hover:bg-gold-hover">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
