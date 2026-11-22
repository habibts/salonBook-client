"use client"

import { useRef, useState, type ChangeEvent } from "react"
import { Camera } from "lucide-react"

import { fileToAvatarDataUrl } from "@/lib/image"
import { showError } from "@/lib/toast"

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

interface ProfilePhotoPickerProps {
  onChange: (dataUrl: string | null) => void
  disabled?: boolean
}

function ProfilePhotoPicker({ onChange, disabled = false }: ProfilePhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  async function handlePick(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    // Reset so picking the same file again still fires a change event
    e.target.value = ""
    if (!selected) return

    if (!ALLOWED_TYPES.includes(selected.type.toLowerCase())) {
      showError({
        title: "Invalid Image Type",
        description: "Only JPG, JPEG, PNG and WEBP images are allowed.",
      })
      return
    }

    if (selected.size > MAX_SIZE) {
      showError({ title: "Image Too Large", description: "Maximum size is 5 MB." })
      return
    }

    setProcessing(true)
    try {
      const dataUrl = await fileToAvatarDataUrl(selected)
      setPreview(dataUrl)
      onChange(dataUrl)
    } catch {
      showError({
        title: "Image Processing Failed",
        description: "Could not process this photo. Please try another one.",
      })
    } finally {
      setProcessing(false)
    }
  }

  function handleRemove() {
    setPreview(null)
    onChange(null)
  }

  const busy = disabled || processing

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label={preview ? "Change profile photo" : "Add profile photo"}
        className="group relative size-20 overflow-hidden rounded-full border-2 border-dashed border-champagne bg-muted text-muted-foreground transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-50"
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Profile photo preview"
              className="size-full object-cover"
            />
            {!processing && (
              <span className="absolute inset-0 flex items-center justify-center bg-midnight/50 text-ivory opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="size-5" aria-hidden="true" />
              </span>
            )}
          </>
        ) : (
          <Camera className="mx-auto size-6" aria-hidden="true" />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        disabled={busy}
        onChange={handlePick}
        className="sr-only"
        aria-label="Upload profile photo"
      />

      <p className="text-xs text-muted-foreground">
        {processing
          ? "Processing photo…"
          : preview
            ? "Click to change photo"
            : "Add a profile photo"}{" "}
        <span className="text-muted-foreground/70">(optional)</span>
      </p>
      <p className="text-[11px] text-muted-foreground/70">JPG, JPEG, PNG or WEBP • Max 5 MB</p>

      {preview && !processing && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={busy}
          className="text-xs font-medium text-destructive transition-colors hover:underline disabled:opacity-50"
        >
          Remove photo
        </button>
      )}
    </div>
  )
}

export { ProfilePhotoPicker }
