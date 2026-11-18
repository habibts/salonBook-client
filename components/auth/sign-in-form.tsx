"use client"

import { buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function SignInForm() {
  return (
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
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
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-medium text-midnight"
          >
            Password
          </label>
          <a
            href="#"
            className="text-sm font-medium text-gold-hover underline-offset-2 transition-colors hover:text-midnight hover:underline"
          >
            Forgot Password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          required
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <div className="flex items-center gap-2.5">
        <Checkbox id="remember" />
        <label
          htmlFor="remember"
          className="text-sm font-medium text-midnight"
        >
          Remember Me
        </label>
      </div>

      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full bg-gold text-base font-medium text-midnight hover:bg-gold-hover"
        )}
      >
        Sign In
      </button>
    </form>
  )
}

export { SignInForm }
