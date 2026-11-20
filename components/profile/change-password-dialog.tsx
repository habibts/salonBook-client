"use client"

import { useState, type FormEvent } from "react"

import { authClient } from "@/lib/auth-client"
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

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after the password was changed, so the page can refresh. */
  onChanged?: () => void
}

const MIN_PASSWORD_LENGTH = 8

/**
 * Password dialog backed by Better Auth's built-in
 * `POST /api/auth/change-password` endpoint (it verifies the current password
 * server-side). It is only offered to accounts that actually sign in with
 * e-mail + password.
 */
function ChangePasswordDialog({
  open,
  onOpenChange,
  onChanged,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<{
    current?: string
    next?: string
    confirm?: string
  }>({})
  const [saving, setSaving] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  // Clear the form on every closed → open transition (React's documented
  // "adjust state when a prop changes" pattern — no effect needed).
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setErrors({})
      setSaving(false)
    }
  }

  function validate(): boolean {
    const next: typeof errors = {}

    if (!currentPassword) {
      next.current = "Enter your current password."
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      next.next = `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`
    } else if (newPassword === currentPassword) {
      next.next = "Choose a password different from your current one."
    }
    if (confirmPassword !== newPassword) {
      next.confirm = "Passwords do not match."
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    if (!validate()) return

    setSaving(true)

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
      })

      if (error) {
        const message = error.message ?? "Please try again."
        toast.add({
          type: "error",
          title: "Could not change password",
          description: /current|invalid password/i.test(message)
            ? "Your current password is incorrect."
            : message,
        })
        setSaving(false)
        return
      }

      toast.add({
        type: "success",
        title: "Password updated",
        description: "Use your new password the next time you sign in.",
      })
      onChanged?.()
      onOpenChange(false)
    } catch {
      toast.add({
        type: "error",
        title: "Could not change password",
        description: "Something went wrong. Please try again.",
      })
      setSaving(false)
    }
  }

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
              Change Password
            </DialogTitle>
            <DialogDescription>
              Your current password is verified before anything is saved.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-current-password">Current password</Label>
            <Input
              id="admin-current-password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              disabled={saving}
              aria-invalid={errors.current ? true : undefined}
              aria-describedby={
                errors.current ? "admin-current-password-error" : undefined
              }
            />
            {errors.current && (
              <p
                id="admin-current-password-error"
                className="text-xs text-destructive"
              >
                {errors.current}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-new-password">New password</Label>
            <Input
              id="admin-new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              disabled={saving}
              aria-invalid={errors.next ? true : undefined}
              aria-describedby={
                errors.next
                  ? "admin-new-password-error"
                  : "admin-new-password-hint"
              }
            />
            {errors.next ? (
              <p
                id="admin-new-password-error"
                className="text-xs text-destructive"
              >
                {errors.next}
              </p>
            ) : (
              <p
                id="admin-new-password-hint"
                className="text-xs text-muted-foreground"
              >
                At least {MIN_PASSWORD_LENGTH} characters.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="admin-confirm-password">Confirm new password</Label>
            <Input
              id="admin-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              disabled={saving}
              aria-invalid={errors.confirm ? true : undefined}
              aria-describedby={
                errors.confirm ? "admin-confirm-password-error" : undefined
              }
            />
            {errors.confirm && (
              <p
                id="admin-confirm-password-error"
                className="text-xs text-destructive"
              >
                {errors.confirm}
              </p>
            )}
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
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { ChangePasswordDialog }
