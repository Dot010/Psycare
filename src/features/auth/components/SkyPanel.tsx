import { BrandMark } from "@/components/brand/BrandMark";

const PHRASES = ["Um lugar calmo para cuidar de você.", "Como você está hoje?", "Um passo de cada vez."];

/** Painel de marca do login: céu que muda devagar, esferas que respiram e frases que se alternam. */
export function SkyPanel() {
  return (
    <div className="relative h-56 overflow-hidden md:h-auto md:min-h-137.5">
      <div aria-hidden="true" className="animate-sky absolute inset-0 bg-[#f7eeb3]">
        <div className="absolute inset-0 bg-linear-to-b from-white/10 via-white/20 to-surface" />
        <div className="animate-orb absolute left-1/2 top-[18%] size-52 -translate-x-1/2 rounded-full bg-white/45 md:size-64" />
        <div className="animate-orb-reverse absolute left-1/2 top-[30%] size-32 -translate-x-1/2 rounded-full bg-brand-600/25 md:size-40" />
        <div className="animate-drift absolute left-8 top-[16%] size-12 rounded-full bg-white/50" />
        <div className="animate-drift-slow absolute bottom-[22%] right-9 size-8 rounded-full bg-white/50" />
      </div>
      <div className="relative flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <BrandMark className="size-12" />
        <p className="font-heading text-4xl font-semibold tracking-tight text-[#36461f]">PsyCare</p>
        <div className="relative h-6 w-72 text-sm text-[#4d1f1a]">
          {PHRASES.map((phrase, i) => (
            <span
              key={phrase}
              className="animate-phrase absolute inset-x-0"
              style={{ animationDelay: `${i * 4}s` }}
            >
              {phrase}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
