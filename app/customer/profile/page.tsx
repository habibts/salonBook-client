"use client"

import { Mail, UserRound } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/dashboard/page-header"

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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="My Profile"
        description="Your personal details as registered with SalonBook."
      />

      <Card className="animate-rise max-w-2xl">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-lg">Profile details</CardTitle>
          <CardDescription>
            {isPending ? "Loading your account…" : "Information tied to your SalonBook account."}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-5">
          {isPending ? (
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Avatar className="size-16 ring-2 ring-gold/50 ring-offset-2 ring-offset-background">
                {user?.image ? <AvatarImage src={user.image} alt={user.name ?? "Profile"} /> : null}
                <AvatarFallback className="bg-charcoal text-lg font-semibold text-gold">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-2xl font-semibold text-foreground">
                  {user?.name ?? "—"}
                </p>
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="size-4 text-gold" aria-hidden="true" />
                  <span className="truncate">{user?.email ?? "—"}</span>
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">
                <UserRound className="size-3.5" aria-hidden="true" />
                Member
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
