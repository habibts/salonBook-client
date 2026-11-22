"use client"

import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Calendar, IdCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminProfilePage() {
  const { data: session } = authClient.useSession()
  const user = session?.user

  function getInitials(name: string) {
    return name.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?"
  }

  return (
    <div className="min-h-screen bg-muted px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-midnight p-6 text-ivory">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border-2 border-gold">
                {user?.image ? <AvatarImage src={user.image} /> : null}
                <AvatarFallback>{getInitials(user?.name ?? "")}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-heading text-2xl font-semibold">{user?.name}</h1>
                <p className="text-sm text-champagne">{user?.email}</p>
                <div className="mt-1 flex gap-2">
                  <Badge className="bg-gold text-midnight">Admin</Badge>
                  <Badge className="bg-sage text-white">Active</Badge>
                </div>
              </div>
            </div>
            <Button className="bg-gold text-midnight hover:bg-gold-hover">Edit Profile</Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
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
                <p className="text-foreground">{user?.email ?? "—"}</p>
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
                <p className="text-foreground">—</p>
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
              <p className="font-semibold text-foreground">Admin</p>
            </div>
            <div className="rounded-xl border border-border bg-muted p-4">
              <p className="text-xs text-muted-foreground">Account Status</p>
              <p className="font-semibold text-sage">Active</p>
            </div>
            <div className="rounded-xl border border-border bg-muted p-4">
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="font-semibold text-foreground">—</p>
            </div>
            <div className="rounded-xl border border-border bg-muted p-4">
              <p className="text-xs text-muted-foreground">Auth Provider</p>
              <p className="font-semibold text-foreground">Email</p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
