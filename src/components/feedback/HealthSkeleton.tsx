import { Skeleton } from "@/components/ui/skeleton";

/** Esqueleto da página Saúde: título e a linha do dia com as doses. */
export function HealthSkeleton() {
  return (
    <div role="status" aria-label="Carregando saúde" className="mx-auto max-w-3xl space-y-5 p-4 md:p-8">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4 rounded-xl border border-border bg-card p-4">
        {["w-3/4", "w-1/2", "w-2/3"].map((width) => (
          <div key={width} className="flex items-center gap-4">
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className={`h-3.5 ${width}`} />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
