"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const Nav = dynamic(() => import("@/components/Nav"), {
  ssr: false,
  loading: () => (
    <aside className="hidden md:block h-screen w-20 shrink-0 bg-emerald-600/95 animate-pulse" />
  ),
});

const NavMobile = dynamic(() => import("@/components/NavMobile"), {
  ssr: false,
  loading: () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 border-t border-slate-200 z-50" />
  ),
});

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <Nav />
      <NavMobile />

      <main className="flex-1 bg-slate-50 overflow-y-auto pb-28 md:pb-8">
        <Suspense
          fallback={
            <div className="space-y-4 p-4 md:p-8 animate-pulse">
              <div className="h-32 w-full rounded-3xl bg-slate-200/70" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="h-48 rounded-2xl bg-slate-200/70" />
                <div className="h-48 rounded-2xl bg-slate-200/70" />
                <div className="h-48 rounded-2xl bg-slate-200/70" />
              </div>
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
};

export default DashboardLayout;