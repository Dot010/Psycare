"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  type Group,
  type Points,
} from "three";
import { seeded } from "@/features/garden/scene/terrain";

/** Bolinha macia usada pelas pétalas e vaga-lumes. */
function useDotTexture() {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.5, "rgba(255,255,255,0.6)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    return new CanvasTexture(canvas);
  }, []);
}

/** Borboleta que passeia em torno do canteiro. */
export function Butterfly({ animate }: { animate: boolean }) {
  const root = useRef<Group>(null);
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);

  useFrame(({ clock }) => {
    const t = animate ? clock.elapsedTime : 0;
    const node = root.current;
    if (!node) return;
    const x = Math.sin(t * 0.35) * 2.6 + Math.sin(t * 0.9) * 0.3;
    const z = Math.cos(t * 0.27) * 1.8 + 0.6;
    const y = 1.5 + Math.sin(t * 0.6) * 0.5 + Math.sin(t * 2.1) * 0.08;
    node.rotation.y =
      Math.atan2(Math.cos(t * 0.35) * 2.6 * 0.35, -Math.sin(t * 0.27) * 1.8 * 0.27) - Math.PI / 2;
    node.position.set(x, y, z);
    const flap = Math.sin(t * 16) * 0.9;
    if (left.current) left.current.rotation.y = -(0.35 + flap);
    if (right.current) right.current.rotation.y = 0.35 + flap;
  });

  const wing = (side: 1 | -1) => (
    <mesh position={[side * 0.1, 0, 0]} scale={[0.1, 0.14, 1]}>
      <circleGeometry args={[1, 14]} />
      <meshBasicMaterial color={side === 1 ? "#EAD96B" : "#f2e48a"} side={2} />
    </mesh>
  );

  return (
    <group ref={root}>
      <group ref={left}>{wing(-1)}</group>
      <group ref={right}>{wing(1)}</group>
      <mesh scale={[0.012, 0.05, 0.012]}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshBasicMaterial color="#4d1f1a" />
      </mesh>
    </group>
  );
}

interface DriftProps {
  count: number;
  animate: boolean;
}

/** Pétalas levadas pelo vento, atravessando a cena. */
export function Petals({ count, animate }: DriftProps) {
  const points = useRef<Points>(null);
  const texture = useDotTexture();

  const geometry = useMemo(() => {
    const rand = seeded(21);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++)
      positions.set([(rand() - 0.5) * 16, 0.4 + rand() * 4, (rand() - 0.5) * 10], i * 3);
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  useFrame(({ clock }, delta) => {
    const node = points.current;
    if (!node || !animate) return;
    const position = node.geometry.getAttribute("position");
    for (let i = 0; i < count; i++) {
      let x = position.getX(i) + delta * (0.45 + (i % 5) * 0.08);
      const y = position.getY(i) - delta * 0.12 + Math.sin(clock.elapsedTime * 1.2 + i) * delta * 0.25;
      if (x > 8) x = -8;
      position.setXYZ(i, x, y < 0.2 ? 4.2 : y, position.getZ(i));
    }
    position.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        map={texture}
        color="#f7d9d0"
        size={0.14}
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}

/** Vaga-lumes da noite: brilham e vagam devagar. */
export function Fireflies({ count, animate }: DriftProps) {
  const points = useRef<Points>(null);
  const texture = useDotTexture();

  const geometry = useMemo(() => {
    const rand = seeded(33);
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++)
      positions.set([(rand() - 0.5) * 12, 0.3 + rand() * 2.6, (rand() - 0.5) * 8], i * 3);
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    return geo;
  }, [count]);

  const base = useMemo(
    () => Float32Array.from(geometry.getAttribute("position").array as Float32Array),
    [geometry],
  );

  useFrame(({ clock }) => {
    const node = points.current;
    if (!node) return;
    const t = animate ? clock.elapsedTime : 0;
    const position = node.geometry.getAttribute("position");
    for (let i = 0; i < count; i++) {
      position.setXYZ(
        i,
        base[i * 3] + Math.sin(t * 0.4 + i) * 0.6,
        base[i * 3 + 1] + Math.sin(t * 0.7 + i * 2) * 0.3,
        base[i * 3 + 2] + Math.cos(t * 0.35 + i * 1.5) * 0.6,
      );
    }
    position.needsUpdate = true;
    const material = node.material as { opacity: number };
    material.opacity = 0.65 + Math.sin(t * 2) * 0.3;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        map={texture}
        color="#f4f08a"
        size={0.28}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}
