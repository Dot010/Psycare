import {
  CanvasTexture,
  Color,
  DoubleSide,
  Euler,
  InstancedMesh,
  Matrix4,
  NearestFilter,
  PlaneGeometry,
  Quaternion,
  Vector3,
  type Group,
  type Mesh,
  type MeshToonMaterial,
} from "three";
import { heightAt, OBSTACLES, type Season } from "@/features/garden/island/places";
import { rng, seasonLeaf, toon } from "@/features/garden/island/scene/builders";

/**
 * Visual do portfólio do Bruno Simon: copas feitas de centenas de folhinhas recortadas
 * (ficam "fofas") e folhas caídas pelo chão.
 */

let leafMap: CanvasTexture | null = null;
/** Formato de folha desenhado num canvas (branco; a cor vem de cada folhinha). */
function leafTexture(): CanvasTexture | null {
  if (leafMap || typeof document === "undefined") return leafMap;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  if (!g) return null;
  g.fillStyle = "#fff";
  g.beginPath();
  g.moveTo(32, 4);
  g.quadraticCurveTo(58, 22, 50, 46);
  g.quadraticCurveTo(40, 62, 32, 60);
  g.quadraticCurveTo(24, 62, 14, 46);
  g.quadraticCurveTo(6, 22, 32, 4);
  g.fill();
  leafMap = new CanvasTexture(c);
  leafMap.magFilter = NearestFilter;
  return leafMap;
}

/** Placa com a normal para cima: a luz da folha é a do chão (sem pontos escuros aleatórios). */
function upPlane(w: number, h: number, flat = false): PlaneGeometry {
  const geo = new PlaneGeometry(w, h);
  if (flat) geo.rotateX(-Math.PI / 2);
  const n = geo.attributes.normal;
  for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0);
  return geo;
}

const FRUIT = 0xd0443a;

export interface Foliage {
  mesh: InstancedMesh;
  /** Pinta as folhinhas com a cor da estação. */
  recolor: (season: Season) => void;
  /** Centros das copas no mundo (para espalhar as folhas caídas). */
  centers: { x: number; z: number }[];
}

/**
 * Troca as bolas/cones da copa por folhinhas na casca de cada uma.
 * A malha nova fica dentro de `crown`, então balança junto com a árvore.
 */
