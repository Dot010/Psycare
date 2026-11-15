"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  Fog,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  TorusGeometry,
} from "three";
import { heightAt, OBSTACLES } from "@/features/garden/island/places";
import { rng } from "@/features/garden/island/scene/builders";

const AREA = 34;
const RAINBOW = [0xe85d6a, 0xf4a261, 0xead96b, 0x7db35a, 0x6fb0c8, 0x9c7bc8];
const GREY = new Color(0x8e9aa6);

/**
 * Chuvinha de vez em quando: gotas caindo, céu e névoa mais cinzas, poças no chão
 * e, se for de dia, um arco-íris quando a chuva passa.
 */
export function Weather({
  raining,
  night,
  animate,
  sky,
  haze,
  drops,
}: {
  raining: boolean;
  night: boolean;
  animate: boolean;
  /** Cor do céu e da névoa sem chuva (a chuva puxa para o cinza a partir delas). */
  sky: string;
  haze: string;
  drops: number;
}) {
  const scene = useThree((state) => state.scene);

  const parts = useMemo(() => {
    const r = rng(33);
    const pos = new Float32Array(drops * 6);
    for (let i = 0; i < drops; i++) {
      const x = (r() - 0.5) * AREA;
      const y = r() * 18;
      const z = (r() - 0.5) * AREA;
      pos.set([x, y, z, x + 0.05, y - 0.45, z], i * 6);
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(pos, 3));
    const rain = new LineSegments(
      geo,
      new LineBasicMaterial({ color: 0xd6e6f0, transparent: true, opacity: 0, depthWrite: false }),
    );
    rain.visible = false;
    rain.frustumCulled = false;

    const puddles = new Group();
    for (let k = 0, tries = 0; k < 7 && tries < 80; tries++) {
      const a = r() * Math.PI * 2;
      const d = 2 + r() * 7.5;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      if (OBSTACLES.some((o) => Math.hypot(x - o.x, z - o.z) < o.r + 0.9)) continue;
      const puddle = new Mesh(
        new CircleGeometry(0.5 + r() * 0.5, 18),
        new MeshBasicMaterial({ color: 0x8fb4c8, transparent: true, opacity: 0, depthWrite: false }),
      );
      puddle.rotation.x = -Math.PI / 2;
      puddle.scale.set(1, 0.7, 1);
      puddle.position.set(x, heightAt(x, z) + 0.06, z);
      puddle.renderOrder = 2;
      puddles.add(puddle);
      k++;
    }

    const rainbow = new Group();
    RAINBOW.forEach((c, k) =>
      rainbow.add(
        new Mesh(
          new TorusGeometry(30 - k * 0.9, 0.45, 6, 60, Math.PI),
          new MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, fog: false }),
        ),
      ),
    );
    rainbow.position.set(-18, -6, -55);
    rainbow.rotation.y = 0.35;
    rainbow.visible = false;
    return { rain, pos, puddles, rainbow };
  }, [drops]);

  const live = useRef({ parts, level: 0, wet: 0, rainbowT: -1, wasRaining: raining });
  useLayoutEffect(() => {
    live.current.parts = parts;
  }, [parts]);
  const base = useMemo(() => ({ sky: new Color(sky), haze: new Color(haze) }), [sky, haze]);

  useFrame((_, rawDelta) => {
    const s = live.current;
    const { rain, pos, puddles, rainbow } = s.parts;
    const dt = Math.min(rawDelta, 0.05);
    // Entra devagar (4 s) e sai mais devagar ainda (5 s). Sem animação, troca na hora.
    const goal = raining ? 1 : 0;
    s.level = animate ? s.level + (goal - s.level) * Math.min(1, dt * 0.6) : goal;
    s.wet = animate ? s.wet + ((raining ? 1 : 0) - s.wet) * Math.min(1, dt * (raining ? 0.15 : 0.03)) : goal;

    // Arco-íris depois da chuva, só de dia.
    if (s.wasRaining && !raining && !night) s.rainbowT = 0;
    s.wasRaining = raining;
    if (s.rainbowT >= 0) {
      s.rainbowT += dt;
      const t = s.rainbowT;
      const k = t < 4 ? 0 : t < 8 ? (t - 4) / 4 : t < 30 ? 1 : Math.max(0, 1 - (t - 30) / 6);
      rainbow.visible = k > 0;
      rainbow.children.forEach(
        (band) => ((band as Mesh<TorusGeometry, MeshBasicMaterial>).material.opacity = k * 0.5),
      );
      if (t > 36 || raining) s.rainbowT = -1;
    } else rainbow.visible = false;

    puddles.children.forEach(
      (p) => ((p as Mesh<CircleGeometry, MeshBasicMaterial>).material.opacity = s.wet * 0.55),
    );

    // Céu e névoa puxam para o cinza.
    if (scene.background instanceof Color) scene.background.copy(base.sky).lerp(GREY, s.level * 0.45);
    if (scene.fog instanceof Fog) scene.fog.color.copy(base.haze).lerp(GREY, s.level * 0.45);

    rain.visible = s.level > 0.01;
    if (!rain.visible) return;
    (rain.material as LineBasicMaterial).opacity = s.level * 0.55;
    if (!animate) return;
    const fall = dt * 16;
    for (let i = 0; i < pos.length / 6; i++) {
      const o = i * 6;
      pos[o + 1] -= fall;
      pos[o + 4] -= fall;
      if (pos[o + 4] < 0) {
        const x = (Math.random() - 0.5) * AREA;
        const z = (Math.random() - 0.5) * AREA;
        const y = 16 + Math.random() * 3;
        pos[o] = x;
        pos[o + 1] = y;
        pos[o + 2] = z;
        pos[o + 3] = x + 0.05;
        pos[o + 4] = y - 0.45;
        pos[o + 5] = z;
      }
    }
    rain.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <primitive object={parts.rain} />
      <primitive object={parts.puddles} />
      <primitive object={parts.rainbow} />
    </>
  );
}
