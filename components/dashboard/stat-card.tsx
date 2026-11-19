import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type StatTone = "gold" | "amber" | "blue" | "green" | "red" | "sage" | "neutral"

const TONE_CHIP: Record<StatTone, string> = {
  gold: "bg-gold/10 text-gold",
  amber: "bg-[#FFF4DF] text-[#9A6700]",
  blue: "bg-[#E9F0FE] text-[#2F5FA8]",
  green: "bg-[#E9F2EA] text-[#3C6B41]",
  red: "bg-[#FBEAE8] text-[#B03A34]",
  sage: "bg-sage/10 text-sage",
  neutral: "bg-background text-muted-foreground",
}

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  tone?: StatTone
  /** Optional supporting line — only pass real, derived information. */
  hint?: string
  /** Stagger index for the rise-in animation. */
  order?: number
}

/**
 * Dashboard statistic tile: uppercase label, tinted icon chip, oversized
 * Playfair figure and an optional hint line. Subtle lift on hover.
 */
function StatCard({
  label,
  value,
  icon: Icon,
  tone = "gold",
  hint,
  order = 0,
}: StatCardProps) {
  return (
    <div
      className="animate-rise group relative overflow-hidden rounded-xl border border-border bg-card p-5 ring-1 ring-border/60 surface-raised transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40 hover:surface-floating"
      style={{ animationDelay: `${Math.min(order, 8) * 70}ms` }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-10 -right-10 size-32 rounded-full opacity-[0.06] transition-opacity duration-300 group-hover:opacity-10",
          tone === "amber" || tone === "blue" || tone === "red"
            ? "bg-gold"
            : tone === "sage" || tone === "green"
              ? "bg-sage"
              : "bg-gold"
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <p className="pt-1 text-[11px] leading-relaxed font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {label}
        </p>
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
            TONE_CHIP[tone]
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>

      <p className="relative mt-4 font-heading text-[2.25rem] leading-none font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>

      {hint && (
        <p className="relative mt-2 text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

export { StatCard }
export type { StatTone }
