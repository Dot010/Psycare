"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { Group, Mesh } from "three";
import type { PlantKind } from "@/features/garden/types";
import { PLANT_SPOTS, type BumpRef } from "@/features/garden/components/Plants";
import { WATER_EVENT } from "@/features/garden/water";

const HEAD_HEIGHT: Record<PlantKind, number> = { sunflower: 3.1, daisy: 1.6, tulip: 1.95, lavender: 1.25 };

interface WaterDropProps {
  kinds: PlantKind[];
  bumps: BumpRef;
  animate: boolean;
}

/** Quando o jardim ganha uma gota, ela cai do céu sobre uma planta, faz um respingo e a planta "cresce" um pouco. */
export function WaterDrop({ kinds, bumps, animate }: WaterDropProps) {
  const drop = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);
  const root = useRef<Group>(null);
  const latest = useRef(kinds);

  useEffect(() => {
    latest.current = kinds;
  }, [kinds]);

  useEffect(() => {
    const onWater = () => {
      const list = latest.current;
      const kind = list[Math.floor(Math.random() * list.length)];
      const dropMesh = drop.current;
      const ringMesh = ring.current;
      const group = root.current;
      if (!kind || !dropMesh || !ringMesh || !group) return;

      const [x, z] = PLANT_SPOTS[kind];
      const targetY = HEAD_HEIGHT[kind] * 0.95;
      group.position.set(x, 0, z);

      const impact = () => {
        bumps.current[kind] = 1;
        gsap.to(bumps.current, { [kind]: 0, duration: 1.1, ease: "elastic.out(1, 0.35)" });
      };

      if (!animate) {
        impact();
        return;
      }

      gsap.killTweensOf([dropMesh.position, dropMesh.scale, ringMesh.scale, ringMesh.material]);
      dropMesh.visible = true;
      dropMesh.position.set(0, targetY + 3.2, 0);
      dropMesh.scale.set(1, 1.4, 1);
      gsap
        .timeline()
        .to(dropMesh.position, { y: targetY, duration: 0.7, ease: "power2.in" })
        .add(() => {
          dropMesh.visible = false;
          impact();
          ringMesh.position.set(0, targetY, 0);
          ringMesh.visible = true;
          ringMesh.scale.set(0.2, 0.2, 0.2);
          (ringMesh.material as { opacity: number }).opacity = 0.9;
        })
        .to(ringMesh.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 0.6, ease: "power2.out" }, "<")
        .to(ringMesh.material, { opacity: 0, duration: 0.6 }, "<")
        .add(() => {
          ringMesh.visible = false;
        });
    };

    window.addEventListener(WATER_EVENT, onWater);
    return () => window.removeEventListener(WATER_EVENT, onWater);
  }, [animate, bumps]);

  return (
    <group ref={root}>
      <mesh ref={drop} visible={false}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial
          color="#8fd0e8"
          emissive="#4aa9c9"
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh ref={ring} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.34, 32]} />
        <meshBasicMaterial color="#bfeaf5" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
