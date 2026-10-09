import { cn } from "@/lib/utils";

/** Anel pequeno para botões em carregamento. Continua girando com "reduzir movimento". */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "animate-spin inline-block size-4 rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}
