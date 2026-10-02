"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { Plant } from "@/features/garden/components/Plants";
import type { PlantState } from "@/features/garden/types";

interface GardenCanvasProps {
  plants: PlantState[];
  /** Balanço e movimento de câmera ligados (desligue com "reduzir movimento"). */
  animate: boolean;
}

function Bed({ plants, animate }: GardenCanvasProps) {
  const root = useRef<Group>(null);

  // A câmera acompanha o ponteiro de leve: o jardim parece ter profundidade.
  useFrame(({ pointer }) => {
    const node = root.current;
    if (!node || !animate) return;
    node.rotation.y += (pointer.x * 0.25 - node.rotation.y) * 0.04;
  });

  return (
    <group ref={root} position={[0, -1.05, 0]}>
      <mesh position={[0, -0.1, 0.3]} scale={[1, 0.16, 0.8]}>
        <sphereGeometry args={[2.5, 32, 16]} />
        <meshStandardMaterial color="#6f8a45" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.02, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2, 40]} />
        <meshStandardMaterial color="#7d9650" roughness={1} />
      </mesh>
      {plants.map((plant, index) => (
        <Plant key={plant.kind} kind={plant.kind} growth={plant.growth} index={index} sway={animate} />
      ))}
    </group>
  );
}

/** Cena 3D do jardim. Importe sempre via next/dynamic (three.js é pesado). */
export default function GardenCanvas({ plants, animate }: GardenCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 1.0, 6.9], fov: 38 }}
      dpr={[1, 1.5]}
      frameloop={animate ? "always" : "demand"}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#fff6d6", "#6f8a45", 0.55]} />
      <directionalLight position={[3, 5, 4]} intensity={1.15} color="#fff1c2" />
      <Bed plants={plants} animate={animate} />
    </Canvas>
  );
}
