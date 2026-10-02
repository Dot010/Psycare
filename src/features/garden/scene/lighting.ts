export interface SkyPalette {
  top: string;
  horizon: string;
  sunColor: string;
  sunIntensity: number;
  ambient: string;
  ambientIntensity: number;
  /** Posição da luz principal (sol de dia, lua de noite). */
  lightPosition: [number, number, number];
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function lerpHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `#${[mix(ar, br), mix(ag, bg), mix(ab, bb)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

const NOON = { top: "#a9d3cc", horizon: "#fcf8df", sun: "#fff3c4" };
const GOLDEN = { top: "#d8c3b8", horizon: "#f7d49a", sun: "#ffc98a" };

/**
 * Céu e luz para a hora do dia (0 a 24, com fração). Meio-dia é claro e fresco; no começo da manhã e no
 * fim da tarde fica dourado. Com `night` (tema escuro) vira noite, com luz azulada da lua.
 */
export function skyPalette(hour: number, night: boolean): SkyPalette {
  if (night) {
    return {
      top: "#0d1220",
      horizon: "#26332a",
      sunColor: "#b8c8ff",
      sunIntensity: 1.1,
      ambient: "#8ea0d6",
      ambientIntensity: 0.9,
      lightPosition: [-6, 9, -5],
    };
  }

  const h = Math.min(18, Math.max(6, hour));
  const warmth = Math.min(1, Math.abs(h - 12) / 6) ** 1.6;
  const t = (h - 6) / 12;

  return {
    top: lerpHex(NOON.top, GOLDEN.top, warmth),
    horizon: lerpHex(NOON.horizon, GOLDEN.horizon, warmth),
    sunColor: lerpHex(NOON.sun, GOLDEN.sun, warmth),
    sunIntensity: 1.25 - warmth * 0.35,
    ambient: lerpHex("#fff6d6", "#f3d7b0", warmth),
    ambientIntensity: 0.55,
    lightPosition: [-Math.cos(Math.PI * t) * 9, Math.sin(Math.PI * t) * 8 + 2, 4],
  };
}
