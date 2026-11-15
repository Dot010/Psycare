"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem<T extends string> {
  id: T;
  label: string;
}

interface UnderlineTabsProps<T extends string> {
  tabs: readonly TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Nome do grupo de abas para leitores de tela ("Seções de Saúde"). */
  label: string;
  className?: string;
}

/**
 * Abas sublinhadas, iguais ao menu do topo. Setas, Home e End trocam de aba (padrão WAI-ARIA):
 * só a aba ativa fica no Tab, para não obrigar a passar por todas.
 */
export function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  className,
}: UnderlineTabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = tabs.findIndex((t) => t.id === value);
    const keys: Record<string, number> = {
      ArrowRight: (current + 1) % tabs.length,
      ArrowLeft: (current - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("flex gap-x-6 gap-y-1 overflow-x-auto border-b border-border", className)}
    >
      {tabs.map((tab, index) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              "-mb-px min-h-11 shrink-0 border-b-2 text-[0.95rem] whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-brand-600/50 focus-visible:outline-none",
              selected
                ? "border-ink font-semibold text-ink"
                : "border-transparent text-muted-foreground hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/** O conteúdo de uma aba. Remonta ao trocar de aba, então as animações de entrada tocam de novo. */
export function TabPanel({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div role="tabpanel" aria-label={label} className={cn("animate-rise", className)}>
      {children}
    </div>
  );
}
