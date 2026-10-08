import { MOOD_LABELS } from "@/features/mood/logic";
import type { MoodLevel } from "@/features/mood/types";

const MOUTH: Record<MoodLevel, string> = {
  1: "M11 26 Q18 19 25 26",
  2: "M12 26 Q18 22 24 26",
  3: "M12 24.5 L24 24.5",
  4: "M12 23 Q18 28 24 23",
  5: "M11 22 Q18 31 25 22",
};

const FILL: Record<MoodLevel, string> = {
  1: "var(--color-brand-100)",
  2: "var(--color-brand-200)",
  3: "var(--color-sun-50)",
  4: "var(--color-sun-100)",
  5: "var(--color-sun-300)",
};

interface MoodFaceProps {
  level: MoodLevel;
  size?: number;
  /** Sem rótulo, o rosto é decorativo (quando o texto do humor aparece ao lado). */
  labelled?: boolean;
  className?: string;
}

/** Um rosto desenhado em SVG: a boca muda do 1 (muito mal) ao 5 (muito bem). */
export function MoodFace({ level, size = 36, labelled = false, className }: MoodFaceProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      className={className}
      role={labelled ? "img" : undefined}
      aria-label={labelled ? MOOD_LABELS[level] : undefined}
      aria-hidden={labelled ? undefined : true}
    >
      <circle cx="18" cy="18" r="16" fill={FILL[level]} />
      <circle cx="12.5" cy="15" r="1.8" fill="var(--color-brand-ink)" />
      <circle cx="23.5" cy="15" r="1.8" fill="var(--color-brand-ink)" />
      <path
        d={MOUTH[level]}
        fill="none"
        stroke="var(--color-brand-ink)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
