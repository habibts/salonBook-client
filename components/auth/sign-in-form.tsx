"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { CircleAlert } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"

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
      <Field>
        <FieldLabel htmlFor="email" className="text-midnight">
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
          <FieldLabel htmlFor="password" className="text-midnight">
            Password
          </FieldLabel>
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
      </Field>

      <Field orientation="horizontal">
        <Checkbox
          id="remember"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked)}
        />
        <FieldLabel htmlFor="remember" className="text-midnight">
          Remember Me
        </FieldLabel>
      </Field>

      {error && (
        <Alert
          variant="destructive"
          className="border-destructive/30 bg-destructive/10"
        >
          <CircleAlert />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
