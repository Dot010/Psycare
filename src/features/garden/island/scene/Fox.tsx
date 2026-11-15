"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import {
  AnimationMixer,
  Box3,
  MeshToonMaterial,
  Vector3,
  type AnimationAction,
  type Bone,
  type Group,
  type Mesh,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { heightAt, keepOnIsland } from "@/features/garden/island/places";
import { toon } from "@/features/garden/island/scene/builders";

/** Raposa: modelo do Quaternius (CC0), com 7 animações. Fica em `public/models/fox.glb`. */
export const FOX_URL = "/models/fox.glb";
const LENGTH = 2.7;

export interface FoxProps {
  /** Para onde ela está indo (null = fica por perto, passeando). */
  target: [number, number] | null;
  /** Ponto para onde ela olha quando chega (o lugar). */
  face: [number, number] | null;
  /** A posição dela, para a grama abrir caminho. */
  position: MutableRefObject<Vector3>;
  animate: boolean;
  /** Pulo de alegria: muda o número e ela pula. */
  joy: number;
  onPet: () => void;
}

const angleLerp = (a: number, b: number, k: number) => {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * k;
};

export function Fox({ target, face, position, animate, joy, onPet }: FoxProps) {
  const gltf = useLoader(GLTFLoader, FOX_URL);
  const root = useRef<Group>(null);
  const ring = useRef<Group>(null);
  const arc = useRef<Mesh>(null);
  const state = useRef({
    heading: Math.PI * 0.85,
    speed: 0,
    wanderAt: 6,
    wander: null as [number, number] | null,
    hop: 0,
    look: 0,
  });

  // Cores do modelo no mesmo estilo da ilha (luz em faixas) e uma borda clara em volta.
  const { model, scale, bones } = useMemo(() => {
    const scene = gltf.scene;
    scene.traverse((child) => {
      const m = child as Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      const old = m.material as MeshToonMaterial;
      const name = old.name;
      const color =
        name === "Main"
          ? 0xe0773a
          : name === "Main_Light"
            ? 0xf4ebdd
            : old.color.clone().convertLinearToSRGB().getHex();
      const mat = toon(color);
      mat.onBeforeCompile = (shader) => {
        const chunk = shader.fragmentShader.includes("#include <opaque_fragment>")
          ? "#include <opaque_fragment>"
          : "#include <output_fragment>";
        shader.fragmentShader = shader.fragmentShader.replace(
          chunk,
          "float rimK = 1.0 - max(dot(normalize(normal), normalize(vViewPosition)), 0.0);\noutgoingLight += vec3(1.0, 0.92, 0.78) * smoothstep(0.5, 1.0, rimK) * 0.55;\n" +
            chunk,
        );
      };
      m.material = mat;
    });
    scene.updateMatrixWorld(true);
    const size = new Box3().setFromObject(scene).getSize(new Vector3());
    const tails = [2, 3, 4, 5, 6].map((k) => scene.getObjectByName(`Tail${k}`)).filter(Boolean) as Bone[];
    return {
      model: scene,
      scale: LENGTH / Math.max(size.x, size.z),
      bones: { neck: scene.getObjectByName("Neck1") as Bone | undefined, tails },
    };
  }, [gltf]);

  const mixer = useMemo(() => new AnimationMixer(model), [model]);
  const actions = useMemo(() => {
    const clip = (name: string) => gltf.animations.find((a) => a.name === name) ?? gltf.animations[0];
    return {
      idle: mixer.clipAction(clip("Idle")),
      walk: mixer.clipAction(clip("Walk")),
      run: mixer.clipAction(clip("Gallop")),
      jump: mixer.clipAction(clip("Gallop_Jump")),
      sniff: mixer.clipAction(clip("Idle_2_HeadLow")),
    };
  }, [gltf, mixer]);
  // Modelo, animações e ossos ficam numa ref: são objetos do three.js mexidos a cada quadro.
  const rig = useRef({ mixer, actions, bones, current: null as AnimationAction | null });

  useEffect(() => {
    const r = rig.current;
    r.actions.idle.play();
    r.current = r.actions.idle;
    return () => {
      r.mixer.stopAllAction();
    };
  }, []);

  // Pulo de alegria.
  const lastJoy = useRef(joy);
  useEffect(() => {
    if (joy === lastJoy.current) return;
    lastJoy.current = joy;
    state.current.hop = 1;
  }, [joy]);

  useFrame(({ camera }, rawDelta) => {
    const node = root.current;
    if (!node) return;
    const dt = Math.min(rawDelta, 0.05);
    const s = state.current;
    const now = performance.now() / 1000;

    // Para onde ir: o lugar escolhido, ou um passeio curto de vez em quando.
    let goal = target;
    if (!goal && animate) {
      if (!s.wander && now > s.wanderAt) {
        const a = Math.random() * Math.PI * 2;
        const d = 1.5 + Math.random() * 4;
        s.wander = keepOnIsland(Math.cos(a) * d, 1.5 + Math.sin(a) * d);
      }
      goal = s.wander;
    }
    let speed = 0;
    if (goal) {
      const dx = goal[0] - node.position.x;
      const dz = goal[1] - node.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.3) {
        const top = target ? (dist > 6 ? 5.6 : 3.2) : 1.6;
        speed = Math.min(top, dist * 2.5);
        const [nx, nz] = keepOnIsland(
          node.position.x + (dx / dist) * speed * dt,
          node.position.z + (dz / dist) * speed * dt,
        );
        // Se um obstáculo segura ela (ex.: a borda do canteiro), ela já chegou: para de andar.
        const moved = Math.hypot(nx - node.position.x, nz - node.position.z);
        if (dt > 0 && moved < speed * dt * 0.35) speed = 0;
        node.position.x = nx;
        node.position.z = nz;
        if (speed > 0) s.heading = angleLerp(s.heading, Math.atan2(dx, dz), Math.min(1, dt * 10));
      } else if (!target && s.wander) {
        s.wander = null;
        s.wanderAt = now + 6 + Math.random() * 8;
      }
    }
    if (speed === 0 && face)
      s.heading = angleLerp(
        s.heading,
        Math.atan2(face[0] - node.position.x, face[1] - node.position.z),
        Math.min(1, dt * 4),
      );
    // Sem animação (movimento reduzido): ela já aparece parada no lugar.
    if (!animate) {
      if (goal) {
        const [gx, gz] = keepOnIsland(goal[0], goal[1]);
        node.position.set(gx, node.position.y, gz);
      }
      speed = 0;
    }
    s.speed = speed;

    // Pulo.
    s.hop = Math.max(0, s.hop - dt * 2.2);
    const hopY = Math.sin((1 - s.hop) * Math.PI) * 0.5 * (s.hop > 0 ? 1 : 0);
    node.position.y = heightAt(node.position.x, node.position.z) + hopY;
    node.rotation.y = s.heading;
    position.current.copy(node.position);

    // Anel no chão em volta dela quando chega num lugar (como o anel de "interagir" do Bruno).
    const rg = ring.current;
    if (rg) {
      const want = face && speed < 0.5 ? 1 : 0;
      const cur = rg.scale.x;
      const next = animate ? cur + (want - cur) * Math.min(1, dt * (want ? 7 : 10)) : want;
      rg.scale.setScalar(Math.max(0.01, next));
      rg.visible = next > 0.05;
      rg.position.set(node.position.x, heightAt(node.position.x, node.position.z) + 0.06, node.position.z);
      if (arc.current && animate) arc.current.rotation.z += dt * 0.6;
    }

    // Animação: parada, andando, galopando ou pulando.
    const r = rig.current;
    const { actions: a } = r;
    const want = s.hop > 0.2 ? a.jump : speed < 0.4 ? a.idle : speed < 4.6 ? a.walk : a.run;
    if (want !== r.current) {
      want.reset().play();
      r.current?.crossFadeTo(want, 0.3, false);
      r.current = want;
    }
    want.timeScale =
      want === a.walk ? Math.max(0.7, speed / 2.4) : want === a.run ? Math.max(0.8, speed / 5.2) : 1;
    r.mixer.update(animate ? rawDelta : 0);

    // Por cima: rabo abanando e cabeça virando para a câmera quando parada.
    if (animate) {
      const wag = speed < 0.4 ? 0.16 : 0.07;
      r.bones.tails.forEach(
        (b, k) => (b.rotation.z += Math.sin(now * (speed < 0.4 ? 4 : 7) - k * 0.5) * wag),
      );
      let look = 0;
      if (speed < 0.4) {
        const h = s.heading;
        const dx = camera.position.x - node.position.x;
        const dz = camera.position.z - node.position.z;
        look =
          Math.max(
            -0.9,
            Math.min(
              0.9,
              Math.atan2(dx * Math.cos(h) - dz * Math.sin(h), dx * Math.sin(h) + dz * Math.cos(h)),
            ),
          ) * 0.7;
      }
      s.look += (look - s.look) * Math.min(1, dt * 3);
      if (r.bones.neck) r.bones.neck.rotation.z += s.look;
    }
  });

  return (
    <>
      <group ref={ring} visible={false} scale={0.01}>
        {[
          [1.3, 1.37, 72],
          [0.66, 0.71, 48],
        ].map(([inner, outer, seg]) => (
          <mesh key={inner} rotation-x={-Math.PI / 2} renderOrder={3}>
            <ringGeometry args={[inner, outer, seg]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.9} depthWrite={false} />
          </mesh>
        ))}
        <mesh ref={arc} rotation-x={-Math.PI / 2} renderOrder={3}>
          <ringGeometry args={[0.71, 1.3, 40, 1, 0, 1.05]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.32} depthWrite={false} />
        </mesh>
      </group>
      <group
        ref={root}
        position={[0, heightAt(0, 2), 2]}
        onClick={(event) => {
          event.stopPropagation();
          if (event.delta > 8) return;
          state.current.hop = 1;
          onPet();
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <primitive object={model} scale={scale} />
        <mesh rotation-x={-Math.PI / 2} position-y={0.03}>
          <circleGeometry args={[0.75, 20]} />
          <meshBasicMaterial color="#2a1c18" transparent opacity={0.28} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
}
