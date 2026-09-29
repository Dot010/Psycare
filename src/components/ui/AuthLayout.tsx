"use client";

import Image from "next/image";
import SocialButtons from "@/components/SocialButtons";

export interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  imageSrc: string;
  imageAlt: string;
  children: React.ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  imageSrc,
  imageAlt,
  children,
}: AuthLayoutProps) {
  return (
    <section className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white flex rounded-2xl shadow-lg max-w-4xl w-full overflow-hidden min-h-[550px]">
        {/* Left side - Form */}
        <div className="md:w-1/2 w-full p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-slate-600 text-sm">{subtitle}</p>
            )}
          </div>

          {children}

          <SocialButtons />
        </div>

        {/* Right side - Image */}
        <div className="hidden md:block md:w-1/2 relative bg-emerald-50 p-4">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 768px) 0px, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
