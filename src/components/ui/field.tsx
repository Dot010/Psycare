import * as React from "react";
import { Input, fieldControlClass } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FieldShellProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

function FieldShell({ label, htmlFor, error, children, className }: FieldShellProps) {
  return (
    <div className={cn("w-full space-y-1", className)}>
      <label htmlFor={htmlFor} className="block text-xs font-medium text-slate-600">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

type FieldProps = React.ComponentProps<"input"> & { label: string; error?: string };

/** Campo de texto com rótulo e mensagem de erro ligados por id (acessível por padrão). */
export function Field({ label, error, id, className, ...props }: FieldProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;

  return (
    <FieldShell label={label} htmlFor={inputId} error={error}>
      <Input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={className}
        {...props}
      />
    </FieldShell>
  );
}

type SelectFieldProps = React.ComponentProps<"select"> & { label: string; error?: string };

export function SelectField({ label, error, id, className, children, ...props }: SelectFieldProps) {
  const autoId = React.useId();
  const selectId = id ?? autoId;

  return (
    <FieldShell label={label} htmlFor={selectId} error={error}>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${selectId}-error` : undefined}
        className={cn("h-10", fieldControlClass, className)}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}
