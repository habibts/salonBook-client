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
    <div className="min-h-screen bg-[#F1EDE5] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-[#171717] p-6 text-[#F1EDE5]">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border-2 border-[#B8955A]">
                {user?.image ? <AvatarImage src={user.image} /> : null}
                <AvatarFallback>{getInitials(user?.name ?? "")}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-heading text-2xl font-semibold">{user?.name}</h1>
                <p className="text-sm text-[#E8D8B9]">{user?.email}</p>
                <div className="mt-1 flex gap-2">
                  <Badge className="bg-[#B8955A] text-[#171717]">Admin</Badge>
                  <Badge className="bg-[#657C67] text-white">Active</Badge>
                </div>
              </div>
            </div>
            <Button className="bg-[#B8955A] text-[#171717] hover:bg-[#AE8C56]">Edit Profile</Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
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
                <p className="text-[#34312D]">{user?.email ?? "—"}</p>
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
                <p className="text-[#34312D]">—</p>
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
              <p className="font-semibold text-[#171717]">Admin</p>
            </div>
            <div className="rounded-xl border border-[#DED6C8] bg-[#F1EDE5] p-4">
              <p className="text-xs text-[#77736D]">Account Status</p>
              <p className="font-semibold text-[#657C67]">Active</p>
            </div>
            <div className="rounded-xl border border-[#DED6C8] bg-[#F1EDE5] p-4">
              <p className="text-xs text-[#77736D]">Member Since</p>
              <p className="font-semibold text-[#34312D]">—</p>
            </div>
            <div className="rounded-xl border border-[#DED6C8] bg-[#F1EDE5] p-4">
              <p className="text-xs text-[#77736D]">Auth Provider</p>
              <p className="font-semibold text-[#34312D]">Email</p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
