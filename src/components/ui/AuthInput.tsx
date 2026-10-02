"use client";

import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface AuthInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function AuthInput({
  label,
  error,
  className,
  id,
  ...props
}: AuthInputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-red-600 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
