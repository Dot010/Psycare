/** Cookie de sessão (some ao fechar o navegador): marca que a abertura já foi mostrada. Sem dado pessoal. */
export const SEEN_COOKIE = "psycare_splash";

/** Fica ao menos isto na tela, para a marca ser vista e não piscar. */
export const MIN_VISIBLE_MS = 900;
/** Teto: mesmo que a página demore, a abertura sai depois disto. */
export const MAX_VISIBLE_MS = 1600;
/** Duração do esmaecer ao sair. */
export const FADE_MS = 300;

export function markSeen(): void {
  try {
    document.cookie = `${SEEN_COOKIE}=1; path=/; SameSite=Lax`;
  } catch {
    // Cookies bloqueados: só deixa de lembrar que já mostrou.
  }
}
