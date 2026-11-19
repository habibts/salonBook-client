import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/** Consistent status colours across every dashboard surface. */
const STATUS_STYLES: Record<string, string> = {
  Pending: "border-[#F0D9A8] bg-[#FFF4DF] text-[#8A5A00]",
  Confirmed: "border-[#CFDDFB] bg-[#E9F0FE] text-[#2F5FA8]",
  Completed: "border-[#CBDFCD] bg-[#E9F2EA] text-[#3C6B41]",
  Cancelled: "border-[#F2CECC] bg-[#FBEAE8] text-[#B03A34]",
  Active: "border-[#CBDFCD] bg-[#E9F2EA] text-[#3C6B41]",
  Inactive: "border-[#DED6C8] bg-[#F1EDE5] text-[#77736D]",
  Blocked: "border-[#F2CECC] bg-[#FBEAE8] text-[#B03A34]",
  Paid: "border-[#CBDFCD] bg-[#E9F2EA] text-[#3C6B41]",
  Unpaid: "border-[#F0D9A8] bg-[#FFF4DF] text-[#8A5A00]",
  Refunded: "border-[#DED6C8] bg-[#F1EDE5] text-[#77736D]",
}

interface StatusBadgeProps {
  status: string
  className?: string
}

/** Pill badge with a live dot, using the shared status colour map. */
function StatusBadge({ status, className }: StatusBadgeProps) {
  const style =
    STATUS_STYLES[status] ??
    "border-[#DED6C8] bg-[#F1EDE5] text-[#77736D]"

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
