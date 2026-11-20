"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { CircleAlert } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { authClient, issueJWT } from "@/lib/auth-client"
import { useTokenStore } from "@/lib/token-store"

const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2 MB

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () =>
      reject(reader.error ?? new Error("Could not read the selected file"))
    reader.readAsDataURL(file)
  })
}

function SignUpForm() {
  const router = useRouter()
  const { setTokenData } = useTokenStore()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setError(null)

    const form = new FormData(event.currentTarget)
    const name = String(form.get("name") ?? "").trim()
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")
    const imageFile = form.get("profile-image")

    if (imageFile instanceof File && imageFile.size > MAX_IMAGE_SIZE) {
      setError("Profile image must be 2 MB or smaller.")
      return
    }

    setPending(true)
    try {
      let image: string | undefined
      if (imageFile instanceof File && imageFile.size > 0) {
        image = await fileToDataUrl(imageFile)
      }

      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
        ...(image ? { image } : {}),
      })

      if (signUpError) {
        setError(
          signUpError.message ??
            "Could not create your account. Please try again."
        )
        return
      }

      const { data, error: jwtError } = await issueJWT()
      if (jwtError || !data) {
        setError(jwtError ?? "Failed to obtain authentication token.")
        return
      }

      setTokenData(data)
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

      <Field>
        <FieldLabel htmlFor="profile-image" className="text-midnight">
          Profile Image
        </FieldLabel>
        <Input
          id="profile-image"
          name="profile-image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="text-muted-gray file:mr-3 file:h-7 file:rounded-md file:border-0 file:bg-champagne file:px-3 file:text-sm file:font-medium file:text-midnight hover:file:bg-gold/80"
        />
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
