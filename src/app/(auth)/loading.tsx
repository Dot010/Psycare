import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6 animate-enter">
        <Skeleton className="h-130 w-full rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/5" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
