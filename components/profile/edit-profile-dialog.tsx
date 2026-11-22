"use client"

import { useState, type FormEvent } from "react"

import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Current display name, used to pre-fill the form. */
  name: string
  /** Current profile image URL, if the account has one. */
  image?: string | null
  /** Called after Better Auth has persisted the change, to refresh the page. */
  onSaved?: () => void
}

const MIN_NAME_LENGTH = 2
const MAX_NAME_LENGTH = 80
const IMAGE_URL_PATTERN = /^https?:\/\/\S+$/i

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
  return initials || "?"
}

/**
 * Edit Profile dialog for the signed-in admin.
 *
 * Only `name` and `image` are ever sent — Better Auth owns the account record
 * (`POST /api/auth/update-user`), so the role, the account status and the
 * e-mail address are structurally impossible to change from here.
 */
function EditProfileDialog({
  open,
  onOpenChange,
  name,
  image,
  onSaved,
}: EditProfileDialogProps) {
  const [nameValue, setNameValue] = useState(name)
  const [imageValue, setImageValue] = useState(image ?? "")
  const [nameError, setNameError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  // Re-seed the form on every closed → open transition so it always shows the
  // latest saved account data instead of a stale snapshot (React's documented
  // "adjust state when a prop changes" pattern — no effect needed).
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setNameValue(name)
      setImageValue(image ?? "")
      setNameError(null)
      setImageError(null)
      setSaving(false)
    }
  }

  function validate(): boolean {
    let valid = true
    const trimmedName = nameValue.trim()
    const trimmedImage = imageValue.trim()

    if (trimmedName.length < MIN_NAME_LENGTH) {
      setNameError("Please enter your full name.")
      valid = false
    } else if (trimmedName.length > MAX_NAME_LENGTH) {
      setNameError(`Full name must be ${MAX_NAME_LENGTH} characters or fewer.`)
      valid = false
    } else {
      setNameError(null)
    }

    if (trimmedImage && !IMAGE_URL_PATTERN.test(trimmedImage)) {
      setImageError(
        "Enter a complete image link starting with http:// or https://."
      )
      valid = false
    } else {
      setImageError(null)
    }

    return valid
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    if (!validate()) return

    setSaving(true)

    try {
      const { error } = await authClient.updateUser({
        name: nameValue.trim(),
        image: imageValue.trim(),
      })

      if (error) {
        toast.add({
          type: "error",
          title: "Could not save your profile",
          description: error.message ?? "Please try again.",
        })
        setSaving(false)
        return
      }

      toast.add({
        type: "success",
        title: "Profile updated",
        description: "Your changes are saved to your SalonBook account.",
      })
      onSaved?.()
      onOpenChange(false)
    } catch {
      toast.add({
        type: "error",
        title: "Could not save your profile",
        description: "Something went wrong. Please try again.",
      })
      setSaving(false)
    }
  }

  const previewSrc = imageValue.trim()

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => !saving && onOpenChange(nextOpen)}
    >
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update the details shown across your admin dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-background/70 p-3.5">
            <Avatar className="size-16 shrink-0 ring-2 ring-gold/50 ring-offset-2 ring-offset-background">
              {previewSrc ? (
                <AvatarImage src={previewSrc} alt="Profile preview" />
              ) : null}
              <AvatarFallback className="bg-charcoal text-base font-semibold text-gold">
                {getInitials(nameValue)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Live preview
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Broken or empty links fall back to your initials.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-profile-name">
              Full name{" "}
              <span className="text-gold" aria-hidden="true">
                *
              </span>
            </Label>
            <Input
              id="admin-profile-name"
              value={nameValue}
              onChange={(event) => setNameValue(event.target.value)}
              placeholder="e.g. Ayesha Rahman"
              autoComplete="name"
              maxLength={MAX_NAME_LENGTH}
              disabled={saving}
              aria-invalid={nameError ? true : undefined}
              aria-describedby={
                nameError ? "admin-profile-name-error" : undefined
              }
            />
            {nameError && (
              <p
                id="admin-profile-name-error"
                className="text-xs text-destructive"
              >
                {nameError}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-profile-image">Profile image URL</Label>
            <Input
              id="admin-profile-image"
              value={imageValue}
              onChange={(event) => setImageValue(event.target.value)}
              placeholder="https://example.com/your-photo.jpg"
              inputMode="url"
              autoComplete="url"
              disabled={saving}
              aria-invalid={imageError ? true : undefined}
              aria-describedby={
                imageError ? "admin-profile-image-error" : undefined
              }
            />
            {imageError ? (
              <p
                id="admin-profile-image-error"
                className="text-xs text-destructive"
              >
                {imageError}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Paste a direct image link, or clear the field to use your
                initials.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-champagne bg-champagne/30 px-3.5 py-3 text-xs leading-relaxed text-charcoal dark:text-ivory">
            Your role, account status and e-mail address are managed by
            SalonBook authentication and cannot be edited here.
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="gap-1.5 bg-charcoal text-ivory hover:bg-gold hover:text-midnight"
            >
              {saving ? (
                <>
                  <Spinner className="size-4" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { EditProfileDialog }
