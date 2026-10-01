"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface AnimatedTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export function AnimatedText({ text, className, as = "h2" }: AnimatedTextProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      const chars = rootRef.current?.querySelectorAll("[data-char]");
      if (!chars?.length) return;

      gsap.set(chars, { yPercent: 120, opacity: 0 });

      gsap.to(chars, {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.02,
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 85%",
          once: true,
        },
      });
    },
    { scope: rootRef },
  );

  const Tag = as;

  return (
    <div ref={rootRef} className="overflow-hidden">
      <Tag className={cn("leading-tight", className)}>
        {Array.from(text).map((char, index) => (
          <span key={`${char}-${index}`} data-char className="inline-block will-change-transform">
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </Tag>
    </div>
  );
}
