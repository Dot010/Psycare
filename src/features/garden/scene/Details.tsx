"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, Object3D, type InstancedMesh } from "three";
import { BED_RADIUS, heightAt, seeded } from "@/features/garden/scene/terrain";

const FLOWER_COLORS = ["#EAD96B", "#f7f2ea", "#C97B6A", "#a08ab8", "#EAD96B", "#f7f2ea"];

/** Flores do campo espalhadas pelas colinas (uma chamada de desenho só). Dão cor e profundidade ao fundo. */
export function Wildflowers({ count }: { count: number }) {
  const mesh = useRef<InstancedMesh>(null);

  const items = useMemo(() => {
    const rand = seeded(5);
    return Array.from({ length: count }, () => {
      const radius = BED_RADIUS + 0.8 + Math.sqrt(rand()) * 18;
      const angle = rand() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      // Só do canteiro para trás: perto da câmera uma flor encheria a tela.
      const z = Math.min(Math.sin(angle) * radius * 0.8 - 3, 0.2);
      return {
        x,
        z,
        y: heightAt(x, z),
        scale: 0.5 + rand() * 0.7,
        color: FLOWER_COLORS[Math.floor(rand() * FLOWER_COLORS.length)],
      };
    });
  }, [count]);

  useLayoutEffect(() => {
    const node = mesh.current;
    if (!node) return;
    const dummy = new Object3D();
    const color = new Color();
    items.forEach((item, i) => {
      dummy.position.set(item.x, item.y + 0.32 * item.scale, item.z);
      dummy.scale.setScalar(item.scale);
      dummy.updateMatrix();
      node.setMatrixAt(i, dummy.matrix);
      node.setColorAt(i, color.set(item.color));
    });
    node.instanceMatrix.needsUpdate = true;
    if (node.instanceColor) node.instanceColor.needsUpdate = true;
  }, [items]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.075, 8, 6]} />
      <meshStandardMaterial roughness={0.8} />
    </instancedMesh>
  );
}

/** Pedras ao redor do canteiro, de tamanhos diferentes. */
export function Pebbles() {
  const items = useMemo(() => {
    const rand = seeded(9);
    return Array.from({ length: 22 }, (_, i) => {
      const angle = (i / 22) * Math.PI * 2 + rand() * 0.2;
      const radius = BED_RADIUS - 0.05 + rand() * 0.18;
      const scale = 0.07 + rand() * 0.11;
      return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, scale, tone: rand() };
    });
  }, []);

  return (
    <group>
      {items.map((item, i) => (
        <mesh
          key={i}
          position={[item.x, item.scale * 0.35, item.z]}
          scale={[item.scale * 1.3, item.scale * 0.8, item.scale]}
          castShadow
          receiveShadow
        >
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={item.tone > 0.5 ? "#c5b9b4" : "#a89c96"}
            roughness={0.95}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

/** Brotinhos no canteiro: dão vida à terra mesmo no primeiro dia. */
export function Sprouts() {
  const spots: [number, number, number][] = [
    [-0.4, 0.9, 0.9],
    [0.6, 1.1, 1.0],
    [1.4, -0.6, 0.8],
    [-1.6, -0.4, 1.1],
    [0.3, -1.3, 0.9],
    [-0.9, -1.1, 0.8],
  ];
  return (
    <group>
      {spots.map(([x, z, s], i) => (
        <group key={i} position={[x, 0.05, z]} rotation={[0, i * 1.3, 0]} scale={s * 0.8}>
          <mesh position={[-0.05, 0.09, 0]} rotation={[0, 0, 0.6]} scale={[0.1, 0.045, 0.05]} castShadow>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color="#8fa862" roughness={0.8} />
          </mesh>
          <mesh position={[0.05, 0.09, 0]} rotation={[0, 0, -0.6]} scale={[0.1, 0.045, 0.05]} castShadow>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color="#7a9650" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
