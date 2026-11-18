import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, ...props }: InputPrimitive.Props) {
  return (
    <InputPrimitive
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-champagne bg-white px-3.5 text-sm text-midnight transition-colors outline-none placeholder:text-muted-gray hover:border-gold/50 focus-visible:border-gold focus-visible:ring-3 focus-visible:ring-gold/25 aria-invalid:border-destructive disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
