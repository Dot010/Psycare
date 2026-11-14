"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { CrisisButton } from "@/components/feedback/CrisisButton";
import { PageSkeleton } from "@/components/feedback/PageSkeleton";
import { TaskReminder } from "@/features/planner/components/TaskReminder";
import type { NavVariant } from "@/components/layout/nav-items";

// No computador o menu é uma barra no topo (a barra lateral saiu).
const TopNav = dynamic(() => import("@/components/layout/TopNav"), {
  ssr: false,
  loading: () => <div className="hidden h-16 shrink-0 border-b border-border bg-canvas md:block" />,
});

const NavMobile = dynamic(() => import("@/components/layout/NavMobile"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-x-0 bottom-0 z-50 h-20 border-t border-border bg-card/80 md:hidden" />
  ),
});

export function DashboardShell({ variant, children }: { variant: NavVariant; children: React.ReactNode }) {
  return (
    <div data-app-shell className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopNav variant={variant} />
      <NavMobile variant={variant} />
      {variant === "patient" && <CrisisButton />}
      {variant === "patient" && <TaskReminder />}

      <main className="flex-1 overflow-y-auto bg-sunken pb-28 md:pb-8">
        <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
      </main>
    </div>
  );
}
