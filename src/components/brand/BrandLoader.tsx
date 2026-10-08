import { cn } from "@/lib/utils";

interface BrandLoaderProps {
  className?: string;
  /** Texto lido por leitores de tela. */
  label?: string;
}

/** Broto que cresce e balança. Usado em carregamentos longos. */
export function BrandLoader({ className, label = "Carregando" }: BrandLoaderProps) {
  return (
    <div role="status" className={cn("inline-flex flex-col items-center gap-2", className)}>
      <svg viewBox="0 0 64 72" aria-hidden="true" className="animate-sway h-18 w-16">
        <path
          d="M32 70 V30"
          stroke="#5e7638"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          className="animate-sprout"
        />
        <g className="animate-sprout">
          <path d="M32 40 C14 38 10 24 12 16 C26 16 34 26 32 40Z" fill="#8ea466" className="animate-leaf" />
          <path d="M32 32 C48 32 54 20 52 10 C38 10 30 20 32 32Z" fill="#5e7638" className="animate-leaf" />
        </g>
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}
