"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { XIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const toast = ToastPrimitive.createToastManager()

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm sm:max-w-[380px]",
        className
      )}
      {...props}
    />
  )
}

const typeStyles = {
  success: "bg-white border-sage/30 shadow-[0_4px_24px_-4px_rgba(101,124,103,0.35)]",
  error: "bg-white border-destructive/30 shadow-[0_4px_24px_-4px_rgba(220,38,38,0.3)]",
  warning: "bg-white border-champagne/40 shadow-[0_4px_24px_-4px_rgba(232,216,185,0.4)]",
  info: "bg-white border-gold/30 shadow-[0_4px_24px_-4px_rgba(184,149,90,0.3)]",
  loading: "bg-white border-gold/30 shadow-[0_4px_24px_-4px_rgba(184,149,90,0.3)]",
  default: "bg-white border-hairline shadow-lg",
}

const typeIconStyles = {
  success: "text-sage",
  error: "text-destructive",
  warning: "text-champagne",
  info: "text-gold",
  loading: "text-gold",
  default: "text-muted-foreground",
}

function Toast({ className, type, ...props }: ToastPrimitive.Root.Props & { type?: string }) {
  const baseStyles = typeStyles[type as keyof typeof typeStyles] ?? typeStyles.default

  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group/toast pointer-events-auto relative w-full origin-top-right rounded-2xl border transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full",
        "data-[state=open]:slide-in-from-top-full data-[state=open]:fade-in-0",
        baseStyles,
        className
      )}
      {...props}
    />
  )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "flex items-start gap-3 p-4",
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-medium text-midnight leading-snug", className)}
      {...props}
    />
  )
}

function ToastDescription({ className, ...props }: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm text-muted-gray leading-relaxed mt-0.5", className)}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0 mt-2", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "shrink-0 text-muted-gray hover:text-midnight transition-colors",
        className
      )}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" className="size-4" />}
    </ToastPrimitive.Close>
  )
}

function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode = null

  if (type === "success") {
    icon = <CircleCheckIcon aria-hidden="true" />
  }

  if (type === "info") {
    icon = <InfoIcon aria-hidden="true" />
  }

  if (type === "warning") {
    icon = <TriangleAlertIcon aria-hidden="true" />
  }

  if (type === "error") {
    icon = <OctagonXIcon aria-hidden="true" />
  }

  if (type === "loading") {
    icon = <Loader2Icon className="animate-spin" aria-hidden="true" />
  }

  if (!icon) {
    return null
  }

  const iconColor = typeIconStyles[type as keyof typeof typeIconStyles] ?? typeIconStyles.default

  return (
    <span
      data-slot="toast-icon"
      className={cn("shrink-0 mt-0.5 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5", iconColor)}
    >
      {icon}
    </span>
  )
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem} type={toastItem.type}>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <ToastAction />
          <ToastClose />
        </div>
      </ToastContent>
    </Toast>
  ))
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )
}

const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
}