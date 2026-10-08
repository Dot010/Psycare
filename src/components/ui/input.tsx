import * as React from "react";
import { cn } from "@/lib/utils";

/** Visual de qualquer campo de texto do app. Também serve para <select> e <textarea>. */
export const fieldControlClass =
  "w-full min-w-0 rounded-xl border border-input bg-card px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-brand-600 focus-visible:ring-3 focus-visible:ring-brand-600/20 disabled:cursor-not-allowed disabled:bg-sunken disabled:opacity-60 aria-invalid:border-danger-600 aria-invalid:ring-danger-600/20 data-[valid=true]:border-brand-500";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input type={type} data-slot="input" className={cn("h-10", fieldControlClass, className)} {...props} />
  );
}

export { Input };
