import {
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DataTexture,
  DodecahedronGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  NearestFilter,
  PlaneGeometry,
  RedFormat,
  Shape,
  SRGBColorSpace,
  TorusGeometry,
  type BufferGeometry,
  type Material,
} from "three";
import { grassPatch, heightAt, SAND_EDGE, type Season } from "@/features/garden/island/places";

/**
 * As peças da ilha, montadas direto em three.js (sem JSX) porque são muitas e não mudam.
 * Tudo usa luz em 3 faixas (toon), como na prévia.
 */

let gradient: DataTexture | null = null;
function toonGradient(): DataTexture {
  if (!gradient) {
    gradient = new DataTexture(new Uint8Array([120, 190, 255]), 3, 1, RedFormat);
    gradient.minFilter = gradient.magFilter = NearestFilter;
    gradient.generateMipmaps = false;
    gradient.needsUpdate = true;
  }
  return gradient;
}

export function toon(color: number | string, extra: Partial<MeshToonMaterial> = {}): MeshToonMaterial {
  return Object.assign(new MeshToonMaterial({ color, gradientMap: toonGradient() }), extra);
}

function mesh(geometry: BufferGeometry, material: Material, x = 0, y = 0, z = 0, shadow = true): Mesh {
  const m = new Mesh(geometry, material);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}

