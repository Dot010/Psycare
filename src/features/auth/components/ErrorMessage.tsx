"use client";

export interface ErrorMessageProps {
  message?: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className="mt-4 p-3 bg-danger-50 text-danger-600 text-sm rounded-xl text-center border border-danger-300"
      role="alert"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
