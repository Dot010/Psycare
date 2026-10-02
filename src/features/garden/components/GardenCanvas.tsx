"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { PCFSoftShadowMap } from "three";
import { Plant, type BumpRef } from "@/features/garden/components/Plants";
import { Butterfly, Fireflies, Petals } from "@/features/garden/scene/Critters";
import { Pebbles, Sprouts, Wildflowers } from "@/features/garden/scene/Details";
import { Grass } from "@/features/garden/scene/Grass";
import { skyPalette } from "@/features/garden/scene/lighting";
import { Sky } from "@/features/garden/scene/Sky";
import { Terrain } from "@/features/garden/scene/Terrain";
import { WaterDrop } from "@/features/garden/scene/WaterDrop";
import type { PlantKind, PlantState } from "@/features/garden/types";

export interface GardenCanvasProps {
  plants: PlantState[];
  /** Balanço, bichinhos e movimento de câmera ligados (desligue com "reduzir movimento"). */
  animate: boolean;
  /** Tema escuro: vira noite. */
  night: boolean;
  /** "low" para celulares: menos grama, flores e sombras mais simples. */
  quality: "high" | "low";
  /** 0 (gaveta recolhida) a 1 (gaveta aberta): a câmera sobe a cena para ela não ficar escondida. */
  lift: number;
  onSelect?: (kind: PlantKind) => void;
}

/** Câmera que acompanha o ponteiro de leve e se ajusta à gaveta. */
function CameraRig({ lift, animate }: { lift: number; animate: boolean }) {
  const current = useRef(lift);

  useFrame(({ camera, pointer, size }, delta) => {
    current.current += (lift - current.current) * Math.min(1, delta * 3);
    const l = current.current;
    const px = animate ? pointer.x * 0.8 : 0;
    const py = animate ? pointer.y * 0.25 : 0;
    // Em telas estreitas (celular) a câmera recua para o canteiro caber na largura.
    const aspect = size.width / size.height;
    const distance = Math.min(17, Math.max(8.4, 3.6 / (Math.tan((42 * Math.PI) / 360) * aspect)));
    camera.position.set(px, 2.1 - l * 0.5 + py, distance);
    camera.lookAt(0, 1.35 - l * 1.7, 0);
  });

  return null;
}

function Scene({ plants, animate, night, quality, lift, onSelect }: GardenCanvasProps) {
  const bumps: BumpRef = useRef({});
  const high = quality === "high";

  const hour = useMemo(() => {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60;
  }, []);
  const sky = skyPalette(hour, night);
  const kinds = useMemo(() => plants.map((plant) => plant.kind), [plants]);
  const lightPosition = sky.lightPosition;
  const shadowSize = high ? 1024 : 512;

  return (
    <>
      <CameraRig lift={lift} animate={animate} />
      <fog attach="fog" args={[sky.horizon, 16, 44]} />

      <ambientLight color={sky.ambient} intensity={sky.ambientIntensity} />
      <hemisphereLight
        args={[night ? "#7f8fc4" : "#fff6d6", night ? "#2a3326" : "#6f8a45", night ? 0.35 : 0.5]}
      />
      <directionalLight
        position={lightPosition}
        color={sky.sunColor}
        intensity={sky.sunIntensity}
        castShadow
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0006}
      />

      <Sky
        top={sky.top}
        horizon={sky.horizon}
        night={night}
        lightPosition={lightPosition}
        animate={animate}
      />
      <Terrain night={night} />
      <Grass count={high ? 3600 : 1200} animate={animate} night={night} fog={sky.horizon} />
      <Wildflowers count={high ? 120 : 45} />
      <Pebbles />
      <Sprouts />

      {plants.map((plant, index) => (
        <Plant
          key={plant.kind}
          kind={plant.kind}
          growth={plant.growth}
          index={index}
          sway={animate}
          bumps={bumps}
          onSelect={onSelect}
        />
      ))}

      <WaterDrop kinds={kinds} bumps={bumps} animate={animate} />

      {night ? (
        <Fireflies count={high ? 34 : 16} animate={animate} />
      ) : (
        <>
          <Butterfly animate={animate} />
          <Petals count={high ? 36 : 14} animate={animate} />
        </>
      )}
    </>
  );
}

/** Cena 3D do jardim. Importe sempre via next/dynamic (three.js é pesado). */
export default function GardenCanvas(props: GardenCanvasProps) {
  return (
    <Canvas
      shadows={{ type: PCFSoftShadowMap }}
      camera={{ position: [0, 2.1, 8.4], fov: 42, near: 0.1, far: 120 }}
      dpr={props.quality === "high" ? [1, 1.75] : [1, 1.25]}
      frameloop={props.animate ? "always" : "demand"}
      gl={{ antialias: true }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