/** Deterministic random: a mesma semente sempre desenha a mesma ilha. */
export function rng(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Chão pintado (como no portfólio do Bruno Simon): verde embaixo das manchas de grama
 * e areia nos caminhos, com borda macia e pontinhos.
 */
function paintGround(radius: number): CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const S = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const img = ctx.createImageData(S, S);
  const sand = [222, 182, 142];
  const sandDot = [205, 160, 120];
  const dark = [84, 110, 46];
  const mid = [106, 132, 54];
  const light = [150, 152, 70];
  const r = rng(5);
  for (let py = 0; py < S; py++)
    for (let px = 0; px < S; px++) {
      // A textura começa no canto -x, -z (o plano foi deitado com rotateX).
      const x = -radius + ((px + 0.5) / S) * 2 * radius;
      const z = -radius + ((py + 0.5) / S) * 2 * radius;
      const pv = grassPatch(x, z) + (r() - 0.5) * 0.05;
      const k = Math.min(1, Math.max(0, (pv - SAND_EDGE + 0.04) / 0.12));
      const green = mid.map((c, i) =>
        pv > 0 ? c + (light[i] - c) * pv * 0.7 : c + (dark[i] - c) * Math.min(1, -pv * 2),
      );
      const ground = r() < 0.06 ? sandDot : sand;
      const o = (py * S + px) * 4;
      for (let i = 0; i < 3; i++) img.data[o + i] = ground[i] + (green[i] - ground[i]) * k;
      img.data[o + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** Ilha: topo ondulado, lateral de terra com faixas de pedra e areia embaixo. */
export function makeIslandBody(radius = 12): Group {
  const g = new Group();
  // Plano subdividido recortado em círculo (sem o "leque" do topo de um cilindro).
  const top = new PlaneGeometry(radius * 2, radius * 2, 40, 40);
  top.rotateX(-Math.PI / 2);
  const pos = top.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let z = pos.getZ(i);
    const d = Math.hypot(x, z);
    if (d > radius) {
      x *= radius / d;
      z *= radius / d;
    }
    pos.setXYZ(i, x, heightAt(x, z, radius) - 0.6, z);
  }
  top.computeVertexNormals();
  const topMesh = mesh(top, toon(0xffffff, { map: paintGround(radius) }), 0, 0.6, 0, false);
  topMesh.name = "ground";
  g.add(topMesh);
  g.add(
    mesh(
      new CylinderGeometry(radius, radius * 1.1, 2.4, 40, 1, true),
      toon(0xc9a27a, { side: DoubleSide }),
      0,
      0.6,
      0,
      false,
    ),
  );
  [
    [0.4, 0x9c7556],
    [-0.2, 0xb38b66],
  ].forEach(([y, c]) =>
    g.add(
      mesh(
        new CylinderGeometry(radius * 1.04, radius * 1.06, 0.3, 40, 1, true),
        toon(c, { side: DoubleSide }),
        0,
        y,
        0,
        false,
      ),
    ),
  );
  g.add(mesh(new CylinderGeometry(radius * 1.16, radius * 1.38, 1.2, 40), toon(0xe6d6b3), 0, -0.8, 0, false));
  return g;
}

/**
 * Árvore: pinheiro em camadas, redonda em bolinhas, bétula (tronco claro) ou de frutinhas.
 * `crown` é o que balança; `leaves` é o que muda de cor com a estação (os frutos ficam vermelhos).
 */
export function makeTree(seed: number, scale: number): { group: Group; crown: Group; leaves: Mesh[] } {
  const r = rng(seed);
  const group = new Group();
  const crown = new Group();
  const leaves: Mesh[] = [];
  const s = scale;
  const kind = r();
  const tint = (hex: number, l: number) => new Color(hex).offsetHSL((r() - 0.5) * 0.03, 0, l).getHex();
  const birch = kind >= 0.86;
  const trunk = mesh(
    new CylinderGeometry(0.15 * s, 0.22 * s, 1.2 * s, 6),
    toon(birch ? 0xede6da : 0x8a5a3c),
    0,
    0.6 * s,
    0,
  );
  trunk.rotation.z = (r() - 0.5) * 0.12;
  group.add(trunk);
  crown.position.y = 1.1 * s;
  group.add(crown);
  const leaf = (geo: BufferGeometry, color: number, x: number, y: number, z: number) => {
    const m = mesh(geo, toon(color), x * s, y * s, z * s);
    crown.add(m);
    leaves.push(m);
    return m;
  };
  if (birch) {
    [0.3, 0.62, 0.9].forEach((y, i) =>
      group.add(
        mesh(
          new BoxGeometry(0.1 * s, 0.05 * s, 0.05 * s),
          toon(0x3a2a24),
          (i % 2 ? 0.12 : -0.12) * s,
          y * s,
          0.15 * s,
          false,
        ),
      ),
    );
    [
      [0, -0.4, 0, 0.62],
      [0.3, 0.05, 0.1, 0.48],
      [-0.25, -0.05, -0.12, 0.45],
    ].forEach(
      ([x, y, z, br]) =>
        (leaf(new IcosahedronGeometry(br * s, 0), tint(0xc9cf5e, 0), x, y + 1.1, z).scale.y = 1.25),
    );
  } else if (kind >= 0.78) {
    const ball = leaf(new IcosahedronGeometry(0.85 * s, 1), tint(0x6fae58, 0), 0, 0.8, 0);
    ball.scale.y = 0.85;
    for (let f = 0; f < 7; f++) {
      const a = r() * Math.PI * 2;
      const e = r() * 1.2 - 0.2;
      crown.add(
        mesh(
          new IcosahedronGeometry(0.08 * s, 0),
          toon(0xd0443a),
          Math.cos(a) * Math.cos(e) * 0.82 * s,
          0.8 * s + Math.sin(e) * 0.7 * s,
          Math.sin(a) * Math.cos(e) * 0.82 * s,
          false,
        ),
      );
    }
  } else if (kind < 0.55) {
    const base = r() > 0.5 ? 0x4f8a4b : 0x6ba55a;
    [
      [0.95, 1.4, 0.55],
      [0.72, 1.2, 1.25],
      [0.48, 0.95, 1.85],
    ].forEach(
      ([w, h, y], i) =>
        (leaf(new ConeGeometry(w * s, h * s, 7), tint(base, i * 0.035), 0, y, 0).rotation.y = i * 0.4),
    );
  } else {
    const base = r() > 0.5 ? 0x7db35a : 0x9bbe5a;
    [
      [0, 0.75, 0, 0.75],
      [0.38, 0.55, 0.15, 0.5],
      [-0.32, 0.6, -0.2, 0.52],
      [0.05, 1.2, -0.05, 0.5],
    ].forEach(([x, y, z, br]) =>
      leaf(new IcosahedronGeometry(br * s, 0), tint(base, (r() - 0.5) * 0.06), x, y, z),
    );
  }
  // Moitas em volta de algumas árvores.
  if (r() > 0.5)
    for (let b = 0; b < 2; b++) {
      const a = r() * Math.PI * 2;
      const bush = mesh(
        new IcosahedronGeometry(0.32 + r() * 0.18, 0),
        toon(new Color(0x5e9a4a).offsetHSL(0, 0, (r() - 0.5) * 0.08).getHex()),
        Math.cos(a) * 0.9 * s,
        0.15,
        Math.sin(a) * 0.9 * s,
      );
      bush.scale.y = 0.75;
      group.add(bush);
    }
  return { group, crown, leaves };
}

/** Cor das copas por estação (as frutinhas vermelhas ficam como estão). */
export function seasonLeaf(base: Color, season: Season, k: number): Color {
  const c = base.clone();
  if (season === "outono") c.lerp(new Color([0xe08a3a, 0xd9b44a, 0xc8642f][k % 3]), 0.7);
  if (season === "inverno") c.lerp(new Color(0xc9d6cf), 0.35);
  if (season === "verao") c.offsetHSL(0, 0.05, 0.02);
  return c;
}

/** Cabana: paredes finas (dá para ver dentro quando o telhado sobe), estante, varanda e chaminé. */
export function makeCabin(): {
  group: Group;
  roof: Group;
  windowMat: MeshStandardMaterial;
  smokeAt: [number, number, number];
} {
  const g = new Group();
  const add = (geo: BufferGeometry, color: number, x: number, y: number, z: number, parent: Group = g) => {
    const m = mesh(geo, toon(color), x, y, z);
    parent.add(m);
    return m;
  };
  add(new BoxGeometry(3.5, 0.3, 2.9), 0xb8afa6, 0, 0.15, 0);
  add(new BoxGeometry(3.2, 1.9, 0.1), 0xf0ddbd, 0, 1.25, -1.25);
  add(new BoxGeometry(3.2, 1.9, 0.1), 0xf0ddbd, 0, 1.25, 1.25);
  add(new BoxGeometry(0.1, 1.9, 2.6), 0xf0ddbd, -1.55, 1.25, 0);
  add(new BoxGeometry(0.1, 1.9, 2.6), 0xf0ddbd, 1.55, 1.25, 0);
  [
    [-1.6, -1.3],
    [1.6, -1.3],
    [-1.6, 1.3],
    [1.6, 1.3],
  ].forEach(([x, z]) => add(new BoxGeometry(0.16, 1.95, 0.16), 0x9c6b48, x, 1.25, z));
  // Por dentro: piso, tapete, estante com livros, mesa e a caminha da raposa.
  add(new BoxGeometry(3.0, 0.04, 2.4), 0xc49a6c, 0, 0.32, 0);
  add(new CylinderGeometry(0.6, 0.6, 0.02, 20), 0xe9a5a0, 0.15, 0.35, 0.25);
  const shelf = new Group();
  shelf.position.set(0.35, 0.34, -1.02);
  g.add(shelf);
  add(new BoxGeometry(1.7, 1.58, 0.03), 0x6e4630, 0, 0.78, -0.16, shelf);
  for (let k = 0; k < 4; k++) add(new BoxGeometry(1.6, 0.05, 0.32), 0x8a5a3c, 0, 0.02 + k * 0.38, 0, shelf);
  const books = [0xd0644a, 0x6fb0c8, 0xead96b, 0x7db35a, 0xf2b5c4, 0x9c7bc8];
  for (let i = 0; i < 18; i++)
    add(
      new BoxGeometry(0.1, 0.24, 0.24),
      books[i % books.length],
      -0.7 + (i % 12) * 0.115,
      0.17 + Math.floor(i / 12) * 0.38,
      0.02,
      shelf,
    );
  add(new BoxGeometry(0.9, 0.06, 0.55), 0xb08660, -0.95, 0.95, 0.15);
  add(new CylinderGeometry(0.4, 0.4, 0.08, 14), 0xf2b5c4, 0.95, 0.38, 0.55);
  // Porta, janela que acende à noite, varanda e floreira.
  add(new BoxGeometry(0.72, 1.25, 0.06), 0x7a4f36, 0.6, 0.93, 1.32);
  const windowMat = new MeshStandardMaterial({ color: 0x3b3b46, emissive: 0xf6c86a, emissiveIntensity: 0 });
  g.add(mesh(new BoxGeometry(0.8, 0.6, 0.05), windowMat, -0.8, 1.35, 1.31, false));
  add(new BoxGeometry(0.25, 0.68, 0.05), 0x5e8a6a, -1.38, 1.35, 1.34);
  add(new BoxGeometry(0.25, 0.68, 0.05), 0x5e8a6a, -0.22, 1.35, 1.34);
  add(new BoxGeometry(0.95, 0.18, 0.22), 0x9c6b48, -0.8, 0.9, 1.43);
  for (let k = 0; k < 5; k++)
    add(new BoxGeometry(0.36, 0.1, 1.1), k % 2 ? 0xb08660 : 0xa57c56, -0.2 + k * 0.38, 0.32, 1.85);
  // Telhado de duas águas com chaminé: um grupo só, para subir inteiro.
  const roof = new Group();
  g.add(roof);
  const gable = new Shape();
  gable.moveTo(-1.6, 0);
  gable.lineTo(1.6, 0);
  gable.lineTo(0, 1.15);
  gable.lineTo(-1.6, 0);
  add(new ExtrudeGeometry(gable, { depth: 2.6, bevelEnabled: false }), 0xf0ddbd, 0, 2.2, -1.3, roof);
  const slope = Math.atan2(1.15, 1.6);
  const len = Math.hypot(1.6, 1.15) + 0.35;
  [-1, 1].forEach((side) => {
    const panel = add(
      new BoxGeometry(len, 0.14, 3.2),
      0xd0644a,
      side * (len / 2 - 0.2) * Math.cos(slope),
      3.35 - (len / 2 - 0.2) * Math.sin(slope) + 0.06,
      0,
      roof,
    );
    panel.rotation.z = -side * slope;
  });
  add(new BoxGeometry(0.45, 1.1, 0.45), 0xb8afa6, -0.85, 3.25, -0.5, roof);
  return { group: g, roof, windowMat, smokeAt: [-0.85, 3.95, -0.5] };
}

/** Farol: base de pedra, faixas, sacada, cúpula de vidro e o facho girando. */
export function makeLighthouse(): { group: Group; beam: Group; lampMat: MeshStandardMaterial } {
  const g = new Group();
  g.add(mesh(new CylinderGeometry(0.7, 1.1, 5, 12), toon(0xfdfcf9), 0, 2.5, 0));
  for (let s = 0; s < 2; s++)
    g.add(
      mesh(
        new CylinderGeometry(0.95 - s * 0.18, 1.03 - s * 0.18, 0.6, 12),
        toon(0xb3382c),
        0,
        1.2 + s * 2,
        0,
      ),
    );
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    const st = mesh(
      new DodecahedronGeometry(0.28 + (k % 3) * 0.06, 0),
      toon(k % 2 ? 0xb8afa6 : 0xa39a92),
      Math.cos(a) * 1.2,
      0.12,
      Math.sin(a) * 1.2,
    );
    st.scale.y = 0.6;
    g.add(st);
  }
  g.add(mesh(new CylinderGeometry(1.0, 0.9, 0.12, 14), toon(0x3a2a24), 0, 5.0, 0));
  const lampMat = new MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffe38a, emissiveIntensity: 1.2 });
  g.add(mesh(new CylinderGeometry(0.55, 0.55, 0.8, 10), lampMat, 0, 5.45, 0, false));
  g.add(
    mesh(
      new CylinderGeometry(0.62, 0.62, 0.95, 12, 1, true),
      new MeshStandardMaterial({
        color: 0xddeff5,
        transparent: true,
        opacity: 0.35,
        side: DoubleSide,
        depthWrite: false,
      }),
      0,
      5.45,
      0,
      false,
    ),
  );
  g.add(mesh(new ConeGeometry(0.8, 0.8, 12), toon(0xb3382c), 0, 6.3, 0));
  const beam = new Group();
  beam.position.y = 5.45;
  const cone = mesh(
    new ConeGeometry(1.6, 14, 16, 1, true),
    new MeshBasicMaterial({
      color: 0xfff1b0,
      transparent: true,
      opacity: 0.14,
      side: DoubleSide,
      depthWrite: false,
    }),
    7,
    0,
    0,
    false,
  );
  cone.rotation.z = Math.PI / 2;
  beam.add(cone);
  g.add(beam);
  return { group: g, beam, lampMat };
}

