"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ProfilePhotoPicker } from "@/components/auth/profile-photo-picker"
import { Spinner } from "@/components/ui/spinner"
import { authClient, issueJWT } from "@/lib/auth-client"
import { useTokenStore } from "@/lib/token-store"
import { showSuccess, showError } from "@/lib/toast"

function SignUpForm() {
  const router = useRouter()
  const { setTokenData } = useTokenStore()
  const [pending, setPending] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    const form = new FormData(event.currentTarget)
    const name = String(form.get("name") ?? "").trim()
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")

    setPending(true)
    try {
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
        ...(photo ? { image: photo } : {}),
      })

      if (signUpError) {
        const message = signUpError.message ?? "Could not create your account. Please try again."
        showError({ title: "Sign Up Failed", description: message })
        return
      }

      const { data, error: jwtError } = await issueJWT()
      if (jwtError || !data) {
        showError({ title: "Authentication Error", description: jwtError ?? "Failed to obtain authentication token." })
        return
      }

      setTokenData(data)
      showSuccess({ title: "Account Created Successfully", description: "Your account has been created successfully." })
      router.push("/")
    } catch {
      showError({ title: "Sign Up Failed", description: "Something went wrong. Please try again." })
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="flex justify-center pb-1">
        <ProfilePhotoPicker onChange={setPhoto} disabled={pending} />
      </div>

      <Field>
        <FieldLabel htmlFor="full-name" className="text-midnight">
          Full Name
        </FieldLabel>
        <Input
          id="full-name"
          name="name"
          type="text"
          required
          placeholder="John Doe"
          autoComplete="name"
        />
      </Field>

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
        <FieldLabel htmlFor="password" className="text-midnight">
          Password
        </FieldLabel>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
          autoComplete="new-password"
        />
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
            Creating Account…
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  )
}

export { SignUpForm }
