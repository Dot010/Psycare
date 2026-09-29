"use client";

export interface ErrorMessageProps {
  message?: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl text-center border border-red-200"
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
