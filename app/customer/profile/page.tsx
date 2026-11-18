"use client"

import { authClient } from "@/lib/auth-client"

export default function ProfilePage() {
  const { data: session } = authClient.useSession()
  const user = session?.user
  return (
    <div className="space-y-4 text-[#F7F5F0]">
      <h2 className="font-heading text-2xl">My Profile</h2>
      <p>Name: {user?.name}</p>
      <p>Email: {user?.email}</p>
    </div>
  )
}
