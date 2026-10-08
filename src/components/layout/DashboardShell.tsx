"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { CrisisButton } from "@/components/feedback/CrisisButton";
import { PageSkeleton } from "@/components/feedback/PageSkeleton";
import type { NavVariant } from "@/components/layout/nav-items";

const Nav = dynamic(() => import("@/components/layout/Nav"), {
  ssr: false,
  loading: () => <aside className="hidden h-screen w-20 shrink-0 animate-pulse bg-primary/95 md:block" />,
});

const NavMobile = dynamic(() => import("@/components/layout/NavMobile"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-x-0 bottom-0 z-50 h-20 border-t border-border bg-card/80 md:hidden" />
  ),
});

export function DashboardShell({ variant, children }: { variant: NavVariant; children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden md:flex-row">
      <Nav variant={variant} />
      <NavMobile variant={variant} />
      {variant === "patient" && <CrisisButton />}

      <main className="flex-1 overflow-y-auto bg-sunken pb-28 md:pb-8">
        <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
      </main>
    </div>
  );
}
