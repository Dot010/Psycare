"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/motion";

function StaticBackdrop({ animate = false }: { animate?: boolean }) {
  return (
    <div
      className={`absolute inset-0 bg-linear-to-br from-brand-100/35 via-teal-100/20 to-stone-200/40 ${
        animate ? "animate-pulse" : ""
      }`}
    />
  );
}

// three.js só é baixado quando o canvas realmente vai aparecer (desktop, sem "reduzir movimento").
const BlobCanvas = dynamic(() => import("@/components/three/BlobCanvas"), {
  ssr: false,
  loading: () => <StaticBackdrop animate />,
});

export function HeroCanvas() {
  const isMobile = useMediaQuery("(max-width: 900px)");
  const reduced = usePrefersReducedMotion();
  const pointer = useRef({ x: 0, y: 0 });
  const enabled = !isMobile && !reduced;

  useEffect(() => {
    if (!enabled) return;

    const onMouseMove = (event: MouseEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (event.clientY / window.innerHeight - 0.5) * -2;
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [enabled]);

  if (!enabled) return <StaticBackdrop />;

  return (
    <div className="absolute inset-0">
      <BlobCanvas pointer={pointer} fallback={<StaticBackdrop animate />} />
    </div>
  );
}
