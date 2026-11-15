"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  IcosahedronGeometry,
  Matrix4,
  Quaternion,
  Vector3,
  type InstancedMesh,
  type MeshToonMaterial,
} from "three";
import { grassPatch, heightAt, OBSTACLES, SAND_EDGE } from "@/features/garden/island/places";
import { rng, toon } from "@/features/garden/island/scene/builders";
import type { Season } from "@/features/garden/island/places";

const BLADE_H = 0.34;
const FLOWERS = 220;

type SwayUniforms = { uTime: { value: number }; uFox: { value: Vector3 }; uWind: { value: number } };

/**
 * Material que balança: vento em ondas que atravessam a ilha (com brilho nas pontas quando a onda passa)
 * e a raposa abrindo caminho.
 */
function swayMaterial(uniforms: SwayUniforms, height: number, blade: boolean) {
  const m = toon(0xffffff);
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader =
      "uniform float uTime;\nuniform vec3 uFox;\nuniform float uWind;\nvarying float vH;\nvarying float vShine;\n" +
      shader.vertexShader.replace(
        "#include <project_vertex>",
        `vec4 mvPosition = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
          vec3 root = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        #else
          vec3 root = vec3(0.0);
        #endif
        float hh = clamp(position.y / ${height.toFixed(2)}, 0.0, 1.0);
        vH = hh; hh *= hh;
        float wave = sin(dot(root.xz, vec2(0.55, 0.32)) - uTime * 1.9);
        float gust = sin(dot(root.xz, vec2(-0.12, 0.2)) - uTime * 0.45) * 0.5 + 0.5;
        float wind = (wave * (0.06 + 0.1 * gust) + sin(uTime * 3.1 + root.x * 1.7 + root.z) * 0.02) * uWind;
        vShine = max(0.0, wave) * gust * uWind;
        vec2 away = root.xz - uFox.xz;
        float dist = length(away);
        float push = smoothstep(1.15, 0.15, dist) * ${(height * 1.1).toFixed(2)};
        vec2 dir = dist > 0.001 ? away / dist : vec2(0.0);
        mvPosition.x += (wind * 0.8 + dir.x * push) * hh;
        mvPosition.z += (wind * 0.5 + dir.y * push) * hh;
        mvPosition.y -= push * hh * 0.7;
        mvPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;`,
      );
    shader.fragmentShader =
      "varying float vH;\nvarying float vShine;\n" +
      shader.fragmentShader.replace(
        "vec4 diffuseColor = vec4( diffuse, opacity );",
        blade
          ? "vec4 diffuseColor = vec4( diffuse * mix(0.62, 1.18, vH) + vec3(0.05, 0.045, -0.02) * vH * vH + vec3(0.1, 0.1, 0.035) * vShine * vH * vH, opacity );"
          : "vec4 diffuseColor = vec4( diffuse, opacity );",
      );
  };
  return m;
}

