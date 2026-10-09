import { cn } from "@/lib/utils";

/** Broto do PsyCare, usado no login e como base do loader. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 26 26" aria-hidden="true" className={cn("size-8", className)}>
      <path d="M13 24 V12" stroke="#5e7638" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M13 15 C5 14 3 8 4 4 C10 4 14 9 13 15Z" fill="#8ea466" />
      <path d="M13 11 C20 11 23 6 22 2 C16 2 12 6 13 11Z" fill="#5e7638" />
    </svg>
  );
}
