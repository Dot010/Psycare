"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Professional } from "../identity";

const Ctx = createContext<Professional | null>(null);

export function ProIdentityProvider({ value, children }: { value: Professional; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Quem está usando a área do profissional, ou null fora dela (por exemplo, em testes de lógica). */
export function useMaybeProIdentity(): Professional | null {
  return useContext(Ctx);
}

export function useProIdentity(): Professional {
  const value = useContext(Ctx);
  if (!value) throw new Error("useProIdentity precisa estar dentro de ProIdentityProvider");
  return value;
}
