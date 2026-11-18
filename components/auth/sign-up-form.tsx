"use client"

import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function SignUpForm() {
  return (
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
      <div className="space-y-2">
        <label
          htmlFor="full-name"
          className="text-sm font-medium text-midnight"
        >
          Full Name
        </label>
        <Input
          id="full-name"
          type="text"
          required
          placeholder="John Doe"
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-midnight">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-midnight"
        >
          Password
        </label>
        <Input
          id="password"
          type="password"
          required
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="profile-image"
          className="text-sm font-medium text-midnight"
        >
          Profile Image
        </label>
        <Input
          id="profile-image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="text-muted-gray file:mr-3 file:h-7 file:rounded-md file:border-0 file:bg-champagne file:px-3 file:text-sm file:font-medium file:text-midnight hover:file:bg-gold/80"
        />
      </div>

      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full bg-gold text-base font-medium text-midnight hover:bg-gold-hover"
        )}
      >
        Create Account
      </button>
    </form>
  )
}

export { SignUpForm }
