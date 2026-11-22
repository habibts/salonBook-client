import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/** Consistent status colours across every dashboard surface. */
const STATUS_STYLES: Record<string, string> = {
  Pending: "border-gold/35 bg-champagne/50 text-charcoal dark:text-ivory",
  Confirmed: "border-gold/35 bg-gold/10 text-charcoal dark:text-champagne",
  Completed: "border-sage/35 bg-sage/15 text-sage",
  Cancelled: "border-gold/40 bg-champagne/60 text-charcoal dark:text-ivory",
  Active: "border-sage/35 bg-sage/15 text-sage",
  Inactive: "border-border bg-muted text-muted-foreground",
  Blocked: "border-gold/40 bg-champagne/60 text-charcoal dark:text-ivory",
  Paid: "border-sage/35 bg-sage/15 text-sage",
  Unpaid: "border-gold/35 bg-champagne/50 text-charcoal dark:text-ivory",
  Refunded: "border-border bg-muted text-muted-foreground",
}

interface StatusBadgeProps {
  status: string
  className?: string
}

/** Pill badge with a live dot, using the shared status colour map. */
function StatusBadge({ status, className }: StatusBadgeProps) {
  const style =
    STATUS_STYLES[status] ??
    "border-border bg-muted text-muted-foreground"

  return (
    <Badge
      className={cn(
        "h-6 gap-1.5 border px-2.5 text-[11px] font-semibold tracking-[0.08em] uppercase",
        style,
        className
      )}
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-current opacity-80"
      />
      {status}
    </Badge>
  )
}

export { StatusBadge }
