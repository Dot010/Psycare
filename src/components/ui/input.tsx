import * as React from "react"
import { cn } from "@/lib/utils"

/** Visual de qualquer campo de texto do app. Também serve para <select> e <textarea>. */
export const fieldControlClass =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-brand-500 focus-visible:ring-3 focus-visible:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60 aria-invalid:border-red-500 aria-invalid:ring-red-500/20";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn("h-10", fieldControlClass, className)}
      {...props}
    />
  )
}

export { Input }
