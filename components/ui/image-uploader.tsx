"use client"

import { useCallback, useRef, useState } from "react"
import { Upload, X, RefreshCw } from "lucide-react"
import { getTokenData } from "@/lib/token-store"
import { showSuccess, showError } from "@/lib/toast"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
  accept?: string
  maxSize?: number
}

export function ImageUploader({
  value,
  onChange,
  disabled = false,
  accept = "image/jpeg,image/jpg,image/png,image/webp",
  maxSize = MAX_SIZE,
}: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(value || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleRemove = useCallback(() => {
    setFile(null)
    setPreview(value || null)
    setProgress(0)
    onChange(value || "")
  }, [value, onChange])

  const handleReplace = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const startUpload = useCallback(() => {
    const f = file
    if (!f) return

    const token = getTokenData()?.token
    if (!token) {
      showError({ title: "Not Authenticated", description: "Please sign in to upload images." })
      return
    }

    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append("image", f)

    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as { url?: string }
          if (data.url) {
            setPreview(data.url)
            onChange(data.url)
            showSuccess({ title: "Image Uploaded", description: "Service image has been updated." })
          } else {
            showError({ title: "Upload Failed", description: "No image URL returned." })
          }
        } catch {
          showError({ title: "Upload Failed", description: "Invalid server response." })
        }
      } else {
        let message = "Upload failed"
        try {
          const err = JSON.parse(xhr.responseText) as { error?: string }
          if (err.error) message = err.error
        } catch {}
        showError({ title: "Upload Failed", description: message })
      }
      setUploading(false)
      setProgress(0)
    })

    xhr.addEventListener("error", () => {
      showError({ title: "Upload Failed", description: "Network error." })
      setUploading(false)
      setProgress(0)
    })

    xhr.open("POST", `${API_BASE}/services/upload-image`)
    xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    xhr.send(formData)
  }, [file, onChange])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0]
      if (!selected) return

      if (!ALLOWED_TYPES.includes(selected.type)) {
        showError({
          title: "Invalid File Type",
          description: "Only JPG, JPEG, PNG and WEBP images are allowed.",
        })
        return
      }

      if (selected.size > maxSize) {
        showError({
          title: "File Too Large",
          description: `Maximum size is ${Math.round(maxSize / 1024 / 1024)} MB.`,
        })
        return
      }

      setFile(selected)
      const url = URL.createObjectURL(selected)
      setPreview(url)
      startUpload()
    },
    [maxSize, startUpload]
  )

  const hasImage = Boolean(preview)

  return (
    <div className="space-y-3">
      <div
        className={
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all" +
          (disabled || uploading
            ? " border-border bg-muted/50 pointer-events-none"
            : " border-border/50 bg-card/50 hover:border-gold/60 hover:bg-muted hover:cursor-pointer") +
          (hasImage ? " border-transparent bg-transparent" : "")
        }
        onClick={handleReplace}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleReplace()
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled || uploading}
          onChange={handleFileChange}
          className="sr-only"
          aria-label="Upload service image"
        />

        {hasImage && !uploading ? (
          <>
            <div className="relative">
              {preview && (
                <img
                  src={preview}
                  alt="Service image preview"
                  className="w-32 h-32 rounded-lg object-cover border border-border"
                />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white text-xs shadow-md"
                aria-label="Remove image"
              >
                <X className="size-3" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleReplace()
                }}
                className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-foreground text-xs shadow-md"
                aria-label="Replace image"
              >
                <RefreshCw className="size-3" />
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {file ? `Selected: ${file.name}` : "Current image"}
            </p>
          </>
        ) : (
          <>
            <Upload className="size-6 mb-2 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Upload service image</p>
            <p className="text-xs text-muted-foreground">
              JPG, JPEG, PNG, WEBP • Max 5 MB
            </p>
          </>
        )}
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gold" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Uploading image…</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}

      {!hasImage && !file && !uploading && (
        <p className="text-xs text-muted-foreground">No image selected.</p>
      )}
    </div>
  )
}
