const AVATAR_MAX_DIMENSION = 512
const AVATAR_QUALITY = 0.85

// Compress an image file into a small JPEG data URL suitable for storing as an avatar.
// Keeps profile photos lightweight enough to save directly in the user record.
async function fileToAvatarDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error("Could not load image"))
      el.src = objectUrl
    })

    const scale = Math.min(
      1,
      AVATAR_MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight),
    )
    const width = Math.max(1, Math.round(img.naturalWidth * scale))
    const height = Math.max(1, Math.round(img.naturalHeight * scale))

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas is not supported in this browser")

    // Flatten transparency onto white so PNGs don't turn black as JPEG
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    return canvas.toDataURL("image/jpeg", AVATAR_QUALITY)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export { fileToAvatarDataUrl }
