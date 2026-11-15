"use client";

import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  Color,
  DodecahedronGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry,
} from "three";
import { heightAt, placeById, type PlaceId } from "@/features/garden/island/places";
import { rng, toon } from "@/features/garden/island/scene/builders";

const STONE_COLORS = [0x9c948a, 0xb9b0a4, 0x8a8278, 0xc9c0b2];

/**
 * A Praia (pedra da preocupação): um montinho de pedras na beira da ilha.
 * Quando a pessoa joga uma pedra no mar, ela sai em arco e cai com respingo.
 */
export function Beach({
  onSelect,
  throwId,
  animate,
}: {
  onSelect: (id: PlaceId) => void;
  /** Muda de número a cada pedra jogada. */
  throwId: number;
  animate: boolean;
}) {
  const place = placeById("praia");
  const base = heightAt(place.x, place.z);

  const parts = useMemo(() => {
    const r = rng(55);
    const pile = new Group();
    for (let i = 0; i < 7; i++) {
      const stone = new Mesh(
        new DodecahedronGeometry(0.14 + r() * 0.12, 0),
        toon(STONE_COLORS[i % STONE_COLORS.length]),
      );
      const a = r() * Math.PI * 2;
      const d = r() * 0.45;
      stone.position.set(Math.cos(a) * d, 0.1 + (i > 4 ? 0.18 : 0), Math.sin(a) * d);
      stone.scale.y = 0.7;
      stone.castShadow = true;
      pile.add(stone);
    }
    const flying = new Mesh(new DodecahedronGeometry(0.16, 0), toon(0x9c948a));
    flying.visible = false;
    const ring = new Mesh(
      new RingGeometry(0.2, 0.3, 20),
      new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.visible = false;
    return { pile, flying, ring };
  }, []);

  const live = useRef({ parts, t: -1, last: throwId });
  useLayoutEffect(() => {
    live.current.parts = parts;
  }, [parts]);

  useFrame((_, rawDelta) => {
    const s = live.current;
    if (throwId !== s.last) {
      s.last = throwId;
      s.t = 0;
    }
    const { flying, ring } = s.parts;
    if (s.t < 0) return;
    s.t += animate ? Math.min(rawDelta, 0.05) : 1;
    const k = Math.min(1, s.t / 1.2);
    // Da praia até o mar, em arco.
    const from = { x: place.x, z: place.z };
    const to = { x: place.x + 4.2, z: place.z - 1.2 };
    if (k < 1) {
      flying.visible = true;
      flying.position.set(
        from.x + (to.x - from.x) * k,
        base + 0.4 + Math.sin(k * Math.PI) * 2.2 - k * (base + 0.2),
        from.z + (to.z - from.z) * k,
      );
      flying.rotation.set(k * 9, k * 6, 0);
    } else {
      flying.visible = false;
      const splash = Math.min(1, (s.t - 1.2) / 0.9);
      ring.visible = splash < 1;
      ring.position.set(to.x, 0.32, to.z);
      ring.scale.setScalar(1 + splash * 4);
      (ring.material as MeshBasicMaterial).opacity = 0.85 * (1 - splash);
      if (splash >= 1) s.t = -1;
    }
  });

  return (
    <>
      <group
        position={[place.x, base, place.z]}
        onClick={(event: ThreeEvent<MouseEvent>) => {
          event.stopPropagation();
          if (event.delta > 8) return;
          onSelect("praia");
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <primitive object={parts.pile} />
      </group>
      <primitive object={parts.flying} />
      <primitive object={parts.ring} />
    </>
  );
}

/**
 * Lanternas da gratidão: uma para cada "coisa boa" escrita na Cabana (até 24).
 * Ficam paradas lá no alto, balançando de leve, e acendem à noite.
 */
export function GratitudeLanterns({
  count,
  night,
  animate,
}: {
  count: number;
  night: boolean;
  animate: boolean;
}) {
  const n = Math.min(24, count);
  const parts = useMemo(() => {
    const r = rng(808);
    const group = new Group();
    const glow = new MeshBasicMaterial({
      color: new Color(0xffc56b),
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const body = new SphereGeometry(0.18, 10, 8);
    for (let i = 0; i < 24; i++) {
      const lantern = new Mesh(body, glow);
      const a = r() * Math.PI * 2;
      const d = 2 + r() * 8;
      lantern.position.set(Math.cos(a) * d, 8 + r() * 5, Math.sin(a) * d);
      lantern.scale.set(1, 1.3, 1);
      lantern.userData.phase = r() * Math.PI * 2;
      group.add(lantern);
    }
    return { group, glow };
  }, []);
  const live = useRef(parts);
  useLayoutEffect(() => {
    live.current = parts;
  }, [parts]);

  useFrame(({ clock }) => {
    const { group, glow } = live.current;
    group.visible = night && n > 0;
    if (!group.visible) return;
    glow.opacity = 0.85;
    group.children.forEach((lantern, i) => {
      lantern.visible = i < n;
      if (animate) lantern.position.y += Math.sin(clock.elapsedTime * 0.6 + lantern.userData.phase) * 0.002;
    });
  });

  return <primitive object={parts.group} />;
}

/** Um brilho que sobe e desce em cima do lugar que tem novidade. */
export function Highlights({ places, animate }: { places: PlaceId[]; animate: boolean }) {
  const parts = useMemo(() => {
    const geometry = new SphereGeometry(0.22, 12, 10);
    const material = new MeshBasicMaterial({
      color: 0xfff0a8,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    return { geometry, material };
  }, []);
  const group = useRef<Group>(null);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g || !animate) return;
    g.children.forEach((child, i) => {
      child.position.y = child.userData.baseY + Math.sin(clock.elapsedTime * 2 + i) * 0.25;
      child.scale.setScalar(1 + Math.sin(clock.elapsedTime * 3 + i) * 0.15);
    });
  });

  return (
    <group ref={group}>
      {places.map((id) => {
        const place = placeById(id);
        const y = heightAt(place.x, place.z) + (id === "farol" ? 7.5 : id === "cabana" ? 5 : 2.8);
        return (
          <mesh
            key={id}
            geometry={parts.geometry}
            material={parts.material}
            position={[place.x, y, place.z]}
            userData={{ baseY: y }}
          />
        );
      })}
    </group>
  );
}
