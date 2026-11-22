"use client"

import { toast } from "@/components/ui/toast"

interface ToastConfig {
  title: string
  description?: string
  duration?: number
  id?: string
}

const DEFAULT_DURATIONS = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
  loading: 0,
}

function showToast(type: "success" | "error" | "warning" | "info" | "loading", config: ToastConfig) {
  const { title, description, duration, id, ...rest } = config

  return toast.add({
    type,
    title,
    description,
    timeout: duration ?? DEFAULT_DURATIONS[type],
    id,
    ...rest,
  })
}

export const showSuccess = (config: ToastConfig) => showToast("success", config)

export const showError = (config: ToastConfig) => showToast("error", config)

export const showWarning = (config: ToastConfig) => showToast("warning", config)

export const showInfo = (config: ToastConfig) => showToast("info", config)

export const showLoading = (config: ToastConfig) => showToast("loading", config)

export const dismissToast = (id: string) => toast.close(id)

export const dismissAllToasts = () => toast.close()

export const updateToast = (id: string, config: Partial<ToastConfig>) => {
  return toast.update(id, config)
}

export { toast }