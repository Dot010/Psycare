"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { GardenFallback } from "@/features/garden/components/GardenFallback";
import type { PlantState } from "@/features/garden/types";
import { usePrefersReducedMotion } from "@/lib/motion";

const GardenCanvas = dynamic(() => import("@/features/garden/components/GardenCanvas"), {
  ssr: false,
  loading: () => <GardenFallback />,
});

let webglSupport: boolean | undefined;

function hasWebGL(): boolean {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = !!(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

/** O jardim em 3D; sem WebGL, mostra o desenho em SVG. */
export function GardenScene({ plants }: { plants: PlantState[] }) {
  const reduced = usePrefersReducedMotion();
  const webgl = useSyncExternalStore(
    () => () => {},
    hasWebGL,
    () => true,
  );

  if (!webgl) return <GardenFallback />;
  return <GardenCanvas plants={plants} animate={!reduced} />;
}
