import type { ReactNode } from "react"

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  /** Primary action rendered on the right, aligned to the baseline on desktop. */
  action?: ReactNode
}

/**
 * Consistent page masthead for every dashboard route: gold eyebrow rule,
 * Playfair headline, muted description and an optional trailing action.
 */
function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="animate-rise flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2.5 flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.24em] text-charcoal uppercase dark:text-gold">
            <span aria-hidden="true" className="h-px w-7 bg-gold/70" />
            {eyebrow}
          </p>
        )}
        <h1 className="font-heading text-[1.75rem] leading-tight font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export { PageHeader }
