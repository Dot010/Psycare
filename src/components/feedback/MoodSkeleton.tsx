import { Skeleton } from "@/components/ui/skeleton";

/** Esqueleto da página Humor: título, curva dos últimos dias e filtros. */
export function MoodSkeleton() {
  return (
    <div role="status" aria-label="Carregando humor" className="mx-auto max-w-3xl space-y-5 p-4 md:p-8">
      <Skeleton className="h-8 w-40" />
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-4 w-28" />
        <svg viewBox="0 0 320 90" aria-hidden="true" className="h-24 w-full">
          <path d="M0 60 C40 30 70 70 110 45 S180 20 220 50 S290 35 320 30 V90 H0Z" className="fill-sunken" />
        </svg>
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-14 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}