/** Cais com tábuas, postes, boia e o barquinho da respiração. */
export function makeDock(): { group: Group; boat: Group } {
  const g = new Group();
  const r = rng(33);
  for (let i = 0; i < 6; i++) {
    const plank = mesh(
      new BoxGeometry(1.6, 0.15, 0.9),
      toon(i % 2 ? 0x9c7b5e : 0x947356),
      (r() - 0.5) * 0.06,
      1.3,
      i,
    );
    plank.rotation.y = (r() - 0.5) * 0.06;
    g.add(plank);
    if (i % 2 === 0) g.add(mesh(new CylinderGeometry(0.1, 0.1, 1.6, 6), toon(0x6b4a38), 0.85, 0.7, i));
  }
  const ring = new Group();
  for (let k = 0; k < 8; k++) {
    const seg = mesh(new TorusGeometry(0.28, 0.08, 6, 6, Math.PI / 4), toon(k % 2 ? 0xfdfcf9 : 0xd0443a));
    seg.rotation.z = (k * Math.PI) / 4;
    ring.add(seg);
  }
  ring.position.set(-0.86, 1.05, 2.5);
  ring.rotation.y = Math.PI / 2;
  g.add(ring);
  const boat = new Group();
  boat.add(mesh(new BoxGeometry(1.1, 0.45, 2.2), toon(0xd0644a), 0, 0.3, 0));
  const bow = mesh(new ConeGeometry(0.62, 0.9, 4), toon(0xd0644a), 0, 0.3, 1.5);
  bow.rotation.set(Math.PI / 2, Math.PI / 4, 0);
  bow.scale.set(1.25, 1, 0.55);
  boat.add(bow);
  boat.add(mesh(new BoxGeometry(1.16, 0.08, 2.24), toon(0xf3e2c4), 0, 0.56, 0));
  boat.add(mesh(new CylinderGeometry(0.06, 0.06, 3, 6), toon(0x6b4a38), 0, 1.9, 0));
  const sail = new Shape();
  sail.moveTo(0, 0);
  sail.lineTo(0, 2.4);
  sail.lineTo(-1.7, 0);
  sail.lineTo(0, 0);
  const sailMesh = mesh(
    new ExtrudeGeometry(sail, { depth: 0.02, bevelEnabled: false }),
    toon(0xfdfcf9),
    0,
    0.62,
    -0.05,
  );
  sailMesh.rotation.y = Math.PI / 2;
  boat.add(sailMesh);
  boat.position.set(2.6, 0, 3.5);
  g.add(boat);
  return { group: g, boat };
}

