import { ReactNode } from "react";
import OnboardingModal from "@/components/OnboardingModal";
import Header from "@/components/Header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <OnboardingModal />
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
}