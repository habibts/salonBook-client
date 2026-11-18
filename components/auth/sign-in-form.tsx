"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

function SignInForm() {
  const router = useRouter()
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setError(null)

    const form = new FormData(event.currentTarget)
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")

    setPending(true)
    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      })

      if (signInError) {
        setError(signInError.message ?? "Invalid email or password.")
        return
      }

      router.push("/")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-midnight">
          Email Address
        </label>
        <Input
          id="email"
          name="email"
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
          name="password"
          type="password"
          required
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      <div className="flex items-center gap-2.5">
        <Checkbox
          id="remember"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked)}
        />
        <label htmlFor="remember" className="text-sm font-medium text-midnight">
          Remember Me
        </label>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          buttonVariants({ size: "lg" }),
          "h-11 w-full rounded-full bg-gold text-base font-medium text-midnight hover:bg-gold-hover"
        )}
      >
        {pending ? "Signing In…" : "Sign In"}
      </button>
    </form>
  )
}

export { SignInForm }