/** Canteiro grande de madeira onde ficam as plantas do jardim. */
export function makeBed(): Group {
  const g = new Group();
  const W = 3.4;
  const H = 0.3;
  const T = 0.14;
  [
    [0, W / 2 - T / 2, W, T],
    [0, -W / 2 + T / 2, W, T],
    [W / 2 - T / 2, 0, T, W - 2 * T],
    [-W / 2 + T / 2, 0, T, W - 2 * T],
  ].forEach(([x, z, w, d], k) =>
    g.add(mesh(new BoxGeometry(w, H, d), toon(k % 2 ? 0xb08660 : 0xa57c56), x, H / 2 - 0.04, z)),
  );
  const soil = mesh(new BoxGeometry(W - 2 * T, 0.22, W - 2 * T), toon(0x5c4033), 0, 0.1, 0, false);
  g.add(soil);
  for (let k = -2; k <= 2; k++)
    g.add(mesh(new BoxGeometry(W - 2 * T - 0.04, 0.05, 0.14), toon(0x5c4033), 0, 0.225, k * 0.6, false));
  return g;
}

/** O que a ilha ganha com o uso: banco, lanternas, casinha de passarinho e bandeirinhas. */
export function makeUnlock(id: string): Group {
  const g = new Group();
  if (id === "banco") {
    g.add(mesh(new BoxGeometry(1.3, 0.08, 0.42), toon(0xb08660), 0, 0.42, 0));
    g.add(mesh(new BoxGeometry(1.3, 0.34, 0.06), toon(0xb08660), 0, 0.68, -0.2));
    [-0.55, 0.55].forEach((x) => g.add(mesh(new BoxGeometry(0.08, 0.42, 0.36), toon(0x6b4a38), x, 0.21, 0)));
    g.position.set(-0.6, heightAt(-0.6, 7.2), 7.2);
    g.rotation.y = -Math.PI / 2 - 0.3;
  } else if (id === "lanternas") {
    [
      [-1.4, 1.2],
      [1.4, 1.6],
      [2.4, 5.4],
      [-1.9, 9.3],
    ].forEach(([x, z]) => {
      const post = new Group();
      post.add(mesh(new CylinderGeometry(0.05, 0.07, 1.4, 6), toon(0x3a2a24), 0, 0.7, 0));
      post.add(
        mesh(
          new BoxGeometry(0.2, 0.24, 0.2),
          new MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xf6c86a, emissiveIntensity: 0.6 }),
          0,
          1.5,
          0,
          false,
        ),
      );
      post.position.set(x, heightAt(x, z), z);
      g.add(post);
    });
  } else if (id === "ninho") {
    g.add(mesh(new CylinderGeometry(0.05, 0.05, 1.8, 6), toon(0x8a5a3c), 0, 0.9, 0));
    g.add(mesh(new BoxGeometry(0.4, 0.4, 0.4), toon(0x6fb0c8), 0, 1.95, 0));
    const roof = mesh(new ConeGeometry(0.36, 0.26, 4), toon(0xd0644a), 0, 2.28, 0);
    roof.rotation.y = Math.PI / 4;
    g.add(roof);
    g.add(
      mesh(new CircleGeometry(0.07, 8), new MeshBasicMaterial({ color: 0x2a1c18 }), 0, 1.98, 0.205, false),
    );
    g.position.set(7.2, heightAt(7.2, 1.4), 1.4);
  } else if (id === "bandeirinhas") {
    const colors = [0xead96b, 0xd0644a, 0x6fb0c8, 0xf2b5c4, 0x7db35a];
    for (let k = 0; k < 9; k++) {
      const u = k / 8;
      const flag = mesh(
        new ConeGeometry(0.09, 0.2, 3),
        new MeshBasicMaterial({ color: colors[k % colors.length] }),
        -0.2 + u * 1.9,
        2.15 - Math.sin(u * Math.PI) * 0.22,
        2.38,
        false,
      );
      flag.rotation.x = Math.PI;
      g.add(flag);
    }
  }
  return g;
}