export function makeFoliage(crown: Group, leaves: Mesh[], seed: number, density: number): Foliage {
  const r = rng(seed);
  const clusters = leaves
    .filter((m) => (m.material as MeshToonMaterial).color.getHex() !== FRUIT)
    .map((m) => {
      if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere();
      const cone = m.geometry.type === "ConeGeometry";
      const radius =
        (m.geometry.boundingSphere?.radius ?? 0.5) *
        Math.max(m.scale.x, m.scale.y, m.scale.z) *
        (cone ? 0.72 : 1.08);
      m.visible = false;
      return { mesh: m, center: m.position.clone(), radius, cone };
    });
  const sizes = clusters.map((c) =>
    Math.max(50, Math.min(420, Math.round(c.radius * c.radius * 360 * density))),
  );
  const total = sizes.reduce((a, b) => a + b, 0);
  const material = toon(0xffffff, { map: leafTexture(), alphaTest: 0.5, side: DoubleSide });
  const mesh = new InstancedMesh(upPlane(0.3, 0.3), material, Math.max(1, total));
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const info: { cluster: number; light: number; jitter: number }[] = [];
  const m4 = new Matrix4();
  const q = new Quaternion();
  const e = new Euler();
  const p = new Vector3();
  const s = new Vector3();
  let k = 0;
  clusters.forEach((c, ci) => {
    for (let i = 0; i < sizes[ci]; i++) {
      // Ponto na casca da esfera (ou do cone), às vezes um pouco para dentro, para ficar cheio.
      const u = r() * 2 - 1;
      const th = r() * Math.PI * 2;
      const rr = Math.sqrt(1 - u * u);
      const depth = 0.62 + Math.sqrt(r()) * 0.45;
      let x = rr * Math.cos(th) * c.radius * depth;
      const y = u * c.radius * depth * (c.cone ? 1.5 : 0.9);
      let z = rr * Math.sin(th) * c.radius * depth;
      if (c.cone) {
        const narrow = 1 - (u * 0.5 + 0.5) * 0.85;
        x *= narrow;
        z *= narrow;
      }
      p.set(c.center.x + x, c.center.y + y, c.center.z + z);
      q.setFromEuler(e.set((r() - 0.5) * 0.9, r() * Math.PI * 2, (r() - 0.5) * 0.9));
      const size = (0.75 + r() * 0.6) * Math.min(1.3, 0.55 + c.radius * 0.45);
      mesh.setMatrixAt(k++, m4.compose(p, q, s.set(size, size, size)));
      // Mais claro em cima e por fora, mais escuro embaixo e por dentro.
      info.push({
        cluster: ci,
        light: 0.62 + (u * 0.5 + 0.5) * 0.42 + (depth - 0.8) * 0.3,
        jitter: (r() - 0.5) * 0.05,
      });
    }
  });
  mesh.count = k;
  mesh.instanceMatrix.needsUpdate = true;

  const color = new Color();
  const recolor = (season: Season) => {
    const base = clusters.map((c, ci) => seasonLeaf(c.mesh.userData.base as Color, season, ci));
    info.forEach((L, i) => {
      color
        .copy(base[L.cluster])
        .offsetHSL(L.jitter * 0.4, 0.04, L.jitter)
        .multiplyScalar(L.light);
      mesh.setColorAt(i, color);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };

  crown.updateWorldMatrix(true, false);
  const centers = clusters.map((c) => {
    const w = crown.localToWorld(c.center.clone());
    return { x: w.x, z: w.z };
  });
  return { mesh, recolor, centers };
}

const FALLEN_COLORS: Record<Season, number[]> = {
  primavera: [0xf2b5c4, 0xf8d3dc, 0xfdfcf9, 0xe88fa8],
  verao: [0xc8463a, 0xe0703a, 0xd9b44a, 0xb8343a],
  outono: [0xc8463a, 0xe0703a, 0xd98a3a, 0xb8343a],
  inverno: [0xc8b8a8, 0xfdfcf9, 0xd9cfc4, 0xffffff],
};

/** Folhas caídas: mais perto das árvores, algumas soltas pela ilha toda. Pétalas na primavera. */
export function makeFallenLeaves(
  centers: { x: number; z: number }[],
  count: number,
): { mesh: InstancedMesh; recolor: (season: Season) => void } {
  const r = rng(777);
  const mesh = new InstancedMesh(upPlane(0.11, 0.08, true), toon(0xffffff), count);
  mesh.receiveShadow = true;
  const picks: number[] = [];
  const m4 = new Matrix4();
  const q = new Quaternion();
  const p = new Vector3();
  const s = new Vector3();
  const up = new Vector3(0, 1, 0);
  let k = 0;
  for (let tries = 0; k < count && tries < count * 3; tries++) {
    let x: number;
    let z: number;
    const a = r() * Math.PI * 2;
    if (r() < 0.6 && centers.length) {
      const c = centers[Math.floor(r() * centers.length)];
      const d = Math.sqrt(r()) * 2.6;
      x = c.x + Math.cos(a) * d;
      z = c.z + Math.sin(a) * d;
    } else {
      const d = Math.sqrt(r()) * 11;
      x = Math.cos(a) * d;
      z = Math.sin(a) * d;
    }
    if (Math.hypot(x, z) > 11.4 || OBSTACLES.some((o) => Math.hypot(x - o.x, z - o.z) < o.r - 0.1)) continue;
    const size = 0.8 + r() * 0.7;
    p.set(x, heightAt(x, z) + 0.025, z);
    q.setFromAxisAngle(up, r() * Math.PI * 2);
    mesh.setMatrixAt(k++, m4.compose(p, q, s.set(size, 1, size)));
    picks.push(r());
  }
  mesh.count = k;
  mesh.instanceMatrix.needsUpdate = true;
  const color = new Color();
  return {
    mesh,
    recolor: (season) => {
      const pal = FALLEN_COLORS[season];
      picks.forEach((v, i) => mesh.setColorAt(i, color.setHex(pal[Math.floor(v * pal.length) % pal.length])));
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    },
  };
}
