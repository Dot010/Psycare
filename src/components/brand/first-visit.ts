/** Telas de entrada, onde a abertura funciona como apresentação do app. */
const PRESENTATION_PATHS = new Set(["/", "/login", "/register"]);

export function isPresentationPath(pathname: string | null): boolean {
  return pathname !== null && PRESENTATION_PATHS.has(pathname);
}

/** Sem movimento: a marca fica parada por este tempo e some. */
export const STILL_MS = 900;
/** Teto: se a página demorar, a abertura sai depois disto, mesmo sem ela terminar de carregar. */
export const MAX_WAIT_MS = 3500;
