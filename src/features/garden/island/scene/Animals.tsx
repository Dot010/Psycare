"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import {
  BoxGeometry,
  ConeGeometry,
  DoubleSide,
  Float32BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry,
  type Vector3,
} from "three";
import { heightAt, keepOnIsland } from "@/features/garden/island/places";
import { toon } from "@/features/garden/island/scene/builders";

/** Pássaros em V voando alto, em círculos (de dia). */
function makeBirds(): Group[] {
  const wing = new BufferGeometry();
  wing.setAttribute("position", new Float32BufferAttribute([0, 0, 0.12, 0, 0, -0.12, 0.6, 0, 0], 3));
  const material = new MeshBasicMaterial({ color: 0x3a2a24, side: DoubleSide });
  return [0, 1, 2].map(() => {
    const g = new Group();
    const right = new Mesh(wing, material);
    const left = new Mesh(wing, material);
    left.scale.x = -1;
    g.add(right, left);
    return g;
  });
}

/** Peixinho laranja (pula no mar) e o anel de respingo. */
function makeFish(): { fish: Group; ring: Mesh<RingGeometry, MeshBasicMaterial> } {
  const fish = new Group();
  const m = toon(0xf4a261);
  const body = new Mesh(new SphereGeometry(0.16, 6, 5), m);
  body.scale.set(0.6, 0.8, 1.6);
  const tail = new Mesh(new ConeGeometry(0.14, 0.2, 4), m);
  tail.rotation.x = -Math.PI / 2;
  tail.position.z = -0.32;
  tail.scale.x = 0.3;
  fish.add(body, tail);
  fish.visible = false;
  const ring = new Mesh(
    new RingGeometry(0.2, 0.28, 20),
    new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.visible = false;
  return { fish, ring };
}

/** Coelhinho: corpo, cabeça, orelhas com o rosa por dentro, rabinho e olhos. */
function makeBunny(): Group {
  const g = new Group();
  const fur = toon(0xc9b6a0);
  const body = new Mesh(new SphereGeometry(0.26, 8, 6), fur);
  body.scale.set(0.9, 0.85, 1.2);
  body.position.y = 0.26;
  const head = new Mesh(new SphereGeometry(0.17, 8, 6), fur);
  head.position.set(0, 0.48, 0.24);
  [-0.07, 0.07].forEach((x) => {
    const ear = new Mesh(new BoxGeometry(0.06, 0.28, 0.04), fur);
    ear.position.set(x, 0.72, 0.2);
    ear.rotation.z = x * 2;
    const inner = new Mesh(new BoxGeometry(0.03, 0.2, 0.01), toon(0xf2b5c4));
    inner.position.set(x, 0.72, 0.225);
    inner.rotation.z = x * 2;
    g.add(ear, inner);
  });
  const tail = new Mesh(new SphereGeometry(0.08, 6, 5), toon(0xfdfcf9));
  tail.position.set(0, 0.3, -0.3);
  const eye = new Mesh(new SphereGeometry(0.025, 5, 4), toon(0x2a1c18));
  eye.position.set(0.09, 0.52, 0.36);
  const eye2 = eye.clone();
  eye2.position.x = -0.09;
  g.add(body, head, tail, eye, eye2);
  g.traverse((o) => ((o as Mesh).castShadow = true));
  return g;
}

/**
 * Bichos da ilha: pássaros lá no alto, um peixinho que pula no mar de vez em quando
 * e um coelho que passeia e foge da raposa. À noite, os pássaros e o coelho vão dormir.
 */
export function Animals({
  night,
  animate,
  fox,
}: {
  night: boolean;
  animate: boolean;
  fox: MutableRefObject<Vector3>;
}) {
  const parts = useMemo(() => ({ birds: makeBirds(), ...makeFish(), bunny: makeBunny() }), []);
  const live = useRef({
    parts,
    fishWait: 5,
    jump: -1,
    jumpAt: { x: 0, z: 0, dir: 0 },
    bun: { x: -6, z: 4, tx: -6, tz: 4, hop: 0, wait: 2, heading: 0, flee: false },
  });
  useLayoutEffect(() => {
    live.current.parts = parts;
  }, [parts]);

  useFrame(({ clock }, rawDelta) => {
    const s = live.current;
    const { birds, fish, ring, bunny } = s.parts;
    const dt = animate ? Math.min(rawDelta, 0.05) : 0;
    const t = clock.elapsedTime;

    // Pássaros.
    birds.forEach((b, i) => {
      b.visible = !night;
      const a = t * (0.12 + i * 0.02) + i * 2.1;
      const r = 14 + i * 4;
      b.position.set(Math.cos(a) * r, 11 + i * 1.5 + Math.sin(t * 0.7 + i) * 0.4, Math.sin(a) * r);
      b.rotation.y = -a;
      const flap = animate ? Math.sin(t * 6 + i) * 0.5 : 0.2;
      b.children[0].rotation.z = flap;
      b.children[1].rotation.z = -flap;
    });

    // Peixinho: espera, pula num arco e cai com respingo.
    if (animate) {
      if (s.jump < 0) {
        s.fishWait -= dt;
        if (s.fishWait <= 0) {
          const a = Math.random() * Math.PI * 2;
          const d = 15 + Math.random() * 8;
          s.jumpAt = { x: Math.cos(a) * d, z: Math.sin(a) * d, dir: Math.random() * Math.PI * 2 };
          s.jump = 0;
        }
      } else {
        s.jump = Math.min(1, s.jump + dt / 1.1);
        const { x, z, dir } = s.jumpAt;
        const k = s.jump;
        fish.visible = true;
        fish.position.set(
          x + Math.sin(dir) * k * 1.6,
          Math.sin(k * Math.PI) * 1.2,
          z + Math.cos(dir) * k * 1.6,
        );
        fish.rotation.set(-0.9 + k * 1.8, dir, 0);
        // Respingo na saída e na volta.
        const near = k < 0.25 ? k / 0.25 : k > 0.75 ? (k - 0.75) / 0.25 : -1;
        ring.visible = near >= 0;
        if (near >= 0) {
          ring.position.set(k < 0.5 ? x : fish.position.x, 0.3, k < 0.5 ? z : fish.position.z);
          ring.scale.setScalar(1 + near * 3);
          ring.material.opacity = 0.8 * (1 - near);
        }
        if (k >= 1) {
          s.jump = -1;
          s.fishWait = 5 + Math.random() * 9;
          fish.visible = false;
          ring.visible = false;
        }
      }
    }

    // Coelho: pulinhos até um ponto, para, olha em volta; se a raposa chega perto, foge.
    bunny.visible = !night;
    const b = s.bun;
    const f = fox.current;
    if (animate && Math.hypot(f.x - b.x, f.z - b.z) < 3 && !b.flee) {
      const ax = b.x - f.x;
      const az = b.z - f.z;
      const len = Math.hypot(ax, az) || 1;
      [b.tx, b.tz] = keepOnIsland(b.x + (ax / len) * 4.5, b.z + (az / len) * 4.5, 0.4);
      b.flee = true;
      b.wait = 0;
    }
    b.wait -= dt;
    const dx = b.tx - b.x;
    const dz = b.tz - b.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 0.05 && b.wait <= 0) {
      const speed = b.flee ? 3.2 : 1.1;
      const step = Math.min(dist, speed * dt);
      [b.x, b.z] = keepOnIsland(b.x + (dx / dist) * step, b.z + (dz / dist) * step, 0.4);
      b.heading = Math.atan2(dx, dz);
      b.hop += dt * (b.flee ? 9 : 6);
    } else if (b.wait <= 0) {
      b.flee = false;
      b.wait = 2 + Math.random() * 4;
      const a = Math.random() * Math.PI * 2;
      [b.tx, b.tz] = keepOnIsland(b.x + Math.cos(a) * 2.5, b.z + Math.sin(a) * 2.5, 0.4);
      b.hop = 0;
    }
    bunny.position.set(b.x, heightAt(b.x, b.z) + Math.abs(Math.sin(b.hop)) * 0.18, b.z);
    bunny.rotation.y = b.heading;
  });

  return (
    <>
      {parts.birds.map((b, i) => (
        <primitive key={i} object={b} />
      ))}
      <primitive object={parts.fish} />
      <primitive object={parts.ring} />
      <primitive object={parts.bunny} />
    </>
  );
}
