export const FIRST_VISIT_KEY = "psycare:first-visit:v1";

/** Só mostra se a página ainda está carregando depois disto: carregamento rápido não pisca. */
export const SHOW_AFTER_MS = 200;
/** Depois de aparecer, fica pelo menos isto, para a marca não surgir e sumir num lampejo. */
export const MIN_VISIBLE_MS = 400;
/** Teto: mesmo que a página demore, a tela de abertura sai depois disto. */
export const MAX_VISIBLE_MS = 1000;

/** Verdadeiro uma vez por sessão do navegador. Sem sessionStorage, nunca mostra. */
export function claimFirstVisit(): boolean {
  try {
    if (window.sessionStorage.getItem(FIRST_VISIT_KEY)) return false;
    window.sessionStorage.setItem(FIRST_VISIT_KEY, "1");
    return true;
  } catch {
    return false;
  }
}
