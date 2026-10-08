"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { GardenFallback } from "@/features/garden/components/GardenFallback";
import type { PlantKind, PlantState } from "@/features/garden/types";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/motion";
import { useTheme } from "@/lib/theme";

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

interface GardenSceneProps {
  plants: PlantState[];
  /** 0 a 1: quanto a gaveta cobre da tela (a câmera sobe a cena). */
  lift: number;
  onSelect?: (kind: PlantKind) => void;
}

/** O jardim em 3D (dia ou noite, conforme o tema); sem WebGL, mostra o desenho em SVG. */
export function GardenScene({ plants, lift, onSelect }: GardenSceneProps) {
  const reduced = usePrefersReducedMotion();
  const compact = useMediaQuery("(max-width: 767px)");
  const night = useTheme() === "dark";
  const webgl = useSyncExternalStore(
    () => () => {},
    hasWebGL,
    () => true,
  );

  if (!webgl) return <GardenFallback />;
  return (
    <GardenCanvas
      plants={plants}
      animate={!reduced}
      night={night}
      quality={compact ? "low" : "high"}
      lift={lift}
      onSelect={onSelect}
    />
  );
}
