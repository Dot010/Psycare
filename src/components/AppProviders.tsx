"use client";

import { MotionConfig } from "framer-motion";
import NextTopLoader from "nextjs-toploader";
import { type ReactNode, useEffect } from "react";
import { initClientObservability } from "@/lib/observability/client";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    initClientObservability();
  }, []);

  return (
    <MotionConfig transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
      <SmoothScrollProvider>
        <NextTopLoader
          color="#10b981"
          initialPosition={0.08}
          crawlSpeed={220}
          height={3}
          crawl
          showSpinner={false}
          easing="cubic-bezier(0.22, 1, 0.36, 1)"
          speed={280}
          shadow="0 0 10px #10b981,0 0 6px #10b981"
        />
        {children}
      </SmoothScrollProvider>
    </MotionConfig>
  );
}
