"use client";

import { AnimatedText } from "@/components/motion/AnimatedText";
import { SkyPanel } from "@/features/auth/components/SkyPanel";

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <section className="bg-canvas min-h-screen flex items-center justify-center p-4">
      <div className="bg-surface flex flex-col md:flex-row rounded-xl shadow-sm border border-border max-w-4xl w-full overflow-hidden min-h-137.5">
        <div className="md:w-1/2 w-full">
          <SkyPanel />
        </div>
        <div className="md:w-1/2 w-full md:order-first p-6 md:p-12 flex flex-col justify-center">
          <div className="mb-2">
            <AnimatedText
              as="h1"
              text={title}
              className="text-3xl md:text-4xl font-semibold font-heading text-ink mb-2 leading-tight"
            />
            {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </section>
  );
}