/** Nome escrito no chão, como no portfólio do Bruno Simon. */
export function makeGroundLabel(text: string, width: number): Mesh {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.font = "700 150px Poppins, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, 512, 136);
  }
  const geo = new PlaneGeometry(width, width / 4);
  geo.rotateX(-Math.PI / 2);
  const m = new Mesh(
    geo,
    new MeshBasicMaterial({
      map: new CanvasTexture(canvas),
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }),
  );
  m.renderOrder = 1;
  return m;
}

/** Sombra de contato: um escurinho redondo na base das coisas. */
let blobTexture: CanvasTexture | null = null;
export function makeBlob(size: number): Mesh {
  if (!blobTexture) {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const ctx = c.getContext("2d");
    if (ctx) {
      const gr = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, "rgba(0,0,0,0.5)");
      gr.addColorStop(0.6, "rgba(0,0,0,0.22)");
      gr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, 64, 64);
    }
    blobTexture = new CanvasTexture(c);
  }
  const geo = new PlaneGeometry(size, size);
  geo.rotateX(-Math.PI / 2);
  const m = new Mesh(geo, new MeshBasicMaterial({ map: blobTexture, transparent: true, depthWrite: false }));
  m.renderOrder = 1;
  return m;
}

export const ROCK = (seed: number) => {
  const r = rng(seed);
  return mesh(new DodecahedronGeometry(0.3 + r() * 0.5, 0), toon(0xb5aba4));
};
