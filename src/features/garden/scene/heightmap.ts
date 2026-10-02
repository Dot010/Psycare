/** Raio do canteiro (terra) no centro, onde ficam as plantas. Fora dele o chão vira colinas. */
export const BED_RADIUS = 2.2;

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Altura do chão em (x, z): plano no canteiro, colinas suaves longe dele e mais altas ao fundo. */
export function heightAt(x: number, z: number): number {
  const distance = Math.hypot(x, z);
  const hills =
    Math.sin(x * 0.18 + 1.3) * 1.0 + Math.cos(z * 0.15 - 0.4) * 0.8 + Math.sin((x + z) * 0.09) * 1.5;
  const horizon = Math.max(0, -z - 6) * 0.1;
  // Sem colinas na frente do canteiro: a câmera fica ali e não pode ficar "dentro" do chão.
  const front = 1 - smoothstep(0, 5, z);
  return (hills * 0.85 + horizon) * smoothstep(BED_RADIUS + 0.4, BED_RADIUS + 8, distance) * front;
}

/** Gerador pseudoaleatório com semente: a cena sai igual a cada visita. */
export function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
