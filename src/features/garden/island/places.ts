/**
 * A ilha do jardim: onde ficam os lugares, o que cada um abre no app e as regras que não mudam.
 * Tudo aqui é puro (sem three.js), para dar para testar.
 */

export type PlaceId =
  "canteiros" | "cabana" | "farol" | "cais" | "garrafa" | "correio" | "consulta" | "praia";

export interface Place {
  id: PlaceId;
  /** Nome curto (lista de lugares, nome no chão). */
  label: string;
  /** O que a pessoa encontra ali. */
  hint: string;
  /** Página do app que o lugar abre. */
  href: string;
  /** Centro do lugar na ilha. */
  x: number;
  z: number;
  /** Onde a raposa para quando vai junto. */
  stop: [number, number];
}

export const PLACES: Place[] = [
  {
    id: "canteiros",
    label: "Canteiros",
    hint: "Seu dia: as gotas dos cuidados regam as plantas.",
    href: "/dashboard/garden",
    x: 4.5,
    z: 3,
    stop: [2.5, 5.1],
  },
  {
    id: "cabana",
    label: "Cabana",
    hint: "O diário. Escreva uma linha aqui mesmo: vira um livro na estante.",
    href: "/dashboard/diary",
    x: -4,
    z: -2,
    stop: [-3.1, 0.6],
  },
  {
    id: "farol",
    label: "Farol",
    hint: "Ajuda agora: um exercício para a ansiedade, seu plano de segurança e o CVV 188.",
    href: "/dashboard/safety",
    x: 8,
    z: -6,
    stop: [6.4, -4.6],
  },
  {
    id: "cais",
    label: "Cais",
    hint: "O barco da respiração. A raposa respira junto.",
    href: "/dashboard/breathing",
    x: -1,
    z: 13,
    stop: [-1, 10],
  },
  {
    id: "garrafa",
    label: "Garrafa",
    hint: "Atividades que seu profissional pediu.",
    href: "/dashboard/activities",
    x: -9.4,
    z: -5.2,
    stop: [-8.4, -4.6],
  },
  {
    id: "correio",
    label: "Correio",
    hint: "Mensagens do seu profissional.",
    href: "/dashboard/messages",
    x: -6.2,
    z: 1.2,
    stop: [-5.6, 1.9],
  },
  {
    id: "consulta",
    label: "Consulta",
    hint: "A próxima sessão e o que levar para ela.",
    href: "/dashboard/appointments",
    x: 0.6,
    z: 9.6,
    stop: [0.2, 8.8],
  },
  {
    id: "praia",
    label: "Praia",
    hint: "Pedra da preocupação: escreva o que pesa e jogue no mar, ou guarde para a sessão.",
    href: "/dashboard/appointments",
    x: 8.2,
    z: 4.8,
    stop: [7.1, 5.9],
  },
];

export const placeById = (id: PlaceId): Place => PLACES.find((place) => place.id === id) as Place;

/** Raio da parte de cima da ilha onde dá para andar. */
export const WALK_RADIUS = 10.6;

/** Obstáculos redondos (a raposa contorna). */
export const OBSTACLES: { x: number; z: number; r: number }[] = [
  { x: -4, z: -2, r: 2.2 },
  { x: 8, z: -6, r: 1.4 },
  { x: 4.5, z: 3, r: 2.3 },
  { x: 8.2, z: 4.8, r: 0.8 },
];

/** Altura do chão da ilha num ponto: ondulação leve que some na borda. */
export function heightAt(x: number, z: number, radius = 12): number {
  const edge = Math.min(1, Math.hypot(x, z) / radius);
  return 1.8 + Math.sin(x * 0.4) * Math.cos(z * 0.35) * 0.18 * (1 - edge);
}

/**
 * Manchas de grama: acima de `SAND_EDGE` é grama, abaixo é caminho de areia.
 * O chão pintado e as folhinhas de grama usam a mesma conta, então combinam.
 */
export const SAND_EDGE = -0.26;
export function grassPatch(x: number, z: number): number {
  return Math.sin(x * 0.33 + 1.3) * Math.cos(z * 0.27 - 0.4) * 0.6 + Math.sin(x * 0.81 + z * 0.57) * 0.4;
}

