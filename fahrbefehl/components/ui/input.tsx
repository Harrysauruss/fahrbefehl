import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-12 w-full min-w-0 rounded-none border-[3px] border-border bg-background px-4 py-2 text-base shadow-[var(--shadow-brutal)] transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-semibold disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-base",
        "focus-visible:border-ring focus-visible:ring-0 focus-visible:-translate-y-[2px] focus-visible:-translate-x-[2px] focus-visible:shadow-[calc(var(--shadow-offset)+2px)_calc(var(--shadow-offset)+2px)_0px_0px_var(--shadow-color)]",
        "aria-invalid:border-destructive aria-invalid:shadow-[var(--shadow-offset)_var(--shadow-offset)_0px_0px_var(--color-destructive)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
