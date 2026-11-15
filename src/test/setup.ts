import "@testing-library/jest-dom/vitest";

// O jsdom não tem matchMedia. As animações (Stagger, CountUp) perguntam se a pessoa pediu
// menos movimento; nos testes a resposta é "sim", então tudo aparece direto, sem esperar animação.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}
