"use client";

import Image from "next/image";
import { AnimatedText } from "@/components/motion/AnimatedText";
import { HeroCanvas } from "@/components/three/HeroCanvas";

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  imageSrc: string;
  imageAlt: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, imageSrc, imageAlt, children }: AuthLayoutProps) {
  return (
    <section className="bg-canvas min-h-screen flex items-center justify-center p-4">
      <div className="bg-surface flex rounded-xl shadow-sm border border-black/5 max-w-4xl w-full overflow-hidden min-h-137.5">
        <div className="md:w-1/2 w-full p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-2">
            <AnimatedText
              as="h1"
              text={title}
              className="text-3xl md:text-4xl font-semibold font-heading text-ink mb-2 leading-tight"
            />
            {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
          </div>

          {children}
        </div>

        <div className="hidden md:block md:w-1/2 relative bg-brand-50/40 p-4 overflow-hidden">
          <HeroCanvas />
          <div className="absolute inset-0 bg-linear-to-br from-brand-200/20 via-transparent to-taupe/20" />
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 768px) 0px, 50vw"
            className="object-cover mix-blend-multiply opacity-90"
          />
        </div>
      </div>
    </section>
  );
}