/** Leva um ponto para dentro da ilha e para fora dos obstáculos. */
export function keepOnIsland(x: number, z: number, body = 0.45): [number, number] {
  let px = x;
  let pz = z;
  const d = Math.hypot(px, pz);
  if (d > WALK_RADIUS) {
    px *= WALK_RADIUS / d;
    pz *= WALK_RADIUS / d;
  }
  for (const o of OBSTACLES) {
    const dx = px - o.x;
    const dz = pz - o.z;
    const od = Math.hypot(dx, dz);
    const min = o.r + body;
    if (od < min && od > 0.0001) {
      px = o.x + (dx / od) * min;
      pz = o.z + (dz / od) * min;
    }
  }
  return [px, pz];
}

export type Season = "verao" | "outono" | "inverno" | "primavera";

export const SEASON_NAMES: Record<Season, string> = {
  verao: "Verão",
  outono: "Outono",
  inverno: "Inverno",
  primavera: "Primavera",
};

/** Estação pela data, no hemisfério sul (Brasil). */
export function seasonFor(date: Date): Season {
  const month = date.getMonth();
  if (month === 11 || month <= 1) return "verao";
  if (month <= 4) return "outono";
  if (month <= 7) return "inverno";
  return "primavera";
}

export const UNLOCKS = ["banco", "lanternas", "ninho", "bandeirinhas"] as const;
export type Unlock = (typeof UNLOCKS)[number];

/**
 * O que aparece na ilha com o uso. Só soma: nada some nem murcha se a pessoa ficar longe.
 * Nunca depende de como a pessoa estava (o humor), só de ela ter se cuidado.
 */
export function unlocksFor(input: { careDays: number; grownPlants: number; trips: number }): Unlock[] {
  const result: Unlock[] = [];
  if (input.careDays >= 2) result.push("banco");
  if (input.careDays >= 3) result.push("lanternas");
  if (input.grownPlants >= 1) result.push("ninho");
  if (input.trips >= 2) result.push("bandeirinhas");
  return result;
}

const UNLOCK_NAMES: Record<Unlock, string> = {
  banco: "o banco",
  lanternas: "as lanternas",
  ninho: "o ninho",
  bandeirinhas: "as bandeirinhas",
};

/**
 * A próxima coisa que vai aparecer na ilha e o que falta para ela, numa frase.
 * Null quando tudo já apareceu.
 */
export function nextUnlock(input: { careDays: number; grownPlants: number; trips: number }): string | null {
  const steps: { id: Unlock; missing: number; what: (n: number) => string }[] = [
    { id: "banco", missing: 2 - input.careDays, what: (n) => `${n} ${n === 1 ? "dia" : "dias"} de cuidado` },
    {
      id: "lanternas",
      missing: 3 - input.careDays,
      what: (n) => `${n} ${n === 1 ? "dia" : "dias"} de cuidado`,
    },
    { id: "ninho", missing: 1 - input.grownPlants, what: () => "uma planta crescer toda" },
    {
      id: "bandeirinhas",
      missing: 2 - input.trips,
      what: (n) => `${n} ${n === 1 ? "travessia" : "travessias"} de barco`,
    },
  ];
  const next = steps.find((step) => step.missing > 0);
  if (!next) return null;
  const verb = next.missing > 1 ? "Faltam" : "Falta";
  const shows = next.id === "lanternas" || next.id === "bandeirinhas" ? "aparecerem" : "aparecer";
  return `${verb} ${next.what(next.missing)} para ${shows} ${UNLOCK_NAMES[next.id]}.`;
}

/** Junta o que já tinha aparecido com o que aparece agora, sem tirar nada. */
export function mergeUnlocks(current: readonly string[], next: readonly Unlock[]): Unlock[] {
  return UNLOCKS.filter((item) => current.includes(item) || next.includes(item));
}

export const FOX_NAME_MAX = 16;
const FOX_NAME_OK = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

/** Limpa o nome da raposa do mesmo jeito que a API: espaços, tamanho, só letras, primeira maiúscula. */
export function cleanFoxName(raw: string): string | null {
  const value = raw.split(/\s+/).filter(Boolean).join(" ").slice(0, FOX_NAME_MAX);
  if (!value) return "";
  if (!FOX_NAME_OK.test(value)) return null;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** "a Mel" ou "a raposa", para as frases. */
export function foxRef(name: string): string {
  return name ? `a ${name}` : "a raposa";
}