/** Grama densa: balança em ondas de vento e se abre quando a raposa passa. */
export function IslandGrass({
  count,
  fox,
  animate,
  season,
}: {
  count: number;
  fox: MutableRefObject<Vector3>;
  animate: boolean;
  season: Season;
}) {
  const ref = useRef<InstancedMesh>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uFox: { value: new Vector3() }, uWind: { value: 1 } }),
    [],
  );
  const live = useRef(uniforms);

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const pts: number[] = [];
    [
      [0, 0.042],
      [0.36, 0.034],
      [0.7, 0.02],
    ].forEach(([t, w]) => {
      const bend = 0.07 * t * t;
      pts.push(-w, BLADE_H * t, bend, w, BLADE_H * t, bend);
    });
    pts.push(0, BLADE_H, 0.075);
    g.setAttribute("position", new Float32BufferAttribute(pts, 3));
    g.setAttribute(
      "normal",
      new Float32BufferAttribute(Array.from({ length: 7 }, () => [0, 1, 0]).flat(), 3),
    );
    g.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 4, 5, 6]);
    return g;
  }, []);

  const material = useMemo(() => swayMaterial(uniforms, BLADE_H, true), [uniforms]);
  const flowerMaterial = useMemo(() => swayMaterial(uniforms, 0.18, false), [uniforms]);
  const flowerGeometry = useMemo(() => {
    const g = new IcosahedronGeometry(0.2, 0);
    g.scale(1, 0.6, 1);
    g.translate(0, 0.06, 0);
    return g;
  }, []);
  const flowers = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const r = rng(99);
    const m4 = new Matrix4();
    const q = new Quaternion();
    const up = new Vector3(0, 1, 0);
    const p = new Vector3();
    const s = new Vector3();
    const c = new Color();
    const dark = new Color(0x5e7e38);
    const mid = new Color(0x86a048);
    const light = new Color(0xc2b85a);
    let placed = 0;
    let cx = 0;
    let cz = 0;
    let left = 0;
    for (let tries = 0; placed < count && tries < count * 3; tries++) {
      if (left <= 0) {
        const a = r() * Math.PI * 2;
        const d = Math.sqrt(r()) * 11.5;
        cx = Math.cos(a) * d;
        cz = Math.sin(a) * d;
        left = 8 + Math.floor(r() * 10);
      }
      left--;
      const x = cx + (r() - 0.5) * 0.5;
      const z = cz + (r() - 0.5) * 0.5;
      if (Math.hypot(x, z) > 11.6 || OBSTACLES.some((o) => Math.hypot(x - o.x, z - o.z) < o.r - 0.2))
        continue;
      // Grama só nas manchas; entre elas ficam os caminhos de areia (pintados no chão).
      const pv = grassPatch(x, z);
      if (pv < SAND_EDGE) continue;
      const edge = Math.min(1, 0.35 + (pv - SAND_EDGE) * 2.2);
      const k = (0.75 + r() * 0.6) * (1 + pv * 0.25) * (Math.hypot(x, z) > 10.4 ? 0.7 : 1) * edge * 1.1;
      p.set(x, heightAt(x, z) - 0.03, z);
      q.setFromAxisAngle(up, r() * Math.PI * 2);
      s.set(k, k * (0.75 + r() * 0.7), k);
      mesh.setMatrixAt(placed, m4.compose(p, q, s));
      c.copy(pv > 0 ? mid.clone().lerp(light, pv * 0.9) : mid.clone().lerp(dark, -pv * 0.9));
      mesh.setColorAt(placed, c);
      placed++;
    }
    mesh.count = placed;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // Florzinhas no meio da grama (amarelas, rosas e brancas).
    const fm = flowers.current;
    if (!fm) return;
    const colors = [0xf7e9a8, 0xf7e9a8, 0xf2b5c4, 0xfdfcf9];
    let fp = 0;
    for (let tries = 0; fp < FLOWERS && tries < FLOWERS * 4; tries++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * 11;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      if (OBSTACLES.some((o) => Math.hypot(x - o.x, z - o.z) < o.r + 0.2) || grassPatch(x, z) < SAND_EDGE)
        continue;
      const col = colors[Math.floor(r() * colors.length)];
      const k = 0.32 + r() * 0.15;
      p.set(x, heightAt(x, z) + 0.12, z);
      q.setFromAxisAngle(up, r() * Math.PI);
      s.set(k, k * 0.9, k);
      fm.setMatrixAt(fp, m4.compose(p, q, s));
      fm.setColorAt(fp, c.setHex(col));
      fp++;
    }
    fm.count = fp;
    fm.instanceMatrix.needsUpdate = true;
    if (fm.instanceColor) fm.instanceColor.needsUpdate = true;
  }, [count]);

  // Outono amarela a grama; inverno esfria. O balanço vem do shader.
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (mesh && !Array.isArray(mesh.material))
      (mesh.material as MeshToonMaterial).color.set(
        season === "outono" ? 0xf2e2b8 : season === "inverno" ? 0xdce4dc : 0xffffff,
      );
  }, [season]);

  useFrame(({ clock }) => {
    const u = live.current;
    u.uTime.value = clock.elapsedTime;
    u.uWind.value = animate ? 1 : 0;
    u.uFox.value.copy(fox.current);
  });

  return (
    <>
      <instancedMesh ref={ref} args={[geometry, material, count]} receiveShadow frustumCulled={false} />
      <instancedMesh
        ref={flowers}
        args={[flowerGeometry, flowerMaterial, FLOWERS]}
        receiveShadow
        castShadow
        frustumCulled={false}
      />
    </>
  );
}
