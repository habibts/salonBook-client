"use client"

import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminProfilePage() {
  const { data: session } = authClient.useSession()
  const user = session?.user

  function getInitials(name: string) {
    return name.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-[#171717]">My Admin Profile</h1>
        <p className="text-[#77736D]">Manage your personal information and account settings.</p>
      </div>

      <Card className="border-[#DED6C8] bg-[#F1EDE5]">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="size-16">
            {user?.image ? <AvatarImage src={user.image} /> : null}
            <AvatarFallback>{getInitials(user?.name ?? "")}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-[#171717]">{user?.name}</CardTitle>
            <p className="text-[#77736D]">{user?.email}</p>
            <div className="mt-2 flex gap-2">
              <Badge className="bg-[#E8D8B9] text-[#171717]">Admin</Badge>
              <Badge className="bg-[#E6F3E9] text-[#287A45]">Active</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-[#DED6C8] bg-white">
        <CardHeader>
          <CardTitle className="text-[#171717]">Admin Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-[#34312D]">
          <p><strong>Role:</strong> Admin</p>
          <p><strong>Status:</strong> Active</p>
          <p><strong>User ID:</strong> {user?.id}</p>
          <p className="text-[#77736D]">Profile update and password change require backend support not currently available.</p>
        </CardContent>
      </Card>
    </div>
  )
}
