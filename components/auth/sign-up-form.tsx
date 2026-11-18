"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

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
        <label
          htmlFor="full-name"
          className="text-sm font-medium text-midnight"
        >
          Full Name
        </label>
        <Input
          id="full-name"
          name="name"
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
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-midnight">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
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
          name="profile-image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="text-muted-gray file:mr-3 file:h-7 file:rounded-md file:border-0 file:bg-champagne file:px-3 file:text-sm file:font-medium file:text-midnight hover:file:bg-gold/80"
        />
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
        {pending ? "Creating Account…" : "Create Account"}
      </button>
    </form>
  )
}

export { SignUpForm }
