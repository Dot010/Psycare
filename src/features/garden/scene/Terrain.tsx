"use client";

import { useMemo } from "react";
import { BufferAttribute, Color, PlaneGeometry } from "three";
import { BED_RADIUS, heightAt } from "@/features/garden/scene/heightmap";

const LOW = new Color("#6f8a45");
const HIGH = new Color("#9bb066");
const TINT = new Color("#8aa04f");

/** Chão com colinas (altura de `heightAt`), tingido do verde-oliva ao verde-claro conforme a altura. */
export function Terrain({ night }: { night: boolean }) {
  const geometry = useMemo(() => {
    const plane = new PlaneGeometry(90, 90, 130, 130);
    plane.rotateX(-Math.PI / 2);
    const position = plane.getAttribute("position");
    const colors = new Float32Array(position.count * 3);
    const color = new Color();

    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const z = position.getZ(i);
      const h = heightAt(x, z);
      position.setY(i, h);
      const mix = Math.min(1, Math.max(0, (h + 0.5) / 3));
      color
        .copy(LOW)
        .lerp(HIGH, mix)
        .lerp(TINT, 0.5 + 0.5 * Math.sin(x * 0.7) * Math.cos(z * 0.6));
      colors.set([color.r, color.g, color.b], i * 3);
    }
    plane.setAttribute("color", new BufferAttribute(colors, 3));
    plane.computeVertexNormals();
    return plane;
  }, []);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={1} color={night ? "#b4bfd6" : "#ffffff"} />
      </mesh>

      {/* Canteiro de terra, levemente elevado, com borda de pedras. */}
      <mesh position={[0, 0.04, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[BED_RADIUS - 0.2, 48]} />
        <meshStandardMaterial color={night ? "#4a3a34" : "#7a5846"} roughness={1} />
      </mesh>
    </group>
  );
}
