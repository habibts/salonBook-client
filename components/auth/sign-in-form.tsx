"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { authClient, issueJWT } from "@/lib/auth-client"
import { useTokenStore } from "@/lib/token-store"
import { showSuccess, showError } from "@/lib/toast"

function SignInForm() {
  const router = useRouter()
  const { setTokenData } = useTokenStore()
  const [rememberMe, setRememberMe] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

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
        const message = signInError.message ?? "Invalid email or password."
        showError({ title: "Sign In Failed", description: message })
        return
      }

      const { data, error: jwtError } = await issueJWT()
      if (jwtError || !data) {
        showError({ title: "Authentication Error", description: jwtError ?? "Failed to obtain authentication token." })
        return
      }

      setTokenData(data)
      showSuccess({ title: "Welcome Back", description: "You have successfully signed in." })
      router.push("/")
    } catch {
      showError({ title: "Sign In Failed", description: "Something went wrong. Please try again." })
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Field>
        <FieldLabel htmlFor="email" className="text-foreground">
          Email Address
        </FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
      </Field>

      <Field>
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="password" className="text-foreground">
            Password
          </FieldLabel>
          <a
            href="#"
            className="text-sm font-medium text-charcoal underline-offset-2 transition-colors hover:text-gold hover:underline dark:text-gold dark:hover:text-champagne"
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
      </Field>

      <Field orientation="horizontal">
        <Checkbox
          id="remember"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked)}
        />
        <FieldLabel htmlFor="remember" className="text-foreground">
          Remember Me
        </FieldLabel>
      </Field>

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="h-11 w-full gap-2 rounded-full bg-gold text-base font-medium text-midnight hover:bg-gold-hover"
      >
        {pending ? (
          <>
            <Spinner />
            Signing In…
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}

export { SignInForm }
