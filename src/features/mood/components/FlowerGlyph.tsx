import type { MoodLevel } from "@/features/mood/types";

/** Quanto mais leve o dia, maior e mais amarela a flor. */
const SPEC: Record<
  MoodLevel,
  { height: number; r: number; ry: number; core: number; petal: string; stem: string }
> = {
  1: { height: 16, r: 5, ry: 2.4, core: 2.2, petal: "#b8c79a", stem: "var(--color-brand-400)" },
  2: { height: 22, r: 7, ry: 3, core: 2.6, petal: "#d0dbbb", stem: "var(--color-brand-500)" },
  3: { height: 28, r: 9, ry: 3.8, core: 3.2, petal: "#f3e9a0", stem: "var(--color-brand-600)" },
  4: { height: 34, r: 11, ry: 4.4, core: 3.8, petal: "#ead96b", stem: "var(--color-brand-600)" },
  5: { height: 40, r: 13, ry: 5.2, core: 4.4, petal: "#e3b73a", stem: "var(--color-brand-700)" },
};

interface FlowerGlyphProps {
  /** Nível do dia (pode ter casa decimal: vira o inteiro mais próximo). `null` é terra, sem registro. */
  level: number | null;
  className?: string;
}

export function FlowerGlyph({ level, className }: FlowerGlyphProps) {
  if (level === null) {
    return (
      <svg viewBox="0 0 40 64" className={className} aria-hidden>
        <ellipse cx="20" cy="60" rx="4" ry="2.4" fill="var(--color-border)" />
      </svg>
    );
  }

  const spec = SPEC[Math.min(5, Math.max(1, Math.round(level))) as MoodLevel];
  const cy = 64 - spec.height;

  return (
    <svg viewBox="0 0 40 64" className={className} aria-hidden>
      <path d={`M20,64 L20,${cy}`} stroke={spec.stem} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {[0, 45, 90, 135].map((angle) => (
        <ellipse
          key={angle}
          cx="20"
          cy={cy}
          rx={spec.r}
          ry={spec.ry}
          fill={spec.petal}
          transform={`rotate(${angle} 20 ${cy})`}
        />
      ))}
      <circle cx="20" cy={cy} r={spec.core} fill="#6b3a24" />
    </svg>
  );
}
