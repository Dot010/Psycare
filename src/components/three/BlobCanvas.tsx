"use client";

import { Suspense, type MutableRefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { FluidBlob } from "@/components/three/FluidBlob";

interface BlobCanvasProps {
  pointer?: MutableRefObject<{ x: number; y: number }>;
  scaleRef?: MutableRefObject<{ scale: number }>;
  fallback?: React.ReactNode;
}

/** Canvas com a iluminação do tema. Importe sempre via next/dynamic (three.js é pesado). */
export default function BlobCanvas({ pointer, scaleRef, fallback = null }: BlobCanvasProps) {
  return (
    <Suspense fallback={fallback}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.56} />
        <hemisphereLight args={["#d9f6ea", "#f5efe4", 0.45]} />
        <directionalLight position={[2, 2, 3]} intensity={0.95} color="#d9f6ea" />
        <directionalLight position={[-2, -1, 2]} intensity={0.45} color="#f5efe4" />
        <FluidBlob pointer={pointer} scaleRef={scaleRef} />
      </Canvas>
    </Suspense>
  );
}
