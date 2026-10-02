"use client";

import { Suspense, useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { Group } from "three";
import type { PlantKind } from "@/features/garden/types";

const STEM = "#5E7638";
const LEAF = "#7a8f55";

/**
 * Modelos 3D prontos (.glb) por planta. Coloque o arquivo em `public/models/` e informe o caminho aqui,
 * por exemplo `sunflower: "/models/sunflower.glb"`. Sem caminho, a planta é desenhada por código.
 */
export const PLANT_MODELS: Partial<Record<PlantKind, string>> = {};

export type BumpRef = MutableRefObject<Record<string, number>>;

interface PlantProps {
  growth: number;
  /** Pulso de 0 a 1 quando a planta recebe água. */
  bump?: () => number;
  /** Fase do balanço, para as plantas não se mexerem juntas. */
  phase: number;
  sway: boolean;
}

/** Faz a planta balançar de leve e crescer suavemente até o tamanho pedido. */
function useGrow(growth: number, phase: number, sway: boolean, bump?: () => number) {
  const group = useRef<Group>(null);
  const current = useRef(0.01);

  useFrame(({ clock }, delta) => {
    const node = group.current;
    if (!node) return;
    // Sem animação (reduzir movimento), a planta já aparece do tamanho certo.
    current.current = sway ? current.current + (growth - current.current) * Math.min(1, delta * 2.5) : growth;
    const s = current.current;
    const pulse = 1 + (bump?.() ?? 0) * 0.1;
    node.scale.set((0.35 + s * 0.65) * pulse, (0.15 + s * 0.85) * pulse, (0.35 + s * 0.65) * pulse);
    if (sway) node.rotation.z = Math.sin(clock.elapsedTime * 0.8 + phase) * 0.035;
  });

  return group;
}

function Petals({
  count,
  radius,
  length,
  width,
  color,
  y = 0,
}: {
  count: number;
  radius: number;
  length: number;
  width: number;
  color: string;
  y?: number;
}) {
  const items = useMemo(() => Array.from({ length: count }, (_, i) => (i / count) * Math.PI * 2), [count]);
  return (
    <group position={[0, y, 0]}>
      {items.map((angle) => (
        <mesh
          key={angle}
          position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
          rotation={[0, 0, angle - Math.PI / 2]}
          scale={[width, length, 0.25]}
        >
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Leaf({ y, side, size = 1 }: { y: number; side: 1 | -1; size?: number }) {
  return (
    <mesh
      position={[side * 0.2 * size, y, 0]}
      rotation={[0, 0, side * -0.7]}
      scale={[0.28 * size, 0.1 * size, 0.18 * size]}
    >
      <sphereGeometry args={[1, 10, 8]} />
      <meshStandardMaterial color={LEAF} roughness={0.8} />
    </mesh>
  );
}

function Stem({ height, radius = 0.045 }: { height: number; radius?: number }) {
  return (
    <mesh position={[0, height / 2, 0]}>
      <cylinderGeometry args={[radius * 0.8, radius, height, 8]} />
      <meshStandardMaterial color={STEM} roughness={0.85} />
    </mesh>
  );
}

function Sunflower({ growth, phase, sway, bump }: PlantProps) {
  const group = useGrow(growth, phase, sway, bump);
  return (
    <group ref={group}>
      <Stem height={2.2} radius={0.06} />
      <Leaf y={0.7} side={1} size={1.4} />
      <Leaf y={1.2} side={-1} size={1.2} />
      <group position={[0, 2.25, 0]} rotation={[-0.25, 0, 0]}>
        <Petals count={16} radius={0.42} length={0.3} width={0.12} color="#EAD96B" />
        <Petals count={16} radius={0.34} length={0.24} width={0.1} color="#d9c552" />
        <mesh position={[0, 0, 0.03]} scale={[0.36, 0.36, 0.14]}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial color="#4D1F1A" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function Daisy({ growth, phase, sway, bump }: PlantProps) {
  const group = useGrow(growth, phase, sway, bump);
  return (
    <group ref={group}>
      <Stem height={1.1} radius={0.03} />
      <Leaf y={0.4} side={-1} size={0.8} />
      <group position={[0, 1.12, 0]} rotation={[-0.2, 0, 0]}>
        <Petals count={12} radius={0.2} length={0.15} width={0.06} color="#f7f2ea" />
        <mesh scale={[0.14, 0.14, 0.08]}>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial color="#EAD96B" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

function Tulip({ growth, phase, sway, bump }: PlantProps) {
  const group = useGrow(growth, phase, sway, bump);
  return (
    <group ref={group}>
      <Stem height={1.3} radius={0.035} />
      <Leaf y={0.35} side={1} size={1} />
      <Leaf y={0.5} side={-1} size={0.9} />
      <mesh position={[0, 1.4, 0]} scale={[0.17, 0.26, 0.17]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#C97B6A" roughness={0.65} />
      </mesh>
      <mesh position={[0, 1.52, 0]} rotation={[0, 0, 0]} scale={[0.1, 0.16, 0.1]}>
        <coneGeometry args={[1, 1.4, 6]} />
        <meshStandardMaterial color="#B3382C" roughness={0.65} />
      </mesh>
    </group>
  );
}

function Lavender({ growth, phase, sway, bump }: PlantProps) {
  const group = useGrow(growth, phase, sway, bump);
  const spikes = [-0.12, 0, 0.12];
  return (
    <group ref={group}>
      {spikes.map((x, i) => (
        <group key={x} position={[x, 0, 0]} rotation={[0, 0, x * 0.9]}>
          <Stem height={0.9 + i * 0.06} radius={0.018} />
          {[0, 1, 2, 3, 4].map((n) => (
            <mesh key={n} position={[0, 0.7 + i * 0.06 + n * 0.1, 0]} scale={[0.07, 0.09, 0.07]}>
              <sphereGeometry args={[1, 8, 6]} />
              <meshStandardMaterial color={n % 2 ? "#8c78a8" : "#a08ab8"} roughness={0.8} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

const COMPONENTS: Record<PlantKind, (props: PlantProps) => React.ReactElement> = {
  sunflower: Sunflower,
  daisy: Daisy,
  tulip: Tulip,
  lavender: Lavender,
};

function GlbPlant({ url, growth, phase, sway, bump }: PlantProps & { url: string }) {
  const gltf = useLoader(GLTFLoader, url);
  const group = useGrow(growth, phase, sway, bump);
  const model = useMemo(() => gltf.scene.clone(true), [gltf]);
  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

/** Onde cada planta fica no canteiro (x, z). O girassol é o destaque, no centro. */
export const PLANT_SPOTS: Record<PlantKind, [number, number]> = {
  sunflower: [0, -0.3],
  daisy: [-1.3, 0.5],
  tulip: [1.35, 0.35],
  lavender: [-0.45, 1.15],
};

/** Tamanho extra de cada planta na cena. */
const PLANT_SCALE: Record<PlantKind, number> = { sunflower: 1.35, daisy: 1.2, tulip: 1.2, lavender: 1.25 };

interface PlantSceneProps {
  kind: PlantKind;
  growth: number;
  index: number;
  sway: boolean;
  bumps: BumpRef;
  onSelect?: (kind: PlantKind) => void;
}

export function Plant({ kind, growth, index, sway, bumps, onSelect }: PlantSceneProps) {
  const Component = COMPONENTS[kind];
  const [x, z] = PLANT_SPOTS[kind];
  const root = useRef<Group>(null);
  const bump = () => bumps.current[kind] ?? 0;
  const model = PLANT_MODELS[kind];

  // Todas as partes da planta projetam sombra no chão.
  useLayoutEffect(() => {
    root.current?.traverse((child) => {
      if ("isMesh" in child) child.castShadow = true;
    });
  });

  return (
    <group
      ref={root}
      position={[x, 0.05, z]}
      scale={PLANT_SCALE[kind]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.(kind);
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "")}
    >
      {model ? (
        <Suspense fallback={null}>
          <GlbPlant url={model} growth={growth} phase={index * 1.7} sway={sway} bump={bump} />
        </Suspense>
      ) : (
        <Component growth={growth} phase={index * 1.7} sway={sway} bump={bump} />
      )}
    </group>
  );
}
