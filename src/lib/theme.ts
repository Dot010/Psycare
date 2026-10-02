"use client";

import { useSyncExternalStore } from "react";
import { THEME_COOKIE, type Theme } from "@/lib/theme-cookie";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/** O tema atual, lido da classe `dark` do <html> (o servidor já a coloca a partir do cookie). */
export function useTheme(): Theme {
  return useSyncExternalStore(
    subscribe,
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => "light",
  );
}

interface Origin {
  x: number;
  y: number;
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

/**
 * Troca o tema e lembra a escolha em um cookie. Onde o navegador suporta View Transitions,
 * o tema novo "se abre" em círculo a partir do botão; com "reduzir movimento", troca direto.
 */
export function applyTheme(next: Theme, origin?: Origin) {
  const update = () => {
    document.documentElement.classList.toggle("dark", next === "dark");
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  const doc = document as ViewTransitionDocument;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduced || !origin) {
    update();
    return;
  }

  const { x, y } = origin;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  doc.startViewTransition(update).ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      {
        duration: 650,
        easing: "cubic-bezier(0.65, 0, 0.35, 1)",
        pseudoElement: "::view-transition-new(root)",
      },
    );
  });
}
