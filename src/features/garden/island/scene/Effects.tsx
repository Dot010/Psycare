"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type Points,
} from "three";
import { heightAt, type Season } from "@/features/garden/island/places";
import { rng } from "@/features/garden/island/scene/builders";

/** Brilho redondo (vagalumes). */
function glowTexture(): CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,.55)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new CanvasTexture(c);
}

const FLIES = 50;
const LEAVES = 14;
const PUFFS = 8;
// Chaminé da cabana, já no mundo (cabana em -4, -2, girada 0,3).
const CHIMNEY: [number, number, number] = [-4.96, heightAt(-4, -2) + 3.75, -2.23];

/**
 * Vida pequena na ilha: vagalumes à noite, borboletas de dia, folhinhas caindo (laranja no outono)
 * e fumaça saindo da chaminé. Tudo reaproveita os mesmos objetos (nada é criado a cada quadro).
 */
export function Effects({
  night,
  animate,
  season,
  cabinOpen,
}: {
  night: boolean;
  animate: boolean;
  season: Season;
  cabinOpen: boolean;
}) {
  const flies = useRef<Points>(null);
  const butterflies = useRef<Group>(null);
  const leaves = useRef<Group>(null);
  const smoke = useRef<Group>(null);

  const fly = useMemo(() => {
    const r = rng(7);
    const base = new Float32Array(FLIES * 3);
    for (let i = 0; i < FLIES; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 9.5;
      base.set(
        [Math.cos(a) * d, heightAt(Math.cos(a) * d, Math.sin(a) * d) + 0.5 + r() * 2, Math.sin(a) * d],
        i * 3,
      );
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(base.slice(), 3));
    return { base, geo, map: glowTexture() };
  }, []);

  const leafColors = useMemo(
    () =>
      (season === "outono"
        ? [0xe08a3a, 0xd9b44a, 0xc8642f]
        : season === "primavera"
          ? [0xf8c8d6, 0x7db35a, 0xfdfcf9]
          : [0x7db35a, 0xa3bc5a, 0xd9b44a]
      ).map((c) => new Color(c)),
    [season],
  );
  const state = useRef({
    leaf: Array.from({ length: LEAVES }, (_, i) => ({ t: -i * 0.9, x: 0, z: 0, top: 0, spin: 0 })),
    puff: Array.from({ length: PUFFS }, (_, i) => -i * 0.7),
  });

  useFrame(({ clock }, rawDelta) => {
    if (!animate) return;
    const t = clock.elapsedTime;
    const dt = Math.min(rawDelta, 0.05);

    // Vagalumes: só à noite, flutuando devagar.
    const fp = flies.current;
    if (fp) {
      fp.visible = night;
      if (night) {
        const arr = fp.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < FLIES; i++) {
          arr[i * 3] = fly.base[i * 3] + Math.cos(t * 0.6 + i) * 0.3;
          arr[i * 3 + 1] = fly.base[i * 3 + 1] + Math.sin(t * 1.3 + i) * 0.3;
        }
        fp.geometry.attributes.position.needsUpdate = true;
      }
    }

    // Borboletas: de dia, rodando em volta dos canteiros e batendo as asas.
    const bf = butterflies.current;
    if (bf) {
      bf.visible = !night;
      bf.children.forEach((b, i) => {
        const a = t * 0.5 + i * 1.7;
        const r = 1.6 + i * 0.5;
        b.position.set(4.5 + Math.cos(a) * r, 2.7 + Math.sin(t * 1.7 + i) * 0.3, 3 + Math.sin(a) * r);
        b.rotation.y = -a;
        const flap = Math.sin(t * 16 + i) * 0.9;
        b.children[0].rotation.y = flap;
        b.children[1].rotation.y = -flap;
      });
    }

    // Folhinhas caindo e girando (nada no inverno).
    const lg = leaves.current;
    if (lg) {
      lg.visible = !night && season !== "inverno";
      const s = state.current;
      lg.children.forEach((child, i) => {
        const m = child as Mesh;
        const L = s.leaf[i];
        L.t += dt / (season === "outono" ? 3 : 5);
        if (L.t >= 1 || L.t < 0) {
          if (L.t >= 1) L.t = 0;
          const r = 4.5 + ((i * 37) % 60) / 10;
          const a = Math.random() * Math.PI * 2;
          L.x = Math.cos(a) * r;
          L.z = Math.sin(a) * r;
          L.top = heightAt(L.x, L.z) + 3 + Math.random();
          (m.material as MeshBasicMaterial).color.copy(leafColors[i % leafColors.length]);
        }
        const k = Math.max(0, L.t);
        m.visible = L.t >= 0;
        m.position.set(
          L.x + k * 1.2,
          L.top - k * (L.top - heightAt(L.x, L.z) - 0.05),
          L.z + Math.sin(k * 9) * 0.3,
        );
        m.rotation.set(k * 8, k * 6 + i, k * 4);
      });
    }

    // Fumaça: bolinhas que sobem da chaminé, crescem e somem (some quando o telhado sobe).
    const sm = smoke.current;
    if (sm) {
      sm.visible = !cabinOpen;
      const s = state.current;
      sm.children.forEach((child, i) => {
        s.puff[i] += dt / 4;
        if (s.puff[i] >= 1) s.puff[i] = 0;
        const k = Math.max(0, s.puff[i]);
        const m = child as Mesh;
        m.visible = s.puff[i] >= 0;
        m.position.set(CHIMNEY[0] + k * 1.0, CHIMNEY[1] + k * 2.4, CHIMNEY[2] - k * 0.4);
        m.scale.setScalar(0.5 + k * 2.5);
        (m.material as MeshBasicMaterial).opacity = 0.75 * (1 - k);
      });
    }
  });

  return (
    <>
      <points ref={flies} geometry={fly.geo} visible={false}>
        <pointsMaterial
          color="#ffe38a"
          map={fly.map}
          size={0.55}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
      <group ref={butterflies}>
        {[0xead96b, 0xfdfcf9, 0xe9a97a].map((c) => (
          <group key={c}>
            {[1, -1].map((side) => (
              // Cada asa gira presa no corpo (o grupo é a "dobradiça").
              <group key={side} scale-x={side}>
                <mesh rotation-x={-Math.PI / 2} position-x={0.1}>
                  <planeGeometry args={[0.2, 0.15]} />
                  <meshBasicMaterial color={c} side={DoubleSide} />
                </mesh>
              </group>
            ))}
          </group>
        ))}
      </group>
      <group ref={leaves}>
        {Array.from({ length: LEAVES }, (_, i) => (
          <mesh key={i} visible={false}>
            <planeGeometry args={[0.12, 0.08]} />
            <meshBasicMaterial color="#7db35a" side={DoubleSide} />
          </mesh>
        ))}
      </group>
      <group ref={smoke}>
        {Array.from({ length: PUFFS }, (_, i) => (
          <mesh key={i} visible={false}>
            <icosahedronGeometry args={[0.16, 0]} />
            <meshBasicMaterial color="#ede8e2" transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </>
  );
}
