"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { applyTheme, useTheme } from "@/lib/theme";
import { usePrefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

const STARS = [
  { left: "14%", top: "28%", size: 3 },
  { left: "30%", top: "62%", size: 2 },
  { left: "42%", top: "24%", size: 2 },
  { left: "52%", top: "66%", size: 3 },
  { left: "22%", top: "46%", size: 2 },
];

/**
 * Interruptor de tema: de dia, um sol amarelo; de noite, uma lua com estrelas que piscam.
 * As cores aqui são fixas de propósito (a ilustração é a mesma nos dois temas).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  const dark = theme === "dark";
  const reduced = usePrefersReducedMotion();
  const starsRef = useRef<HTMLSpanElement | null>(null);

  // Estrelas: surgem ao escurecer e depois piscam devagar.
  useGSAP(
    () => {
      const stars = starsRef.current?.children;
      if (!stars) return;
      gsap.killTweensOf(stars);
      if (!dark) {
        gsap.set(stars, { opacity: 0, scale: 0 });
        return;
      }
      if (reduced) {
        gsap.set(stars, { opacity: 1, scale: 1 });
        return;
      }
      gsap.to(stars, {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: 0.08,
        delay: 0.25,
        ease: "back.out(3)",
      });
      gsap.to(stars, {
        opacity: 0.35,
        duration: 1.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { each: 0.35, from: "random" },
        delay: 1,
      });
    },
    { dependencies: [dark, reduced], scope: starsRef },
  );

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Modo escuro"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        applyTheme(dark ? "light" : "dark", { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }}
      className={cn(
        "relative h-9 w-[68px] shrink-0 overflow-hidden rounded-full border transition-colors duration-500 focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
        className,
        dark ? "border-[#4a5a33] bg-[#1d2614]" : "border-[#c9b53c] bg-[#ead96b]",
      )}
    >
      <span ref={starsRef} aria-hidden className="absolute inset-0">
        {STARS.map((star) => (
          <span
            key={star.left}
            className="absolute rounded-full bg-[#fdf6d8] opacity-0"
            style={{ left: star.left, top: star.top, width: star.size, height: star.size }}
          />
        ))}
      </span>

      <span
        aria-hidden
        className={cn(
          "absolute top-1 left-1 size-7 rounded-full shadow-sm transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]",
          dark ? "translate-x-8 bg-[#f2ece4]" : "translate-x-0 bg-[#fff6c9]",
        )}
      >
        {/* Raios do sol: giram e somem de noite. */}
        <span
          className={cn(
            "absolute -inset-[3px] rounded-full border-2 border-dotted border-[#c9b53c] transition-all duration-500",
            dark ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
          )}
        />
        {/* Crateras da lua: aparecem de noite. */}
        <span
          className={cn(
            "absolute top-[7px] left-[6px] size-2 rounded-full bg-[#d6cdc2] transition-opacity duration-500",
            dark ? "opacity-100" : "opacity-0",
          )}
        />
        <span
          className={cn(
            "absolute top-[15px] left-[14px] size-1.5 rounded-full bg-[#d6cdc2] transition-opacity duration-500",
            dark ? "opacity-100" : "opacity-0",
          )}
        />
      </span>
    </button>
  );
}
